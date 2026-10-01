import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertTriangle, LogOut, ArrowRight, User } from 'lucide-react';
import { api } from '../api/client.ts';
import { IMember, IAttendance } from '../types/index.ts';

interface QuickCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess: (record: IAttendance, member: IMember) => void;
  onOpenRenew: (member: IMember) => void;
  recentMembers: IMember[];
}

export const QuickCheckInModal: React.FC<QuickCheckInModalProps> = ({
  isOpen,
  onClose,
  onCheckInSuccess,
  onOpenRenew,
  recentMembers,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    member?: IMember;
    attendanceId?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent, identifierOverride?: string) => {
    if (e) e.preventDefault();
    const target = identifierOverride || query;
    if (!target.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await api.checkIn(target.trim(), 'Barcode/ID');
      setFeedback({
        type: 'success',
        message: res.message,
        member: res.member,
      });
      onCheckInSuccess(res.attendance, res.member);
      setQuery('');
    } catch (err: any) {
      if (err.message.includes('expired')) {
        setFeedback({
          type: 'warning',
          message: err.message,
        });
      } else if (err.message.includes('already checked in')) {
        setFeedback({
          type: 'warning',
          message: err.message,
        });
      } else {
        setFeedback({
          type: 'error',
          message: err.message || 'Check-in failed. Please check the code or name.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Front Desk Check-in Terminal</h2>
            <p className="text-xs text-slate-500 mt-0.5">Scan member barcode or enter Member ID / Full Name</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={e => handleSubmit(e)} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Member Code or Name
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="e.g. APX-1001, David Miller, or phone"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium text-xs rounded-md transition-colors"
              >
                {loading ? 'Verifying...' : 'Check-In'}
              </button>
            </div>
            <p className="text-xs text-slate-500 flex items-center justify-between">
              <span>Supports barcode scanner keystrokes directly</span>
              <span className="font-mono-nums text-slate-400">Press Enter ↵</span>
            </p>
          </form>

          {/* Feedback Card */}
          {feedback && (
            <div
              className={`p-4 rounded-lg border text-sm transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : feedback.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{feedback.message}</p>
                  {feedback.member && (
                    <div className="text-xs text-emerald-700 flex items-center gap-2 pt-1">
                      <span className="font-mono-nums font-semibold">{feedback.member.memberCode}</span>
                      <span>·</span>
                      <span>{feedback.member.planName}</span>
                      {feedback.member.lockerNumber && (
                        <>
                          <span>·</span>
                          <span>Locker {feedback.member.lockerNumber}</span>
                        </>
                      )}
                    </div>
                  )}
                  {feedback.type === 'warning' && feedback.message.includes('expired') && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (feedback.member) onOpenRenew(feedback.member);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <span>Proceed to Plan Renewal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Select from Member List */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Quick Select Registered Member:</div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {recentMembers.slice(0, 6).map(member => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold font-mono-nums">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-900">{member.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono-nums">
                        {member.memberCode} · {member.planName}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubmit(undefined, member.memberCode)}
                    disabled={loading}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                  >
                    Check In
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
