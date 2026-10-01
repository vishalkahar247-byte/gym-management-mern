/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MembersView } from './components/MembersView.tsx';
import { AttendanceView } from './components/AttendanceView.tsx';
import { PlansView } from './components/PlansView.tsx';
import { TrainersView } from './components/TrainersView.tsx';
import { BillingView } from './components/BillingView.tsx';
import { QuickCheckInModal } from './components/QuickCheckInModal.tsx';
import { AddMemberModal } from './components/AddMemberModal.tsx';
import { RenewMemberModal } from './components/RenewMemberModal.tsx';
import { MemberDetailModal } from './components/MemberDetailModal.tsx';
import { MernStackModal } from './components/MernStackModal.tsx';
import { api } from './api/client.ts';
import {
  IDashboardData,
  IMember,
  IPlan,
  ITrainer,
  IAttendance,
  IPayment,
} from './types/index.ts';
import { CheckCircle2, Dumbbell, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(null);
  const [members, setMembers] = useState<IMember[]>([]);
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [trainers, setTrainers] = useState<ITrainer[]>([]);
  const [attendance, setAttendance] = useState<IAttendance[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isQuickCheckInOpen, setIsQuickCheckInOpen] = useState(false);
  const [isMernModalOpen, setIsMernModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [renewMemberTarget, setRenewMemberTarget] = useState<IMember | null>(null);

  // Global Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [dash, mems, plns, trns, atts, pymts] = await Promise.all([
        api.getDashboard(),
        api.getMembers(),
        api.getPlans(),
        api.getTrainers(),
        api.getAttendance(),
        api.getPayments(),
      ]);

      setDashboardData(dash);
      setMembers(mems);
      setPlans(plns);
      setTrainers(trns);
      setAttendance(atts);
      setPayments(pymts);
    } catch (err: any) {
      console.error('Failed to load gym data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Count of currently active attendees on floor
  const currentlyOnFloorCount = dashboardData?.stats.currentlyInGym ?? 0;

  const handleCheckInSuccess = (record: IAttendance, member: IMember) => {
    showToast(`Checked in: ${member.fullName} (${member.memberCode})`);
    loadAllData();
  };

  const handleRenewSuccess = (updatedMember: IMember) => {
    showToast(`Membership renewed for ${updatedMember.fullName} until ${updatedMember.expiryDate}`);
    loadAllData();
  };

  const handleMemberDeleted = (memberId: string) => {
    showToast('Member removed from records.');
    loadAllData();
  };

  const handleMemberCreated = (newMember: IMember) => {
    showToast(`Registered new member: ${newMember.fullName} (${newMember.memberCode})`);
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1-Row 3-Zone Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddMember={() => setIsAddMemberOpen(true)}
        onOpenQuickCheckIn={() => setIsQuickCheckInOpen(true)}
        onOpenMernModal={() => setIsMernModalOpen(true)}
        activeCount={currentlyOnFloorCount}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            data={dashboardData}
            loading={loading}
            onRefresh={loadAllData}
            onSelectMember={id => setSelectedMemberId(id)}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onOpenRenew={m => setRenewMemberTarget(m)}
            onOpenCheckInTerminal={() => setIsQuickCheckInOpen(true)}
            onNavigateToTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            members={members}
            plans={plans}
            loading={loading}
            onSelectMember={id => setSelectedMemberId(id)}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onOpenRenew={m => setRenewMemberTarget(m)}
            onDeleteMember={handleMemberDeleted}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            attendance={attendance}
            members={members}
            loading={loading}
            onRefresh={loadAllData}
            onSelectMember={id => setSelectedMemberId(id)}
            onOpenQuickCheckIn={() => setIsQuickCheckInOpen(true)}
          />
        )}

        {activeTab === 'plans' && (
          <PlansView
            plans={plans}
            members={members}
            onRefresh={loadAllData}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
          />
        )}

        {activeTab === 'trainers' && (
          <TrainersView
            trainers={trainers}
            members={members}
            onRefresh={loadAllData}
            onSelectMember={id => setSelectedMemberId(id)}
          />
        )}

        {activeTab === 'billing' && (
          <BillingView
            payments={payments}
            members={members}
            plans={plans}
            onRefresh={loadAllData}
            onSelectMember={id => setSelectedMemberId(id)}
          />
        )}
      </main>

      {/* Clean Footer adhering to Section 1.B (No fake telemetry tickers) */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ApexIron Gym Manager</span>
            <span>·</span>
            <span>Full-Stack MERN Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMernModalOpen(true)}
              className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              <span>MongoDB & API Status</span>
            </button>
            <span>·</span>
            <span>All rights reserved &copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <QuickCheckInModal
        isOpen={isQuickCheckInOpen}
        onClose={() => setIsQuickCheckInOpen(false)}
        onCheckInSuccess={handleCheckInSuccess}
        onOpenRenew={m => {
          setIsQuickCheckInOpen(false);
          setRenewMemberTarget(m);
        }}
        recentMembers={members}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={handleMemberCreated}
        plans={plans}
        trainers={trainers}
      />

      <RenewMemberModal
        isOpen={Boolean(renewMemberTarget)}
        onClose={() => setRenewMemberTarget(null)}
        member={renewMemberTarget}
        plans={plans}
        onRenewSuccess={handleRenewSuccess}
      />

      <MemberDetailModal
        isOpen={Boolean(selectedMemberId)}
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        onOpenRenew={m => {
          setSelectedMemberId(null);
          setRenewMemberTarget(m);
        }}
        onMemberDeleted={handleMemberDeleted}
        onCheckInSuccess={handleCheckInSuccess}
      />

      <MernStackModal
        isOpen={isMernModalOpen}
        onClose={() => setIsMernModalOpen(false)}
        onDataReset={loadAllData}
      />
    </div>
  );
}
