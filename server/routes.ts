import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from './db.ts';
import type { IMember, IAttendance, IPayment } from './db.ts';

export const apiRouter = Router();

// Track API telemetry for MERN architecture visualizer
export const apiLogs: Array<{
  method: string;
  path: string;
  status: number;
  time: string;
  durationMs: number;
}> = [];

function recordLog(method: string, path: string, status: number, durationMs: number) {
  apiLogs.unshift({
    method,
    path,
    status,
    time: new Date().toLocaleTimeString(),
    durationMs: Math.round(durationMs),
  });
  if (apiLogs.length > 20) {
    apiLogs.pop();
  }
}

apiRouter.use((req: Request, res: Response, next) => {
  const start = performance.now();
  res.on('finish', () => {
    recordLog(req.method, req.baseUrl + req.path, res.statusCode, performance.now() - start);
  });
  next();
});

// GET /api/health
apiRouter.get('/health', (req: Request, res: Response) => {
  const stats = db.getStats();
  res.json({
    status: 'ok',
    engine: 'MERN Stack (MongoDB Collections + Express 4 + React 19 + Node.js)',
    nodeVersion: process.version,
    uptimeSec: Math.floor(process.uptime()),
    database: {
      type: 'MongoDB Document Collections',
      storage: 'Persistent JSON Store (data/mongodb_gym_store.json)',
      collections: stats.collections,
    },
    recentRequests: apiLogs.slice(0, 8),
  });
});

// GET /api/dashboard
apiRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    const today = new Date().toISOString().split('T')[0];

    const todayAttendance = await db.attendance.find(a => a.date === today);
    const expiringMembers = await db.members.find(m => m.status === 'expiring_soon' || m.status === 'expired');
    const recentPayments = (await db.payments.find()).slice(0, 5);
    const allMembers = await db.members.find();
    const allPlans = await db.plans.find();

    // Plan distribution count
    const planCounts: Record<string, number> = {};
    allPlans.forEach(p => { planCounts[p.name] = 0; });
    allMembers.forEach(m => {
      planCounts[m.planName] = (planCounts[m.planName] || 0) + 1;
    });

    res.json({
      stats,
      todayAttendance: todayAttendance.slice(0, 10),
      expiringMembers: expiringMembers.slice(0, 6),
      recentPayments,
      planDistribution: Object.entries(planCounts).map(([name, count]) => ({ name, count })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members
apiRouter.get('/members', async (req: Request, res: Response) => {
  try {
    const { q, status, planId } = req.query;
    let list = await db.members.find();

    if (status && status !== 'all') {
      list = list.filter(m => m.status === status);
    }
    if (planId && planId !== 'all') {
      list = list.filter(m => m.planId === planId);
    }
    if (q && typeof q === 'string') {
      const search = q.toLowerCase().trim();
      list = list.filter(
        m =>
          m.fullName.toLowerCase().includes(search) ||
          m.memberCode.toLowerCase().includes(search) ||
          m.phone.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search)
      );
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/members/:id
apiRouter.get('/members/:id', async (req: Request, res: Response) => {
  try {
    const member = await db.members.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    const attendance = await db.attendance.find(a => a.memberId === member._id);
    const payments = await db.payments.find(p => p.memberId === member._id);

    res.json({
      member,
      attendance: attendance.slice(0, 15),
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members
apiRouter.post('/members', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      planId,
      startDate,
      trainerId,
      emergencyContact,
      lockerNumber,
      notes,
      paymentMethod,
    } = req.body;

    if (!fullName || !phone || !planId) {
      return res.status(400).json({ error: 'Full name, phone, and membership plan are required.' });
    }

    const plan = await db.plans.findById(planId);
    if (!plan) {
      return res.status(400).json({ error: 'Selected membership plan does not exist.' });
    }

    let trainerName: string | undefined = undefined;
    if (trainerId) {
      const trainer = await db.trainers.findById(trainerId);
      if (trainer) {
        trainerName = trainer.name;
        // increment trainer clients
        await db.trainers.findByIdAndUpdate(trainerId, { activeClients: (trainer.activeClients || 0) + 1 });
      }
    }

    // Auto-generate sequential memberCode
    const existing = await db.members.find();
    const highestNum = existing.reduce((max, m) => {
      const match = m.memberCode?.match(/APX-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);
    const nextMemberCode = `APX-${highestNum + 1}`;

    const start = startDate ? new Date(startDate) : new Date();
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + plan.durationMonths);

    const startStr = start.toISOString().split('T')[0];
    const expiryStr = expiry.toISOString().split('T')[0];

    const newMember = await db.members.insertOne({
      memberCode: nextMemberCode,
      fullName: fullName.trim(),
      email: email ? email.trim() : '',
      phone: phone.trim(),
      gender: gender || 'Male',
      planId: plan._id,
      planName: plan.name,
      startDate: startStr,
      expiryDate: expiryStr,
      status: 'active',
      trainerId: trainerId || undefined,
      trainerName,
      emergencyContact: {
        name: emergencyContact?.name || '',
        phone: emergencyContact?.phone || '',
        relation: emergencyContact?.relation || '',
      },
      lockerNumber: lockerNumber ? lockerNumber.trim() : undefined,
      notes: notes ? notes.trim() : '',
      avatarSeed: fullName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Generate initial registration payment
    const totalPayments = await db.payments.countDocuments();
    const invNum = `INV-2026-${(totalPayments + 1).toString().padStart(3, '0')}`;
    await db.payments.insertOne({
      invoiceNumber: invNum,
      memberId: newMember._id,
      memberName: newMember.fullName,
      planId: plan._id,
      planName: plan.name,
      amount: plan.price,
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'Paid',
      paymentDate: startStr,
      receiptNotes: `Initial membership registration for ${plan.name} (${plan.durationMonths} Months)`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newMember);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/members/:id
apiRouter.put('/members/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.members.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const {
      fullName,
      email,
      phone,
      gender,
      planId,
      startDate,
      expiryDate,
      trainerId,
      emergencyContact,
      lockerNumber,
      notes,
    } = req.body;

    let planName = existing.planName;
    if (planId && planId !== existing.planId) {
      const plan = await db.plans.findById(planId);
      if (plan) planName = plan.name;
    }

    let trainerName = existing.trainerName;
    if (trainerId !== undefined) {
      if (trainerId) {
        const trainer = await db.trainers.findById(trainerId);
        trainerName = trainer ? trainer.name : undefined;
      } else {
        trainerName = undefined;
      }
    }

    // Recalculate status if expiryDate changed
    let status = existing.status;
    const targetExpiry = expiryDate || existing.expiryDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(targetExpiry);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) status = 'expired';
    else if (diffDays <= 7) status = 'expiring_soon';
    else status = 'active';

    const updated = await db.members.findByIdAndUpdate(id, {
      ...(fullName && { fullName: fullName.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(gender && { gender }),
      ...(planId && { planId, planName }),
      ...(startDate && { startDate }),
      ...(expiryDate && { expiryDate }),
      status,
      trainerId: trainerId || undefined,
      trainerName,
      ...(emergencyContact && { emergencyContact }),
      ...(lockerNumber !== undefined && { lockerNumber: lockerNumber.trim() || undefined }),
      ...(notes !== undefined && { notes }),
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/members/:id
apiRouter.delete('/members/:id', async (req: Request, res: Response) => {
  try {
    const success = await db.members.findByIdAndDelete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/members/:id/renew
apiRouter.post('/members/:id/renew', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const member = await db.members.findById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const { planId, paymentMethod, customMonths } = req.body;
    const targetPlanId = planId || member.planId;
    const plan = await db.plans.findById(targetPlanId);
    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const monthsToAdd = customMonths ? parseInt(customMonths, 10) : plan.durationMonths;

    // If currently expired, start from today; if still active, extend from current expiryDate
    const today = new Date();
    const currentExpiry = new Date(member.expiryDate);
    const baseDate = currentExpiry > today ? currentExpiry : today;

    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + monthsToAdd);
    const newExpiryStr = newExpiry.toISOString().split('T')[0];

    const updated = await db.members.findByIdAndUpdate(id, {
      planId: plan._id,
      planName: plan.name,
      expiryDate: newExpiryStr,
      status: 'active',
    });

    // Record renewal payment
    const totalPayments = await db.payments.countDocuments();
    const invNum = `INV-2026-${(totalPayments + 1).toString().padStart(3, '0')}`;
    await db.payments.insertOne({
      invoiceNumber: invNum,
      memberId: member._id,
      memberName: member.fullName,
      planId: plan._id,
      planName: plan.name,
      amount: plan.price,
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptNotes: `Membership renewal for ${plan.name} (+${monthsToAdd} Months)`,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      member: updated,
      message: `Membership successfully renewed until ${newExpiryStr}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plans
apiRouter.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await db.plans.find();
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plans
apiRouter.post('/plans', async (req: Request, res: Response) => {
  try {
    const { name, audience, price, durationMonths, features, accessHours, isPopular } = req.body;
    if (!name || price === undefined || !durationMonths) {
      return res.status(400).json({ error: 'Name, price, and duration are required.' });
    }

    const featureList = Array.isArray(features)
      ? features
      : typeof features === 'string'
      ? features.split('\n').map((f: string) => f.trim()).filter(Boolean)
      : [];

    const newPlan = await db.plans.insertOne({
      name: name.trim(),
      audience: audience ? audience.trim() : 'General Fitness',
      price: Number(price),
      durationMonths: Number(durationMonths),
      features: featureList.length > 0 ? featureList : ['Full Gym Access'],
      accessHours: accessHours ? accessHours.trim() : '05:00 - 23:00',
      isPopular: Boolean(isPopular),
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newPlan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/plans/:id
apiRouter.put('/plans/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, audience, price, durationMonths, features, accessHours, isPopular, isActive } = req.body;

    const featureList = Array.isArray(features)
      ? features
      : typeof features === 'string'
      ? features.split('\n').map((f: string) => f.trim()).filter(Boolean)
      : undefined;

    const updated = await db.plans.findByIdAndUpdate(id, {
      ...(name && { name: name.trim() }),
      ...(audience && { audience: audience.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(durationMonths !== undefined && { durationMonths: Number(durationMonths) }),
      ...(featureList && { features: featureList }),
      ...(accessHours && { accessHours: accessHours.trim() }),
      ...(isPopular !== undefined && { isPopular: Boolean(isPopular) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    });

    if (!updated) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/plans/:id
apiRouter.delete('/api/plans/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.plans.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Plan not found' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trainers
apiRouter.get('/trainers', async (req: Request, res: Response) => {
  try {
    const trainers = await db.trainers.find();
    res.json(trainers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trainers
apiRouter.post('/trainers', async (req: Request, res: Response) => {
  try {
    const { name, specialty, phone, email, experienceYears, bio } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ error: 'Name and specialty are required.' });
    }

    const colors = ['bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-cyan-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newTrainer = await db.trainers.insertOne({
      name: name.trim(),
      specialty: specialty.trim(),
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      experienceYears: Number(experienceYears) || 3,
      activeClients: 0,
      rating: 5.0,
      bio: bio ? bio.trim() : '',
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newTrainer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/attendance
apiRouter.get('/attendance', async (req: Request, res: Response) => {
  try {
    const { date, memberId } = req.query;
    let list = await db.attendance.find();

    if (date && typeof date === 'string') {
      list = list.filter(a => a.date === date);
    }
    if (memberId && typeof memberId === 'string') {
      list = list.filter(a => a.memberId === memberId);
    }

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/attendance/checkin
apiRouter.post('/attendance/checkin', async (req: Request, res: Response) => {
  try {
    const { identifier, method } = req.body; // memberCode, id, or name
    if (!identifier) {
      return res.status(400).json({ error: 'Please enter a Member ID (e.g. APX-1001) or Member Name.' });
    }

    const trimmed = identifier.trim().toLowerCase();
    const member = await db.members.findOne(m =>
      m._id === identifier ||
      m.memberCode.toLowerCase() === trimmed ||
      m.fullName.toLowerCase() === trimmed ||
      m.phone.replace(/\D/g, '') === identifier.replace(/\D/g, '')
    );

    if (!member) {
      return res.status(404).json({ error: `Member not found matching "${identifier}".` });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if membership is expired
    if (member.status === 'expired') {
      return res.status(403).json({
        error: `Membership for ${member.fullName} (${member.memberCode}) expired on ${member.expiryDate}. Please renew membership first.`,
        member,
        requiresRenewal: true,
      });
    }

    // Check if already checked in and not checked out
    const activeCheckin = await db.attendance.findOne(
      a => a.memberId === member._id && a.date === today && a.status === 'Checked In'
    );

    if (activeCheckin) {
      return res.status(409).json({
        error: `${member.fullName} is already checked in today at ${new Date(activeCheckin.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        alreadyCheckedIn: true,
        attendanceId: activeCheckin._id,
      });
    }

    const now = new Date();
    const newRecord = await db.attendance.insertOne({
      memberId: member._id,
      memberCode: member.memberCode,
      memberName: member.fullName,
      planName: member.planName,
      checkInTime: now.toISOString(),
      checkOutTime: null,
      status: 'Checked In',
      date: today,
      method: method || 'Barcode/ID',
      createdAt: now.toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Welcome, ${member.fullName}! Check-in recorded at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      attendance: newRecord,
      member,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/attendance/checkout
apiRouter.post('/attendance/checkout', async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.body;
    if (!attendanceId) {
      return res.status(400).json({ error: 'attendanceId is required.' });
    }

    const record = await db.attendance.findById(attendanceId);
    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    const now = new Date();
    const updated = await db.attendance.findByIdAndUpdate(attendanceId, {
      checkOutTime: now.toISOString(),
      status: 'Completed',
    });

    res.json({
      success: true,
      message: `${record.memberName} checked out successfully.`,
      attendance: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/payments
apiRouter.get('/payments', async (req: Request, res: Response) => {
  try {
    const list = await db.payments.find();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payments
apiRouter.post('/payments', async (req: Request, res: Response) => {
  try {
    const { memberId, planId, amount, paymentMethod, receiptNotes } = req.body;
    if (!memberId || !amount) {
      return res.status(400).json({ error: 'Member and amount are required.' });
    }

    const member = await db.members.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const total = await db.payments.countDocuments();
    const invNum = `INV-2026-${(total + 1).toString().padStart(3, '0')}`;

    const newPayment = await db.payments.insertOne({
      invoiceNumber: invNum,
      memberId: member._id,
      memberName: member.fullName,
      planId: planId || member.planId,
      planName: member.planName,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptNotes: receiptNotes || 'Gym service fee / manual billing',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newPayment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/reset
apiRouter.post('/system/reset', (req: Request, res: Response) => {
  db.resetToDefault();
  res.json({ success: true, message: 'Database reset to default seed data successfully.' });
});
