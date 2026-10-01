import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client.ts';
import { IMember, IPlan } from '../types/index.ts';

interface RenewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: IMember | null;
  plans: IPlan[];
  onRenewSuccess: (updatedMember: IMember) => void;
}

export const RenewMemberModal: React.FC<RenewMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  plans,
  onRenewSuccess,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState(member?.planId || plans[0]?._id || '');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !member) return null;

  const currentPlan = plans.find(p => p._id === (selectedPlanId || member.planId)) || plans[0];

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.renewMember(member._id, {
        planId: selectedPlanId || member.planId,
        paymentMethod,
        customMonths: currentPlan.durationMonths,
      });

      onRenewSuccess(res.member);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Renewal failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-semibold text-slate-900">Renew Membership</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Member Preview */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <div className="font-semibold text-slate-900">{member.fullName}</div>
              <div className="text-slate-500 font-mono-nums">{member.memberCode} · {member.phone}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Current Expiry:</span>
              <div className="font-mono-nums font-medium text-slate-700">{member.expiryDate}</div>
            </div>
          </div>

          <form onSubmit={handleRenew} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Renewal Tier / Plan
              </label>
              <select
                value={selectedPlanId || member.planId}
                onChange={e => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
              >
                {plans.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} — ${p.price} (+{p.durationMonths} Months)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash at Counter</option>
                <option value="UPI/Online">UPI / Instant QR</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-md text-xs text-orange-900 flex justify-between items-center">
              <span>Renewal Charge:</span>
              <span className="text-base font-bold font-mono-nums">${currentPlan.price}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-md transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Processing...' : `Renew & Collect $${currentPlan.price}`}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
