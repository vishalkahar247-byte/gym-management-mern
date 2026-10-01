import fs from 'fs';
import path from 'path';

export interface IMember {
  _id: string;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'inactive';
  trainerId?: string;
  trainerName?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  lockerNumber?: string;
  notes?: string;
  avatarSeed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPlan {
  _id: string;
  name: string;
  audience: string;
  price: number;
  durationMonths: number;
  features: string[];
  accessHours: string;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ITrainer {
  _id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experienceYears: number;
  activeClients: number;
  rating: number;
  bio: string;
  avatarColor: string;
  createdAt: string;
}

export interface IAttendance {
  _id: string;
  memberId: string;
  memberCode: string;
  memberName: string;
  planName: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'Checked In' | 'Completed';
  date: string; // YYYY-MM-DD
  method: 'Barcode/ID' | 'Manual';
  createdAt: string;
}

export interface IPayment {
  _id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'UPI/Online';
  status: 'Paid' | 'Pending' | 'Refunded';
  paymentDate: string;
  receiptNotes?: string;
  createdAt: string;
}

export interface IDatabaseSchema {
  members: IMember[];
  plans: IPlan[];
  trainers: ITrainer[];
  attendance: IAttendance[];
  payments: IPayment[];
}

function generateMongoId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return `${timestamp}${machine}${pid}${increment}`;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'mongodb_gym_store.json');

function calculateStatus(expiryDate: string): 'active' | 'expiring_soon' | 'expired' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring_soon';
  return 'active';
}

function getInitialData(): IDatabaseSchema {
  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  const todayStr = formatYMD(today);
  const dMinus2 = formatYMD(new Date(today.getTime() - 2 * 86400000));
  const dMinus10 = formatYMD(new Date(today.getTime() - 10 * 86400000));
  const dMinus20 = formatYMD(new Date(today.getTime() - 20 * 86400000));
  const dMinus45 = formatYMD(new Date(today.getTime() - 45 * 86400000));

  const dPlus3 = formatYMD(new Date(today.getTime() + 3 * 86400000));
  const dPlus5 = formatYMD(new Date(today.getTime() + 5 * 86400000));
  const dPlus25 = formatYMD(new Date(today.getTime() + 25 * 86400000));
  const dPlus60 = formatYMD(new Date(today.getTime() + 60 * 86400000));
  const dPlus180 = formatYMD(new Date(today.getTime() + 180 * 86400000));
  const dPastExpired = formatYMD(new Date(today.getTime() - 5 * 86400000));

  const trainers: ITrainer[] = [
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
    {
      _id: '674f1001a1b2c3d4e5f60004',
      name: 'Elena Rostova',
      specialty: 'Olympic Weightlifting & Core',
      phone: '+1 (555) 567-8901',
      email: 'elena.rostova@apexiron.com',
      experienceYears: 6,
      activeClients: 11,
      rating: 4.92,
      bio: 'USA Weightlifting Level 2 certified coach specializing in clean & jerk, snatch technique, and explosive posterior chain power.',
      avatarColor: 'bg-purple-600',
      createdAt: '2025-02-01T10:00:00.000Z',
    },
  ];

  const plans: IPlan[] = [
    {
      _id: '674f2001a1b2c3d4e5f60010',
      name: 'Monthly Standard',
      audience: 'For consistent gym-goers',
      price: 55,
      durationMonths: 1,
      features: [
        'Unrestricted gym floor access',
        'Locker room & power showers',
        'Standard equipment & turf area',
        'Mobile check-in pass',
      ],
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
      features: [
        'Everything in Standard plan',
        '1 complimentary trainer assessment',
        'Body composition scan every 30 days',
        'Sauna & cold plunge access',
        '10% off pro-shop supplements',
      ],
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
      features: [
        'All gym & recovery amenities 24/7',
        'Permanent private locker reserved',
        'Monthly 1-on-1 personal training session',
        'Unlimited guest passes (2 per month)',
        'Free laundry service for gym attire',
        'Access to lifting platform reservations',
      ],
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
      features: [
        'Off-peak floor access (08:00 - 16:00)',
        'Full free-weight & cardio equipment',
        'Digital workout log support',
        'Valid student ID required',
      ],
      accessHours: '08:00 - 16:00 Weekdays, All-day Weekends',
      isPopular: false,
      isActive: true,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const members: IMember[] = [
    {
      _id: '674f3001a1b2c3d4e5f60101',
      memberCode: 'APX-1001',
      fullName: 'David Miller',
      email: 'david.miller@example.com',
      phone: '+1 (555) 789-0123',
      gender: 'Male',
      planId: plans[1]._id,
      planName: plans[1].name,
      startDate: dMinus20,
      expiryDate: dPlus60,
      status: 'active',
      trainerId: trainers[0]._id,
      trainerName: trainers[0].name,
      emergencyContact: {
        name: 'Rachel Miller',
        phone: '+1 (555) 789-9999',
        relation: 'Spouse',
      },
      lockerNumber: 'L-14',
      notes: 'Focusing on 500lb deadlift milestone; training 4x weekly.',
      createdAt: `${dMinus20}T09:00:00.000Z`,
      updatedAt: `${dMinus2}T10:15:00.000Z`,
    },
    {
      _id: '674f3001a1b2c3d4e5f60102',
      memberCode: 'APX-1002',
      fullName: 'Emma Watson',
      email: 'emma.watson@example.com',
      phone: '+1 (555) 890-1234',
      gender: 'Female',
      planId: plans[2]._id,
      planName: plans[2].name,
      startDate: dMinus45,
      expiryDate: dPlus180,
      status: 'active',
      trainerId: trainers[1]._id,
      trainerName: trainers[1].name,
      emergencyContact: {
        name: 'Thomas Watson',
        phone: '+1 (555) 890-9999',
        relation: 'Brother',
      },
      lockerNumber: 'L-03',
      notes: 'Morning routine athlete; incorporates cold plunge after sessions.',
      createdAt: `${dMinus45}T07:30:00.000Z`,
      updatedAt: `${todayStr}T08:00:00.000Z`,
    },
    {
      _id: '674f3001a1b2c3d4e5f60103',
      memberCode: 'APX-1003',
      fullName: 'James Sterling',
      email: 'j.sterling@example.com',
      phone: '+1 (555) 901-2345',
      gender: 'Male',
      planId: plans[0]._id,
      planName: plans[0].name,
      startDate: dMinus20,
      expiryDate: dPlus3,
      status: 'expiring_soon',
      trainerId: undefined,
      emergencyContact: {
        name: 'Claire Sterling',
        phone: '+1 (555) 901-8888',
        relation: 'Sister',
      },
      lockerNumber: 'L-22',
      notes: 'Renewal notice sent via SMS; considers upgrading to Quarterly.',
      createdAt: `${dMinus20}T12:00:00.000Z`,
      updatedAt: `${todayStr}T09:00:00.000Z`,
    },
    {
      _id: '674f3001a1b2c3d4e5f60104',
      memberCode: 'APX-1004',
      fullName: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (555) 012-3456',
      gender: 'Female',
      planId: plans[0]._id,
      planName: plans[0].name,
      startDate: dMinus45,
      expiryDate: dPastExpired,
      status: 'expired',
      trainerId: trainers[3]._id,
      trainerName: trainers[3].name,
      emergencyContact: {
        name: 'Carlos Martinez',
        phone: '+1 (555) 012-7777',
        relation: 'Father',
      },
      lockerNumber: undefined,
      notes: 'Expired 5 days ago. Needs follow-up call regarding seasonal break.',
      createdAt: `${dMinus45}T14:00:00.000Z`,
      updatedAt: `${todayStr}T10:00:00.000Z`,
    },
    {
      _id: '674f3001a1b2c3d4e5f60105',
      memberCode: 'APX-1005',
      fullName: 'Lucas Bennett',
      email: 'l.bennett@example.com',
      phone: '+1 (555) 123-9876',
      gender: 'Male',
      planId: plans[1]._id,
      planName: plans[1].name,
      startDate: dMinus10,
      expiryDate: dPlus25,
      status: 'active',
      trainerId: trainers[2]._id,
      trainerName: trainers[2].name,
      emergencyContact: {
        name: 'Andrea Bennett',
        phone: '+1 (555) 123-5555',
        relation: 'Mother',
      },
      lockerNumber: 'L-09',
      notes: 'Post-injury rehabilitation; avoiding overhead squats.',
      createdAt: `${dMinus10}T16:30:00.000Z`,
      updatedAt: `${dMinus2}T14:00:00.000Z`,
    },
    {
      _id: '674f3001a1b2c3d4e5f60106',
      memberCode: 'APX-1006',
      fullName: 'Maya Patel',
      email: 'maya.patel@example.com',
      phone: '+1 (555) 234-5678',
      gender: 'Female',
      planId: plans[3]._id,
      planName: plans[3].name,
      startDate: dMinus20,
      expiryDate: dPlus5,
      status: 'expiring_soon',
      trainerId: undefined,
      emergencyContact: {
        name: 'Sunil Patel',
        phone: '+1 (555) 234-1111',
        relation: 'Father',
      },
      lockerNumber: undefined,
      notes: 'University swim team member training during off-hours.',
      createdAt: `${dMinus20}T10:00:00.000Z`,
      updatedAt: `${todayStr}T07:15:00.000Z`,
    },
    {
      _id: '674f3001a1b2c3d4e5f60107',
      memberCode: 'APX-1007',
      fullName: 'Julian Hayes',
      email: 'j.hayes@example.com',
      phone: '+1 (555) 345-9012',
      gender: 'Male',
      planId: plans[2]._id,
      planName: plans[2].name,
      startDate: dMinus45,
      expiryDate: dPlus180,
      status: 'active',
      trainerId: trainers[0]._id,
      trainerName: trainers[0].name,
      emergencyContact: {
        name: 'Laura Hayes',
        phone: '+1 (555) 345-8888',
        relation: 'Spouse',
      },
      lockerNumber: 'L-01',
      notes: 'VIP executive member; early bird 6:00 AM lifter.',
      createdAt: `${dMinus45}T06:00:00.000Z`,
      updatedAt: `${todayStr}T06:30:00.000Z`,
    },
  ];

  // Make sure statuses match dates
  members.forEach(m => {
    m.status = calculateStatus(m.expiryDate);
  });

  const attendance: IAttendance[] = [
    {
      _id: '674f4001a1b2c3d4e5f60201',
      memberId: members[1]._id,
      memberCode: members[1].memberCode,
      memberName: members[1].fullName,
      planName: members[1].planName,
      checkInTime: `${todayStr}T06:15:00.000Z`,
      checkOutTime: `${todayStr}T07:45:00.000Z`,
      status: 'Completed',
      date: todayStr,
      method: 'Barcode/ID',
      createdAt: `${todayStr}T06:15:00.000Z`,
    },
    {
      _id: '674f4001a1b2c3d4e5f60202',
      memberId: members[6]._id,
      memberCode: members[6].memberCode,
      memberName: members[6].fullName,
      planName: members[6].planName,
      checkInTime: `${todayStr}T06:30:00.000Z`,
      checkOutTime: `${todayStr}T08:10:00.000Z`,
      status: 'Completed',
      date: todayStr,
      method: 'Barcode/ID',
      createdAt: `${todayStr}T06:30:00.000Z`,
    },
    {
      _id: '674f4001a1b2c3d4e5f60203',
      memberId: members[0]._id,
      memberCode: members[0].memberCode,
      memberName: members[0].fullName,
      planName: members[0].planName,
      checkInTime: `${todayStr}T08:05:00.000Z`,
      checkOutTime: null,
      status: 'Checked In',
      date: todayStr,
      method: 'Barcode/ID',
      createdAt: `${todayStr}T08:05:00.000Z`,
    },
    {
      _id: '674f4001a1b2c3d4e5f60204',
      memberId: members[4]._id,
      memberCode: members[4].memberCode,
      memberName: members[4].fullName,
      planName: members[4].planName,
      checkInTime: `${todayStr}T08:45:00.000Z`,
      checkOutTime: null,
      status: 'Checked In',
      date: todayStr,
      method: 'Manual',
      createdAt: `${todayStr}T08:45:00.000Z`,
    },
  ];

  const payments: IPayment[] = [
    {
      _id: '674f5001a1b2c3d4e5f60301',
      invoiceNumber: 'INV-2026-001',
      memberId: members[1]._id,
      memberName: members[1].fullName,
      planId: plans[2]._id,
      planName: plans[2].name,
      amount: plans[2].price,
      paymentMethod: 'Credit Card',
      status: 'Paid',
      paymentDate: dMinus45,
      receiptNotes: 'Annual VIP Elite upfront payment with complementary locker L-03.',
      createdAt: `${dMinus45}T07:35:00.000Z`,
    },
    {
      _id: '674f5001a1b2c3d4e5f60302',
      invoiceNumber: 'INV-2026-002',
      memberId: members[6]._id,
      memberName: members[6].fullName,
      planId: plans[2]._id,
      planName: plans[2].name,
      amount: plans[2].price,
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      paymentDate: dMinus45,
      receiptNotes: 'Executive corporate membership invoice.',
      createdAt: `${dMinus45}T06:10:00.000Z`,
    },
    {
      _id: '674f5001a1b2c3d4e5f60303',
      invoiceNumber: 'INV-2026-003',
      memberId: members[0]._id,
      memberName: members[0].fullName,
      planId: plans[1]._id,
      planName: plans[1].name,
      amount: plans[1].price,
      paymentMethod: 'Debit Card',
      status: 'Paid',
      paymentDate: dMinus20,
      receiptNotes: 'Quarterly Strength tier renewal.',
      createdAt: `${dMinus20}T09:10:00.000Z`,
    },
    {
      _id: '674f5001a1b2c3d4e5f60304',
      invoiceNumber: 'INV-2026-004',
      memberId: members[4]._id,
      memberName: members[4].fullName,
      planId: plans[1]._id,
      planName: plans[1].name,
      amount: plans[1].price,
      paymentMethod: 'UPI/Online',
      status: 'Paid',
      paymentDate: dMinus10,
      receiptNotes: 'Quarterly registration + fitness assessment.',
      createdAt: `${dMinus10}T16:35:00.000Z`,
    },
  ];

  return {
    members,
    plans,
    trainers,
    attendance,
    payments,
  };
}

class MongoCollection<T extends { _id: string }> {
  private getStore: () => T[];
  private setStore: (items: T[]) => void;

  constructor(getStore: () => T[], setStore: (items: T[]) => void) {
    this.getStore = getStore;
    this.setStore = setStore;
  }

  async find(filter?: Partial<T> | ((item: T) => boolean)): Promise<T[]> {
    const list = this.getStore();
    if (!filter) return [...list];
    if (typeof filter === 'function') {
      return list.filter(filter);
    }
    return list.filter(item => {
      for (const key of Object.keys(filter) as (keyof T)[]) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findById(id: string): Promise<T | null> {
    const item = this.getStore().find(x => x._id === id);
    return item ? { ...item } : null;
  }

  async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const results = await this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  async insertOne(doc: Omit<T, '_id'> & { _id?: string }): Promise<T> {
    const list = this.getStore();
    const newDoc = {
      ...doc,
      _id: doc._id || generateMongoId(),
      createdAt: (doc as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as T;

    list.unshift(newDoc);
    this.setStore(list);
    return { ...newDoc };
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const list = this.getStore();
    const index = list.findIndex(x => x._id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updated = {
      ...existing,
      ...update,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.setStore(list);
    return { ...updated };
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    const list = this.getStore();
    const index = list.findIndex(x => x._id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.setStore(list);
    return true;
  }

  async countDocuments(filter?: Partial<T> | ((item: T) => boolean)): Promise<number> {
    const items = await this.find(filter);
    return items.length;
  }
}

class DatabaseManager {
  private data: IDatabaseSchema;
  public members: MongoCollection<IMember>;
  public plans: MongoCollection<IPlan>;
  public trainers: MongoCollection<ITrainer>;
  public attendance: MongoCollection<IAttendance>;
  public payments: MongoCollection<IPayment>;

  constructor() {
    this.data = this.loadData();

    this.members = new MongoCollection(
      () => this.data.members,
      items => {
        this.data.members = items;
        this.saveData();
      }
    );

    this.plans = new MongoCollection(
      () => this.data.plans,
      items => {
        this.data.plans = items;
        this.saveData();
      }
    );

    this.trainers = new MongoCollection(
      () => this.data.trainers,
      items => {
        this.data.trainers = items;
        this.saveData();
      }
    );

    this.attendance = new MongoCollection(
      () => this.data.attendance,
      items => {
        this.data.attendance = items;
        this.saveData();
      }
    );

    this.payments = new MongoCollection(
      () => this.data.payments,
      items => {
        this.data.payments = items;
        this.saveData();
      }
    );
  }

  private loadData(): IDatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // recalculate member statuses on load to ensure accuracy relative to today
        if (parsed.members) {
          parsed.members.forEach((m: IMember) => {
            m.status = calculateStatus(m.expiryDate);
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading gym database, initializing fresh store:', e);
    }
    const initial = getInitialData();
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing initial db file:', err);
    }
    return initial;
  }

  private saveData(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  public resetToDefault(): IDatabaseSchema {
    this.data = getInitialData();
    this.saveData();
    return this.data;
  }

  public getStats() {
    const today = new Date().toISOString().split('T')[0];
    const totalMembers = this.data.members.length;
    const activeMembers = this.data.members.filter(m => m.status === 'active').length;
    const expiringSoon = this.data.members.filter(m => m.status === 'expiring_soon').length;
    const expiredCount = this.data.members.filter(m => m.status === 'expired').length;

    const todayAttendance = this.data.attendance.filter(a => a.date === today);
    const currentlyInGym = todayAttendance.filter(a => a.status === 'Checked In').length;
    const totalTodayCheckins = todayAttendance.length;

    // Revenue calculation
    const totalRevenue = this.data.payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalMembers,
      activeMembers,
      expiringSoon,
      expiredCount,
      currentlyInGym,
      totalTodayCheckins,
      totalRevenue,
      plansCount: this.data.plans.length,
      trainersCount: this.data.trainers.length,
      collections: {
        members: this.data.members.length,
        plans: this.data.plans.length,
        trainers: this.data.trainers.length,
        attendance: this.data.attendance.length,
        payments: this.data.payments.length,
      },
    };
  }
}

export const db = new DatabaseManager();
