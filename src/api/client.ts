import {
  IMember,
  IPlan,
  ITrainer,
  IAttendance,
  IPayment,
  IDashboardData,
  IHealthData,
} from '../types/index.ts';

// Initial fallback mock data for static GitHub Pages hosting
const INITIAL_PLANS: IPlan[] = [
  {
    _id: '674f2001a1b2c3d4e5f60010',
    name: 'Monthly Standard',
    audience: 'For consistent gym-goers',
    price: 55,
    durationMonths: 1,
    features: ['Unrestricted gym floor access', 'Locker room & power showers', 'Standard equipment & turf area'],
    accessHours: '05:00 - 23:00 Daily',
    isPopular: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    _id: '674f2001a1b2c3d4e5f60011',
    name: 'Quarterly Strength',
    audience: 'For committed progression',
    price: 150,
    durationMonths: 3,
    features: ['Everything in Standard plan', '1 complimentary trainer assessment', 'Body composition scan every 30 days', 'Sauna & cold plunge access'],
    accessHours: '24/7 Keycard Access',
    isPopular: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    _id: '674f2001a1b2c3d4e5f60012',
    name: 'Annual VIP Elite',
    audience: 'For dedicated athletes',
    price: 520,
    durationMonths: 12,
    features: ['All gym & recovery amenities 24/7', 'Permanent private locker reserved', 'Monthly 1-on-1 personal training', 'Unlimited guest passes'],
    accessHours: '24/7 All Access + Reserved Bay',
    isPopular: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    _id: '674f2001a1b2c3d4e5f60013',
    name: 'Student & Youth Special',
    audience: 'For accredited students',
    price: 39,
    durationMonths: 1,
    features: ['Off-peak floor access (08:00 - 16:00)', 'Full free-weight & cardio equipment', 'Valid student ID required'],
    accessHours: '08:00 - 16:00 Weekdays',
    isPopular: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

const INITIAL_TRAINERS: ITrainer[] = [
  {
    _id: '674f1001a1b2c3d4e5f60001',
    name: 'Alex Rivera',
    specialty: 'Hypertrophy & Powerlifting',
    phone: '+1 (555) 234-8901',
    email: 'alex.rivera@apexiron.com',
    experienceYears: 7,
    activeClients: 14,
    rating: 4.9,
    bio: 'Former collegiate powerlifting coach specializing in barbell biomechanics and progressive overload periodization.',
    avatarColor: 'bg-amber-600',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    _id: '674f1001a1b2c3d4e5f60002',
    name: 'Sarah Chen',
    specialty: 'Functional Mobility & HIIT',
    phone: '+1 (555) 345-6789',
    email: 'sarah.chen@apexiron.com',
    experienceYears: 5,
    activeClients: 18,
    rating: 4.95,
    bio: 'Certified CSCS & functional movement specialist focusing on joint longevity, agility, and high-intensity conditioning.',
    avatarColor: 'bg-emerald-600',
    createdAt: '2025-01-12T09:30:00.000Z',
  },
  {
    _id: '674f1001a1b2c3d4e5f60003',
    name: 'Marcus Vance',
    specialty: 'Body Recomposition & Nutrition',
    phone: '+1 (555) 456-7890',
    email: 'marcus.vance@apexiron.com',
    experienceYears: 9,
    activeClients: 16,
    rating: 4.88,
    bio: 'Sports nutritionist and hypertrophy coach dedicated to evidence-based macro tracking and sustainable muscle growth.',
    avatarColor: 'bg-blue-600',
    createdAt: '2025-01-15T11:00:00.000Z',
  },
];

function getLocalStore() {
  const stored = localStorage.getItem('apex_gym_store');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  const today = new Date().toISOString().split('T')[0];
  const initial = {
    members: [
      {
        _id: 'mem_1',
        memberCode: 'APX-1001',
        fullName: 'David Miller',
        email: 'david.miller@example.com',
        phone: '+1 (555) 789-0123',
        gender: 'Male',
        planId: INITIAL_PLANS[1]._id,
        planName: INITIAL_PLANS[1].name,
        startDate: '2026-09-10',
        expiryDate: '2026-12-10',
        status: 'active',
        trainerId: INITIAL_TRAINERS[0]._id,
        trainerName: INITIAL_TRAINERS[0].name,
        emergencyContact: { name: 'Rachel Miller', phone: '+1 (555) 789-9999', relation: 'Spouse' },
        lockerNumber: 'L-14',
        notes: 'Targeting 500lb deadlift milestone; training 4x weekly.',
        createdAt: '2026-09-10T09:00:00.000Z',
        updatedAt: '2026-09-10T09:00:00.000Z',
      },
      {
        _id: 'mem_2',
        memberCode: 'APX-1002',
        fullName: 'Emma Watson',
        email: 'emma.watson@example.com',
        phone: '+1 (555) 890-1234',
        gender: 'Female',
        planId: INITIAL_PLANS[2]._id,
        planName: INITIAL_PLANS[2].name,
        startDate: '2026-08-15',
        expiryDate: '2027-02-15',
        status: 'active',
        trainerId: INITIAL_TRAINERS[1]._id,
        trainerName: INITIAL_TRAINERS[1].name,
        emergencyContact: { name: 'Thomas Watson', phone: '+1 (555) 890-9999', relation: 'Brother' },
        lockerNumber: 'L-03',
        notes: 'Morning routine athlete; sauna after lifting.',
        createdAt: '2026-08-15T07:30:00.000Z',
        updatedAt: '2026-08-15T07:30:00.000Z',
      },
      {
        _id: 'mem_3',
        memberCode: 'APX-1003',
        fullName: 'James Sterling',
        email: 'j.sterling@example.com',
        phone: '+1 (555) 901-2345',
        gender: 'Male',
        planId: INITIAL_PLANS[0]._id,
        planName: INITIAL_PLANS[0].name,
        startDate: '2026-09-05',
        expiryDate: '2026-10-05',
        status: 'expiring_soon',
        emergencyContact: { name: 'Claire', phone: '+1 (555) 901-8888', relation: 'Sister' },
        notes: 'Renewal notice sent via SMS.',
        createdAt: '2026-09-05T12:00:00.000Z',
        updatedAt: '2026-09-05T12:00:00.000Z',
      },
    ],
    plans: INITIAL_PLANS,
    trainers: INITIAL_TRAINERS,
    attendance: [
      {
        _id: 'att_1',
        memberId: 'mem_2',
        memberCode: 'APX-1002',
        memberName: 'Emma Watson',
        planName: 'Annual VIP Elite',
        checkInTime: new Date(Date.now() - 3600000).toISOString(),
        checkOutTime: null,
        status: 'Checked In',
        date: today,
        method: 'Barcode/ID',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'att_2',
        memberId: 'mem_1',
        memberCode: 'APX-1001',
        memberName: 'David Miller',
        planName: 'Quarterly Strength',
        checkInTime: new Date(Date.now() - 7200000).toISOString(),
        checkOutTime: new Date(Date.now() - 1800000).toISOString(),
        status: 'Completed',
        date: today,
        method: 'Barcode/ID',
        createdAt: new Date().toISOString(),
      },
    ],
    payments: [
      {
        _id: 'pay_1',
        invoiceNumber: 'INV-2026-001',
        memberId: 'mem_2',
        memberName: 'Emma Watson',
        planId: INITIAL_PLANS[2]._id,
        planName: INITIAL_PLANS[2].name,
        amount: 520,
        paymentMethod: 'Credit Card',
        status: 'Paid',
        paymentDate: '2026-08-15',
        receiptNotes: 'VIP Elite registration',
        createdAt: '2026-08-15T07:35:00.000Z',
      },
    ],
  };
  localStorage.setItem('apex_gym_store', JSON.stringify(initial));
  return initial;
}

function saveLocalStore(store: any) {
  localStorage.setItem('apex_gym_store', JSON.stringify(store));
}

let isStaticFallback = false;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!isStaticFallback) {
    try {
      const res = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (res.status === 404 || res.status === 502) {
        // Fallback for static hosting like GitHub Pages
        isStaticFallback = true;
      } else {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `HTTP error ${res.status}`);
        }
        return data;
      }
    } catch (e: any) {
      // If network fails (e.g. static host without /api backend), switch to local storage
      isStaticFallback = true;
    }
  }

  // Handle in-browser local storage mock for GitHub Pages
  return handleStaticFallback<T>(endpoint, options);
}

function handleStaticFallback<T>(endpoint: string, options?: RequestInit): T {
  const store = getLocalStore();
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : {};
  const today = new Date().toISOString().split('T')[0];

  if (endpoint.startsWith('/health')) {
    return {
      status: 'ok',
      engine: 'MERN Stack Client (GitHub Pages Static Mode)',
      nodeVersion: 'Static Web Client',
      uptimeSec: Math.floor(performance.now() / 1000),
      database: {
        type: 'MongoDB Document Engine (Local Storage)',
        storage: 'Browser Persistent JSON Storage',
        collections: {
          members: store.members.length,
          plans: store.plans.length,
          trainers: store.trainers.length,
          attendance: store.attendance.length,
          payments: store.payments.length,
        },
      },
      recentRequests: [
        { method: 'GET', path: '/api/dashboard', status: 200, time: 'Just now', durationMs: 2 },
      ],
    } as T;
  }

  if (endpoint.startsWith('/dashboard')) {
    const todayAtt = store.attendance.filter((a: any) => a.date === today);
    return {
      stats: {
        totalMembers: store.members.length,
        activeMembers: store.members.filter((m: any) => m.status === 'active').length,
        expiringSoon: store.members.filter((m: any) => m.status === 'expiring_soon').length,
        expiredCount: store.members.filter((m: any) => m.status === 'expired').length,
        currentlyInGym: todayAtt.filter((a: any) => a.status === 'Checked In').length,
        totalTodayCheckins: todayAtt.length,
        totalRevenue: store.payments.reduce((sum: number, p: any) => sum + p.amount, 0),
        plansCount: store.plans.length,
        trainersCount: store.trainers.length,
        collections: {
          members: store.members.length,
          plans: store.plans.length,
          trainers: store.trainers.length,
          attendance: store.attendance.length,
          payments: store.payments.length,
        },
      },
      todayAttendance: todayAtt,
      expiringMembers: store.members.filter((m: any) => m.status === 'expiring_soon' || m.status === 'expired'),
      recentPayments: store.payments.slice(0, 5),
      planDistribution: store.plans.map((p: any) => ({
        name: p.name,
        count: store.members.filter((m: any) => m.planId === p._id).length,
      })),
    } as T;
  }

  if (endpoint.startsWith('/members')) {
    if (method === 'GET') {
      const matchId = endpoint.match(/\/members\/([^?]+)/);
      if (matchId) {
        const mem = store.members.find((m: any) => m._id === matchId[1]);
        const att = store.attendance.filter((a: any) => a.memberId === matchId[1]);
        const pay = store.payments.filter((p: any) => p.memberId === matchId[1]);
        return { member: mem, attendance: att, payments: pay } as T;
      }
      return store.members as T;
    }
    if (method === 'POST' && endpoint.includes('/renew')) {
      const matchId = endpoint.match(/\/members\/([^/]+)\/renew/);
      const member = store.members.find((m: any) => m._id === matchId?.[1]);
      const plan = store.plans.find((p: any) => p._id === (body.planId || member.planId));
      member.expiryDate = new Date(Date.now() + (plan?.durationMonths || 1) * 30 * 86400000)
        .toISOString()
        .split('T')[0];
      member.status = 'active';
      store.payments.unshift({
        _id: 'pay_' + Date.now(),
        invoiceNumber: `INV-2026-${(store.payments.length + 1).toString().padStart(3, '0')}`,
        memberId: member._id,
        memberName: member.fullName,
        planId: plan._id,
        planName: plan.name,
        amount: plan.price,
        paymentMethod: body.paymentMethod || 'Credit Card',
        status: 'Paid',
        paymentDate: today,
        receiptNotes: `Renewal for ${plan.name}`,
        createdAt: new Date().toISOString(),
      });
      saveLocalStore(store);
      return { success: true, member, message: `Renewed until ${member.expiryDate}` } as T;
    }
    if (method === 'POST') {
      const nextCode = `APX-${1000 + store.members.length + 1}`;
      const plan = store.plans.find((p: any) => p._id === body.planId) || store.plans[0];
      const expiry = new Date(Date.now() + plan.durationMonths * 30 * 86400000)
        .toISOString()
        .split('T')[0];
      const newMember: IMember = {
        _id: 'mem_' + Date.now(),
        memberCode: nextCode,
        fullName: body.fullName,
        email: body.email || '',
        phone: body.phone,
        gender: body.gender || 'Male',
        planId: plan._id,
        planName: plan.name,
        startDate: body.startDate || today,
        expiryDate: expiry,
        status: 'active',
        trainerId: body.trainerId,
        emergencyContact: body.emergencyContact || { name: '', phone: '', relation: '' },
        lockerNumber: body.lockerNumber,
        notes: body.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.members.unshift(newMember);
      store.payments.unshift({
        _id: 'pay_' + Date.now(),
        invoiceNumber: `INV-2026-${(store.payments.length + 1).toString().padStart(3, '0')}`,
        memberId: newMember._id,
        memberName: newMember.fullName,
        planId: plan._id,
        planName: plan.name,
        amount: plan.price,
        paymentMethod: body.paymentMethod || 'Credit Card',
        status: 'Paid',
        paymentDate: today,
        receiptNotes: `Registration for ${plan.name}`,
        createdAt: new Date().toISOString(),
      });
      saveLocalStore(store);
      return newMember as T;
    }
    if (method === 'DELETE') {
      const matchId = endpoint.match(/\/members\/([^?]+)/);
      store.members = store.members.filter((m: any) => m._id !== matchId?.[1]);
      saveLocalStore(store);
      return { success: true, message: 'Deleted' } as T;
    }
  }

  if (endpoint.startsWith('/plans')) {
    if (method === 'GET') return store.plans as T;
    if (method === 'POST') {
      const newPlan: IPlan = {
        _id: 'plan_' + Date.now(),
        name: body.name,
        audience: body.audience || 'Fitness',
        price: Number(body.price),
        durationMonths: Number(body.durationMonths),
        features: Array.isArray(body.features) ? body.features : ['Full Access'],
        accessHours: body.accessHours || '05:00 - 23:00',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      store.plans.push(newPlan);
      saveLocalStore(store);
      return newPlan as T;
    }
  }

  if (endpoint.startsWith('/trainers')) {
    if (method === 'GET') return store.trainers as T;
    if (method === 'POST') {
      const newTrainer: ITrainer = {
        _id: 'trn_' + Date.now(),
        name: body.name,
        specialty: body.specialty,
        phone: body.phone || '',
        email: body.email || '',
        experienceYears: Number(body.experienceYears) || 3,
        activeClients: 0,
        rating: 5.0,
        bio: body.bio || '',
        avatarColor: 'bg-orange-600',
        createdAt: new Date().toISOString(),
      };
      store.trainers.push(newTrainer);
      saveLocalStore(store);
      return newTrainer as T;
    }
  }

  if (endpoint.startsWith('/attendance')) {
    if (method === 'GET') return store.attendance as T;
    if (method === 'POST' && endpoint.includes('/checkin')) {
      const target = body.identifier?.trim().toLowerCase();
      const member = store.members.find(
        (m: any) =>
          m.memberCode.toLowerCase() === target ||
          m.fullName.toLowerCase().includes(target) ||
          m._id === body.identifier
      );
      if (!member) throw new Error(`Member not found matching "${body.identifier}"`);
      const existing = store.attendance.find(
        (a: any) => a.memberId === member._id && a.date === today && a.status === 'Checked In'
      );
      if (existing) throw new Error(`${member.fullName} is already checked in today.`);
      const newAtt: IAttendance = {
        _id: 'att_' + Date.now(),
        memberId: member._id,
        memberCode: member.memberCode,
        memberName: member.fullName,
        planName: member.planName,
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        status: 'Checked In',
        date: today,
        method: body.method || 'Barcode/ID',
        createdAt: new Date().toISOString(),
      };
      store.attendance.unshift(newAtt);
      saveLocalStore(store);
      return { success: true, message: `Welcome, ${member.fullName}!`, attendance: newAtt, member } as T;
    }
    if (method === 'POST' && endpoint.includes('/checkout')) {
      const att = store.attendance.find((a: any) => a._id === body.attendanceId);
      if (att) {
        att.checkOutTime = new Date().toISOString();
        att.status = 'Completed';
      }
      saveLocalStore(store);
      return { success: true, message: 'Checked out', attendance: att } as T;
    }
  }

  if (endpoint.startsWith('/payments')) {
    if (method === 'GET') return store.payments as T;
    if (method === 'POST') {
      const member = store.members.find((m: any) => m._id === body.memberId);
      const newPay: IPayment = {
        _id: 'pay_' + Date.now(),
        invoiceNumber: `INV-2026-${(store.payments.length + 1).toString().padStart(3, '0')}`,
        memberId: member?._id || 'unknown',
        memberName: member?.fullName || 'Walk-in',
        planId: body.planId || member?.planId || 'custom',
        planName: member?.planName || 'Gym Service',
        amount: Number(body.amount),
        paymentMethod: body.paymentMethod || 'Cash',
        status: 'Paid',
        paymentDate: today,
        receiptNotes: body.receiptNotes || 'Gym service fee',
        createdAt: new Date().toISOString(),
      };
      store.payments.unshift(newPay);
      saveLocalStore(store);
      return newPay as T;
    }
  }

  return {} as T;
}

export const api = {
  getHealth: () => request<IHealthData>('/health'),
  resetDemoData: () => request<{ success: boolean; message: string }>('/system/reset', { method: 'POST' }),
  getDashboard: () => request<IDashboardData>('/dashboard'),
  getMembers: (params?: { q?: string; status?: string; planId?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status) query.set('status', params.status);
    if (params?.planId) query.set('planId', params.planId);
    const qs = query.toString();
    return request<IMember[]>(`/members${qs ? `?${qs}` : ''}`);
  },
  getMember: (id: string) =>
    request<{ member: IMember; attendance: IAttendance[]; payments: IPayment[] }>(`/members/${id}`),
  createMember: (memberData: any) =>
    request<IMember>('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),
  updateMember: (id: string, memberData: any) =>
    request<IMember>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    }),
  deleteMember: (id: string) =>
    request<{ success: boolean; message: string }>(`/members/${id}`, {
      method: 'DELETE',
    }),
  renewMember: (id: string, renewalData: { planId?: string; paymentMethod?: string; customMonths?: number }) =>
    request<{ success: boolean; member: IMember; message: string }>(`/members/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(renewalData),
    }),
  getPlans: () => request<IPlan[]>('/plans'),
  createPlan: (planData: Partial<IPlan>) =>
    request<IPlan>('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    }),
  updatePlan: (id: string, planData: Partial<IPlan>) =>
    request<IPlan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    }),
  deletePlan: (id: string) =>
    request<{ success: boolean }>(`/plans/${id}`, {
      method: 'DELETE',
    }),
  getTrainers: () => request<ITrainer[]>('/trainers'),
  createTrainer: (trainerData: Partial<ITrainer>) =>
    request<ITrainer>('/trainers', {
      method: 'POST',
      body: JSON.stringify(trainerData),
    }),
  getAttendance: (params?: { date?: string; memberId?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.memberId) query.set('memberId', params.memberId);
    const qs = query.toString();
    return request<IAttendance[]>(`/attendance${qs ? `?${qs}` : ''}`);
  },
  checkIn: (identifier: string, method: 'Barcode/ID' | 'Manual' = 'Barcode/ID') =>
    request<{
      success: boolean;
      message: string;
      attendance: IAttendance;
      member: IMember;
    }>('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify({ identifier, method }),
    }),
  checkOut: (attendanceId: string) =>
    request<{ success: boolean; message: string; attendance: IAttendance }>('/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify({ attendanceId }),
    }),
  getPayments: () => request<IPayment[]>('/payments'),
  createPayment: (paymentData: Partial<IPayment>) =>
    request<IPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};
