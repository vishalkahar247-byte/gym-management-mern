import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  LogOut,
  Search,
  Calendar,
  UserCheck,
  Plus,
} from 'lucide-react';
import { IAttendance, IMember } from '../types/index.ts';
import { api } from '../api/client.ts';

interface AttendanceViewProps {
  attendance: IAttendance[];
  members: IMember[];
  loading: boolean;
  onRefresh: () => void;
  onSelectMember: (memberId: string) => void;
  onOpenQuickCheckIn: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  members,
  loading,
  onRefresh,
  onSelectMember,
  onOpenQuickCheckIn,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'in_gym' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return attendance.filter(a => {
      // Date filter
      if (dateFilter && a.date !== dateFilter) return false;
      // Status filter
      if (filterType === 'in_gym' && a.status !== 'Checked In') return false;
      if (filterType === 'completed' && a.status !== 'Completed') return false;
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.memberName.toLowerCase().includes(q) ||
          a.memberCode.toLowerCase().includes(q) ||
          a.planName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [attendance, dateFilter, filterType, search]);

  const currentlyInGymCount = useMemo(() => {
    return attendance.filter(a => a.date === dateFilter && a.status === 'Checked In').length;
  }, [attendance, dateFilter]);

  const handleCheckout = async (attendanceId: string) => {
    setProcessingId(attendanceId);
    try {
      await api.checkOut(attendanceId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to check out');
    } finally {
      setProcessingId(null);
    }
  };

  const calculateDuration = (checkInTime: string, checkOutTime: string | null) => {
    const start = new Date(checkInTime).getTime();
    const end = checkOutTime ? new Date(checkOutTime).getTime() : Date.now();
    const diffMins = Math.floor((end - start) / 60000);

    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Floor Attendance & Check-in</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-mono-nums">{currentlyInGymCount}</span> on floor now
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time gym turnstile log, active workouts, and check-out management.
          </p>
        </div>

        <button
          onClick={onOpenQuickCheckIn}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <UserCheck className="w-4 h-4" />
          <span>Launch Check-in Scanner</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search athlete name or code (APX-...)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
            />
          </div>
        </div>

        {/* Segmented Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mr-1">View:</span>
          {(['all', 'in_gym', 'completed'] as const).map(tabKey => {
            const isActive = filterType === tabKey;
            const labels = {
              all: `All Visits (${attendance.filter(a => a.date === dateFilter).length})`,
              in_gym: `Currently In Gym (${currentlyInGymCount})`,
              completed: `Completed Visits (${attendance.filter(a => a.date === dateFilter && a.status === 'Completed').length})`,
            };
            return (
              <button
                key={tabKey}
                onClick={() => setFilterType(tabKey)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {labels[tabKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Attendance Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading attendance records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-800">No attendance entries for this date</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan a member barcode or use the Check-in button above to log a workout session.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Membership Tier</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Check-Out Time</th>
                  <th className="py-3 px-4">Session Duration</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(entry => (
                  <tr key={entry._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectMember(entry.memberId)}
                        className="font-semibold text-slate-900 hover:text-orange-600 transition-colors text-left"
                      >
                        {entry.memberName}
                      </button>
                    </td>

                    <td className="py-3 px-4 font-mono-nums font-semibold text-slate-700">
                      {entry.memberCode}
                    </td>

                    <td className="py-3 px-4 text-slate-600">{entry.planName}</td>

                    <td className="py-3 px-4 font-mono-nums text-slate-900 font-medium">
                      {new Date(entry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 font-mono-nums text-slate-500">
                      {entry.checkOutTime
                        ? new Date(entry.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>

                    <td className="py-3 px-4 font-mono-nums text-slate-600 font-medium">
                      {calculateDuration(entry.checkInTime, entry.checkOutTime)}
                    </td>

                    <td className="py-3 px-4 text-slate-500">{entry.method}</td>

                    <td className="py-3 px-4 text-right">
                      {entry.status === 'Checked In' ? (
                        <button
                          type="button"
                          onClick={() => handleCheckout(entry._id)}
                          disabled={processingId === entry._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-800 bg-orange-100 hover:bg-orange-200 border border-orange-200 rounded-md transition-colors shadow-2xs"
                        >
                          <LogOut className="w-3.5 h-3.5 text-orange-700" />
                          <span>{processingId === entry._id ? 'Checking out...' : 'Check Out'}</span>
                        </button>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 rounded">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono-nums">
          <span>Date: {dateFilter}</span>
          <span>ApexIron Attendance Collection</span>
        </div>
      </div>
    </div>
  );
};
