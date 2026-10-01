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
  date: string;
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

export interface IDashboardData {
  stats: {
    totalMembers: number;
    activeMembers: number;
    expiringSoon: number;
    expiredCount: number;
    currentlyInGym: number;
    totalTodayCheckins: number;
    totalRevenue: number;
    plansCount: number;
    trainersCount: number;
    collections: {
      members: number;
      plans: number;
      trainers: number;
      attendance: number;
      payments: number;
    };
  };
  todayAttendance: IAttendance[];
  expiringMembers: IMember[];
  recentPayments: IPayment[];
  planDistribution: Array<{ name: string; count: number }>;
}

export interface IHealthData {
  status: string;
  engine: string;
  nodeVersion: string;
  uptimeSec: number;
  database: {
    type: string;
    storage: string;
    collections: Record<string, number>;
  };
  recentRequests: Array<{
    method: string;
    path: string;
    status: number;
    time: string;
    durationMs: number;
  }>;
}
