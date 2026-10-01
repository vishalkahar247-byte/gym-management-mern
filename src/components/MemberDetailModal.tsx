import React, { useEffect, useState } from 'react';
import { X, Calendar, Phone, Mail, User, ShieldAlert, CheckCircle2, Dumbbell, History, CreditCard, RefreshCw, Trash2, Edit3, Clock } from 'lucide-react';
import { api } from '../api/client.ts';
import { IMember, IAttendance, IPayment, IPlan } from '../types/index.ts';

interface MemberDetailModalProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRenew: (member: IMember) => void;
  onMemberDeleted: (memberId: string) => void;
  onCheckInSuccess: (record: IAttendance, member: IMember) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  memberId,
  isOpen,
  onClose,
  onOpenRenew,
  onMemberDeleted,
  onCheckInSuccess,
}) => {
  const [data, setData] = useState<{
    member: IMember;
    attendance: IAttendance[];
    payments: IPayment[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'payments'>('overview');
  const [deleting, setDeleting] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !memberId) {
      setData(null);
      return;
    }

    setLoading(true);
    setActionMsg(null);
    api
      .getMember(memberId)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, memberId]);

  if (!isOpen || !memberId) return null;

  const member = data?.member;

  const handleInstantCheckIn = async () => {
    if (!member) return;
    try {
      const res = await api.checkIn(member.memberCode);
      setActionMsg(`Check-in recorded at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      onCheckInSuccess(res.attendance, res.member);
      // Refresh member details
      const refreshed = await api.getMember(member._id);
      setData(refreshed);
    } catch (err: any) {
      setActionMsg(err.message || 'Check-in failed');
    }
  };

  const handleDelete = async () => {
    if (!member) return;
    if (!window.confirm(`Are you sure you want to permanently delete member ${member.fullName}?`)) return;

    setDeleting(true);
    try {
      await api.deleteMember(member._id);
      onMemberDeleted(member._id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Top */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              {member ? member.fullName.charAt(0) : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {member ? member.fullName : 'Loading Member Profile...'}
                </h2>
                {member && (
                  <span className="font-mono-nums text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                    {member.memberCode}
                  </span>
                )}
              </div>
              {member && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{member.planName}</span>
                  <span>·</span>
                  <span>Joined {member.startDate}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionMsg && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-900 flex justify-between items-center">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} className="text-blue-500 hover:text-blue-700">✕</button>
          </div>
        )}

        {loading || !member ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading member data...</div>
        ) : (
          <div>
            {/* Quick Action Ribbon */}
            <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${
                    member.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : member.status === 'expiring_soon'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="capitalize">{member.status.replace('_', ' ')}</span>
                </span>
                <span className="text-xs text-slate-500 font-mono-nums">
                  Valid until: {member.expiryDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstantCheckIn}
                  className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Log Check-in</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenRenew(member)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew Plan</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Delete Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-3 gap-6 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-orange-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Profile & Details
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'attendance'
                    ? 'border-orange-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Attendance Log</span>
                <span className="font-mono-nums bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                  {data?.attendance.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'payments'
                    ? 'border-orange-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Billing Invoices</span>
                <span className="font-mono-nums bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                  {data?.payments.length || 0}
                </span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                        Contact Information
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Gender: {member.gender}</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                        Gym Assignments
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">Locker Assigned:</span>
                        <span className="font-semibold text-slate-900 font-mono-nums">
                          {member.lockerNumber || 'None'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">Personal Trainer:</span>
                        <span className="font-semibold text-slate-900">
                          {member.trainerName || 'Self-directed'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">Plan Duration:</span>
                        <span className="font-mono-nums font-semibold text-slate-900">
                          {member.startDate} → {member.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                        Emergency Contact
                      </div>
                      {member.emergencyContact?.name ? (
                        <div className="space-y-1 text-slate-700">
                          <div className="font-medium text-slate-900">{member.emergencyContact.name}</div>
                          <div className="text-slate-500 font-mono-nums">
                            {member.emergencyContact.phone} · {member.emergencyContact.relation}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic">No emergency contact recorded</div>
                      )}
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                        Notes & Fitness Objectives
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {member.notes || 'No specific medical or training notes logged.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-3">
                  {data?.attendance.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No attendance visits recorded yet for this member.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Date</th>
                            <th className="py-2.5 px-3 font-semibold">Check-in Time</th>
                            <th className="py-2.5 px-3 font-semibold">Check-out Time</th>
                            <th className="py-2.5 px-3 font-semibold">Method</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data?.attendance.map(a => (
                            <tr key={a._id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono-nums text-slate-900 font-medium">
                                {a.date}
                              </td>
                              <td className="py-2.5 px-3 font-mono-nums text-slate-600">
                                {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-2.5 px-3 font-mono-nums text-slate-600">
                                {a.checkOutTime
                                  ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">{a.method}</td>
                              <td className="py-2.5 px-3 text-right">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                                    a.status === 'Checked In'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-3">
                  {data?.payments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No invoices logged for this member.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                            <th className="py-2.5 px-3 font-semibold">Plan Description</th>
                            <th className="py-2.5 px-3 font-semibold">Date</th>
                            <th className="py-2.5 px-3 font-semibold">Method</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data?.payments.map(p => (
                            <tr key={p._id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono-nums font-semibold text-slate-900">
                                {p.invoiceNumber}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">{p.planName}</td>
                              <td className="py-2.5 px-3 font-mono-nums text-slate-500">{p.paymentDate}</td>
                              <td className="py-2.5 px-3 text-slate-600">{p.paymentMethod}</td>
                              <td className="py-2.5 px-3 font-mono-nums font-bold text-slate-900 text-right">
                                ${p.amount}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
