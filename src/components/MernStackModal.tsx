import React, { useEffect, useState } from 'react';
import { X, Server, Database, Code, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';
import { IHealthData } from '../types/index.ts';
import { api } from '../api/client.ts';

interface MernStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const MernStackModal: React.FC<MernStackModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [health, setHealth] = useState<IHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const fetchHealth = () => {
    setLoading(true);
    api
      .getHealth()
      .then(res => setHealth(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (!window.confirm('Reset all demo gym data back to default records?')) return;
    setResetting(true);
    try {
      const res = await api.resetDemoData();
      setResetMsg(res.message);
      onDataReset();
      fetchHealth();
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">MERN Stack Architecture Inspector</h2>
              <p className="text-xs text-slate-500">
                Full-stack system diagnostics: MongoDB • Express • React • Node.js
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resetMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{resetMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* MERN Four Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* M: MongoDB */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>M — MongoDB Layer</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Connected
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Document-oriented schemas with collection models for Members, Plans, Trainers, Attendance, and Payments.
              </p>
              {health && (
                <div className="pt-1 text-[11px] font-mono-nums text-slate-700 space-y-0.5">
                  <div>· members: {health.database.collections.members} docs</div>
                  <div>· plans: {health.database.collections.plans} docs</div>
                  <div>· trainers: {health.database.collections.trainers} docs</div>
                  <div>· attendance: {health.database.collections.attendance} docs</div>
                  <div>· payments: {health.database.collections.payments} docs</div>
                </div>
              )}
            </div>

            {/* E: Express */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>E — Express.js Router</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  REST v1 Active
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Handles RESTful controllers for check-ins, member renewals, query filtering, and billing calculations.
              </p>
              <div className="pt-1 text-[11px] font-mono-nums text-slate-500 space-y-0.5">
                <div>· GET/POST /api/members</div>
                <div>· POST /api/attendance/checkin</div>
                <div>· POST /api/attendance/checkout</div>
                <div>· POST /api/members/:id/renew</div>
              </div>
            </div>

            {/* R: React */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-cyan-600" />
                  <span>R — React SPA UI</span>
                </span>
                <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                  React 19 Vite
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Modular React components with instant barcode scanning, member profiles, and printable invoices.
              </p>
              <div className="pt-1 text-[11px] text-slate-500">
                · Zero-pill discipline & tabular numbers
              </div>
            </div>

            {/* N: Node.js */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span>N — Node.js Runtime</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono-nums">
                  {health ? health.nodeVersion : 'Node'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Server process hosting Vite middleware integration, serving static assets, and async I/O.
              </p>
              <div className="pt-1 text-[11px] font-mono-nums text-slate-500">
                · Uptime: {health ? `${health.uptimeSec}s` : '—'}
              </div>
            </div>
          </div>

          {/* Live Request Monitor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live REST API Request Log
              </span>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-slate-200 font-mono-nums text-xs">
              {health?.recentRequests && health.recentRequests.length > 0 ? (
                <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
                  {health.recentRequests.map((req, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            req.method === 'GET'
                              ? 'bg-blue-900/60 text-blue-300'
                              : req.method === 'POST'
                              ? 'bg-emerald-900/60 text-emerald-300'
                              : 'bg-amber-900/60 text-amber-300'
                          }`}
                        >
                          {req.method}
                        </span>
                        <span className="text-slate-300">{req.path}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span
                          className={
                            req.status < 400
                              ? 'text-emerald-400'
                              : req.status < 500
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {req.status}
                        </span>
                        <span>{req.durationMs}ms</span>
                        <span className="text-slate-500">{req.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500">No requests recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            {resetting ? 'Resetting...' : 'Reset Default Demo Data'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
