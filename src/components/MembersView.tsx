import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, RefreshCw, Eye, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import { IMember, IPlan } from '../types/index.ts';

interface MembersViewProps {
  members: IMember[];
  plans: IPlan[];
  loading: boolean;
  onSelectMember: (memberId: string) => void;
  onOpenAddMember: () => void;
  onOpenRenew: (member: IMember) => void;
  onDeleteMember: (memberId: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  plans,
  loading,
  onSelectMember,
  onOpenAddMember,
  onOpenRenew,
  onDeleteMember,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      // Plan filter
      if (planFilter !== 'all' && m.planId !== planFilter) return false;
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesCode = m.memberCode.toLowerCase().includes(q);
        const matchesPhone = m.phone.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesPhone && !matchesEmail) return false;
      }
      return true;
    });
  }, [members, search, statusFilter, planFilter]);

  const counts = useMemo(() => {
    return {
      all: members.length,
      active: members.filter(m => m.status === 'active').length,
      expiring_soon: members.filter(m => m.status === 'expiring_soon').length,
      expired: members.filter(m => m.status === 'expired').length,
    };
  }, [members]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Member Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage athlete memberships, expiration dates, assigned lockers, and coaches.
          </p>
        </div>

        <button
          onClick={onOpenAddMember}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, code (APX-...), phone, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          {/* Plan Filter dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">Tier:</label>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
            >
              <option value="all">All Plans</option>
              {plans.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Segmented Filter Controls (Conforms to Constitution Section 1.A) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mr-1">Status:</span>
          {(['all', 'active', 'expiring_soon', 'expired'] as const).map(tabKey => {
            const isActive = statusFilter === tabKey;
            const labelMap = {
              all: `All (${counts.all})`,
              active: `Active (${counts.active})`,
              expiring_soon: `Expiring Soon (${counts.expiring_soon})`,
              expired: `Expired (${counts.expired})`,
            };
            return (
              <button
                key={tabKey}
                onClick={() => setStatusFilter(tabKey)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {labelMap[tabKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading members database...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-800">No members match your criteria</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try changing the search keyword, clearing filters, or adding a new member.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPlanFilter('all');
              }}
              className="text-xs font-medium text-orange-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Plan & Locker</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4">Coach</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(m => (
                  <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Member Name & Phone */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => onSelectMember(m._id)}
                            className="font-semibold text-slate-900 hover:text-orange-600 transition-colors text-left"
                          >
                            {m.fullName}
                          </button>
                          <div className="text-[11px] text-slate-500 font-mono-nums">{m.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Member ID */}
                    <td className="py-3 px-4 font-mono-nums font-semibold text-slate-800">
                      {m.memberCode}
                    </td>

                    {/* Plan & Locker */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{m.planName}</div>
                      <div className="text-[11px] text-slate-500 font-mono-nums">
                        {m.lockerNumber ? `Locker ${m.lockerNumber}` : 'No locker'}
                      </div>
                    </td>

                    {/* Validity Dates */}
                    <td className="py-3 px-4 font-mono-nums">
                      <div className="text-slate-800">{m.expiryDate}</div>
                      <div className="text-[11px] text-slate-500">Joined {m.startDate}</div>
                    </td>

                    {/* Trainer */}
                    <td className="py-3 px-4 text-slate-700">
                      {m.trainerName || <span className="text-slate-400">Self-guided</span>}
                    </td>

                    {/* Status (Zero-pill compliant clean metadata) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.status === 'active'
                              ? 'bg-emerald-500'
                              : m.status === 'expiring_soon'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium capitalize ${
                            m.status === 'active'
                              ? 'text-emerald-700'
                              : m.status === 'expiring_soon'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectMember(m._id)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenRenew(m)}
                          className="px-2 py-1 text-[11px] font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                          title="Renew Membership"
                        >
                          Renew
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ${m.fullName}?`)) onDeleteMember(m._id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono-nums">
          <span>Showing {filteredMembers.length} of {members.length} athletes</span>
          <span>ApexIron Members Collection</span>
        </div>
      </div>
    </div>
  );
};
