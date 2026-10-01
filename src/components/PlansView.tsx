import React, { useState } from 'react';
import { Check, Plus, Edit2, Clock, Users, X, Dumbbell, ShieldCheck } from 'lucide-react';
import { IPlan, IMember } from '../types/index.ts';
import { api } from '../api/client.ts';

interface PlansViewProps {
  plans: IPlan[];
  members: IMember[];
  onRefresh: () => void;
  onOpenAddMember: () => void;
}

export const PlansView: React.FC<PlansViewProps> = ({
  plans,
  members,
  onRefresh,
  onOpenAddMember,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);
  const [name, setName] = useState('');
  const [audience, setAudience] = useState('');
  const [price, setPrice] = useState('60');
  const [durationMonths, setDurationMonths] = useState('1');
  const [accessHours, setAccessHours] = useState('05:00 - 23:00 Daily');
  const [features, setFeatures] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [saving, setSaving] = useState(false);

  const openNewPlan = () => {
    setEditingPlan(null);
    setName('');
    setAudience('');
    setPrice('60');
    setDurationMonths('1');
    setAccessHours('05:00 - 23:00 Daily');
    setFeatures('Full floor access\nLocker & showers\nWater station access');
    setIsPopular(false);
    setModalOpen(true);
  };

  const openEditPlan = (plan: IPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setAudience(plan.audience);
    setPrice(plan.price.toString());
    setDurationMonths(plan.durationMonths.toString());
    setAccessHours(plan.accessHours);
    setFeatures(plan.features.join('\n'));
    setIsPopular(Boolean(plan.isPopular));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        audience,
        price: Number(price),
        durationMonths: Number(durationMonths),
        accessHours,
        features: features.split('\n').map(f => f.trim()).filter(Boolean),
        isPopular,
      };

      if (editingPlan) {
        await api.updatePlan(editingPlan._id, payload);
      } else {
        await api.createPlan(payload);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Membership Tiers & Pricing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure gym packages, duration options, amenity privileges, and member limits.
          </p>
        </div>

        <button
          onClick={openNewPlan}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tier</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => {
          const subscriberCount = members.filter(m => m.planId === plan._id).length;
          return (
            <div
              key={plan._id}
              className={`bg-white rounded-xl border flex flex-col justify-between p-5 relative shadow-xs transition-shadow hover:shadow-md ${
                plan.isPopular ? 'border-orange-500 ring-1 ring-orange-500' : 'border-slate-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 right-4 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                {/* Plan Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                    <button
                      type="button"
                      onClick={() => openEditPlan(plan)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Clean unboxed metadata with dot separator */}
                  <div className="text-xs text-slate-500 mt-1">
                    <span>{plan.audience}</span>
                  </div>
                </div>

                {/* Price Display with Tabular Figures */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono-nums text-slate-900">${plan.price}</span>
                    <span className="text-xs text-slate-500">
                      /{plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{plan.accessHours}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    Included Amenities:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Plan Footer */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono-nums">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{subscriberCount} enrolled</span>
                </span>

                <button
                  type="button"
                  onClick={onOpenAddMember}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Assign to Member →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semi-Annual Strength"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. For competitive powerlifters"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={durationMonths}
                    onChange={e => setDurationMonths(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Access Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 24/7 Access or 06:00 - 22:00"
                  value={accessHours}
                  onChange={e => setAccessHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Features (one per line)
                </label>
                <textarea
                  rows={3}
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pop"
                  checked={isPopular}
                  onChange={e => setIsPopular(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="pop" className="text-xs text-slate-700">
                  Highlight as "Most Popular" plan
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
