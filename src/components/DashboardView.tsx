import React, { useState } from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Sparkles,
  Search,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { IDashboardData, IMember, IAttendance } from '../types/index.ts';
import { api } from '../api/client.ts';

interface DashboardViewProps {
  data: IDashboardData | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectMember: (memberId: string) => void;
  onOpenAddMember: () => void;
  onOpenRenew: (member: IMember) => void;
  onOpenCheckInTerminal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  loading,
  onRefresh,
  onSelectMember,
  onOpenAddMember,
  onOpenRenew,
  onOpenCheckInTerminal,
  onNavigateToTab,
}) => {
  const [quickCode, setQuickCode] = useState('');
  const [quickMsg, setQuickMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);

  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;

    setSubmittingCheckIn(true);
    setQuickMsg(null);

    try {
      const res = await api.checkIn(quickCode.trim());
      setQuickMsg({ type: 'success', text: `✓ ${res.message}` });
      setQuickCode('');
      onRefresh();
    } catch (err: any) {
      setQuickMsg({ type: 'error', text: `✕ ${err.message}` });
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const handleQuickCheckout = async (attendanceId: string) => {
    try {
      await api.checkOut(attendanceId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    }
  };

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Gym Operations Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time management for floor check-ins, member subscriptions, and coaching roster.
          </p>
        </div>

        {/* Inline Quick Check-in Input */}
        <form onSubmit={handleQuickCheckIn} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Instant Check-in (ID: APX-1001 or Name)..."
              value={quickCode}
              onChange={e => setQuickCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400 bg-slate-50"
            />
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          </div>
          <button
            type="submit"
            disabled={submittingCheckIn || !quickCode.trim()}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            {submittingCheckIn ? '...' : 'Check In'}
          </button>
        </form>
      </div>

      {quickMsg && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
            quickMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{quickMsg.text}</span>
          <button onClick={() => setQuickMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Members */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Members</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono-nums text-slate-900">
            {stats ? stats.activeMembers : '—'}
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="text-slate-700 font-semibold">{stats ? stats.totalMembers : '—'}</span> total registered
            athletes
          </div>
        </div>

        {/* Card 2: Live Floor Occupancy */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Live Floor Occupancy</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-nums text-slate-900">
            {stats ? stats.currentlyInGym : '—'}
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="text-slate-700 font-semibold">{stats ? stats.totalTodayCheckins : '—'}</span> check-ins today
          </div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Expiring within 7 Days</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono-nums text-amber-600">
            {stats ? stats.expiringSoon : '—'}
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="text-rose-600 font-semibold">{stats ? stats.expiredCount : '0'}</span> already expired
          </div>
        </div>

        {/* Card 4: Revenue MTD */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Recorded Revenue</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono-nums text-slate-900">
            ${stats ? stats.totalRevenue.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-slate-500">From membership registrations & renewals</div>
        </div>
      </div>

      {/* Main 2-Column Floor & Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Gym Floor & Recent Check-ins (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900">Live Gym Floor & Recent Check-ins</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('attendance')}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Full Attendance Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.todayAttendance && data.todayAttendance.length > 0 ? (
              data.todayAttendance.map(item => (
                <div
                  key={item._id}
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center font-mono-nums">
                      {item.memberName.charAt(0)}
                    </div>
                    <div>
                      <button
                        onClick={() => onSelectMember(item.memberId)}
                        className="text-xs font-semibold text-slate-900 hover:text-orange-600 transition-colors text-left"
                      >
                        {item.memberName}
                      </button>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono-nums">{item.memberCode}</span>
                        <span>·</span>
                        <span>{item.planName}</span>
                        <span>·</span>
                        <span className="font-mono-nums">
                          In: {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'Checked In' ? (
                      <button
                        type="button"
                        onClick={() => handleQuickCheckout(item._id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                      >
                        <LogOut className="w-3 h-3 text-slate-500" />
                        <span>Check Out</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono-nums text-slate-400">
                        Out:{' '}
                        {item.checkOutTime
                          ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No members have checked in today yet. Use the quick check-in bar above to record the first entry.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Expiring Members & Membership Breakdown (1/3 width) */}
        <div className="space-y-6">
          {/* Expiring Members Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Renewals Required</span>
              </h2>
              <button
                onClick={() => onNavigateToTab('members')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {data?.expiringMembers && data.expiringMembers.length > 0 ? (
                data.expiringMembers.map(m => (
                  <div key={m._id} className="p-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <button
                          onClick={() => onSelectMember(m._id)}
                          className="text-xs font-semibold text-slate-900 hover:text-orange-600 transition-colors text-left"
                        >
                          {m.fullName}
                        </button>
                        <div className="text-[11px] text-slate-500 font-mono-nums">
                          {m.memberCode} · Expiry: {m.expiryDate}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenRenew(m)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors shadow-xs"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  All memberships are healthy and active.
                </div>
              )}
            </div>
          </div>

          {/* Membership Tier Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Plan Distribution
            </h2>
            <div className="space-y-2">
              {data?.planDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-mono-nums font-semibold text-slate-900">{item.count} members</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
