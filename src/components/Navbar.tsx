import React from 'react';
import { Dumbbell, Plus, Server, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddMember: () => void;
  onOpenQuickCheckIn: () => void;
  onOpenMernModal: () => void;
  activeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddMember,
  onOpenQuickCheckIn,
  onOpenMernModal,
  activeCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'members', label: 'Members' },
    { id: 'attendance', label: 'Attendance & Floor' },
    { id: 'plans', label: 'Plans' },
    { id: 'trainers', label: 'Trainers' },
    { id: 'billing', label: 'Billing' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly 1 row, 3-zone Top Bar Contract */}
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
            >
              <span className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Dumbbell className="w-4 h-4" />
              </span>
              <span>ApexIron Gym</span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-medium transition-colors py-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded relative ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {item.id === 'attendance' && activeCount > 0 && (
                    <span className="ml-1.5 text-xs text-orange-600 font-semibold tabular-nums">
                      ({activeCount})
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 -mb-4.5 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenMernModal}
              title="View MERN Stack architecture & live API logs"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>MERN Stack</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              onClick={onOpenQuickCheckIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-orange-100 hover:bg-orange-200 border border-orange-200 rounded-md transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Quick Check-in</span>
            </button>

            <button
              onClick={onOpenAddMember}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 no-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
              {item.id === 'attendance' && activeCount > 0 && ` (${activeCount})`}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
