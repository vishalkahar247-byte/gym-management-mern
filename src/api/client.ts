import {
  IMember,
  IPlan,
  ITrainer,
  IAttendance,
  IPayment,
  IDashboardData,
  IHealthData,
} from '../types/index.ts';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

export const api = {
  // Health & MERN Architecture
  getHealth: () => request<IHealthData>('/health'),
  resetDemoData: () => request<{ success: boolean; message: string }>('/system/reset', { method: 'POST' }),

  // Dashboard
  getDashboard: () => request<IDashboardData>('/dashboard'),

  // Members
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

  // Plans
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

  // Trainers
  getTrainers: () => request<ITrainer[]>('/trainers'),
  createTrainer: (trainerData: Partial<ITrainer>) =>
    request<ITrainer>('/trainers', {
      method: 'POST',
      body: JSON.stringify(trainerData),
    }),

  // Attendance
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

  // Payments
  getPayments: () => request<IPayment[]>('/payments'),
  createPayment: (paymentData: Partial<IPayment>) =>
    request<IPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};
