import React, { useState } from 'react';
import { DollarSign, Plus, Receipt, FileText, CheckCircle2, Search, Printer, X } from 'lucide-react';
import { IPayment, IMember, IPlan } from '../types/index.ts';
import { api } from '../api/client.ts';

interface BillingViewProps {
  payments: IPayment[];
  members: IMember[];
  plans: IPlan[];
  onRefresh: () => void;
  onSelectMember: (memberId: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  payments,
  members,
  plans,
  onRefresh,
  onSelectMember,
}) => {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<IPayment | null>(null);

  // New payment form state
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?._id || '');
  const [amount, setAmount] = useState('55');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Debit Card' | 'UPI/Online' | 'Bank Transfer'>('Credit Card');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = payments.filter(p => {
    if (methodFilter !== 'all' && p.paymentMethod !== methodFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.memberName.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setSaving(true);
    try {
      await api.createPayment({
        memberId: selectedMemberId,
        amount: Number(amount),
        paymentMethod,
        receiptNotes: notes,
      });
      setRecordModalOpen(false);
      setNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Billing & Payment Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track subscription revenue, tax invoices, cash drawer, and digital receipt generation.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedMemberId(members[0]?._id || '');
            setRecordModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">Total Gross Revenue</div>
          <div className="text-2xl font-bold font-mono-nums text-slate-900">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">Across all payment channels</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">Invoices Issued</div>
          <div className="text-2xl font-bold font-mono-nums text-slate-900">{payments.length}</div>
          <div className="text-[11px] text-slate-500 font-mono-nums">
            {payments.filter(p => p.status === 'Paid').length} completed receipts
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">Average Order Value</div>
          <div className="text-2xl font-bold font-mono-nums text-slate-900">
            ${payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0}
          </div>
          <div className="text-[11px] text-slate-500">Per membership transaction</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by invoice # (INV-...), athlete, or plan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Method:</label>
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
          >
            <option value="all">All Payment Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI/Online">UPI / Online</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No payments match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Athlete / Member</th>
                  <th className="py-3 px-4">Membership Item</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono-nums font-semibold text-slate-900">
                      {p.invoiceNumber}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectMember(p.memberId)}
                        className="font-semibold text-slate-900 hover:text-orange-600 transition-colors text-left"
                      >
                        {p.memberName}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-slate-700">{p.planName}</td>

                    <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>

                    <td className="py-3 px-4 font-mono-nums text-slate-500">{p.paymentDate}</td>

                    <td className="py-3 px-4 font-mono-nums font-bold text-slate-900 text-right">
                      ${p.amount}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setReceiptPayment(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono-nums">
          <span>Showing {filtered.length} of {payments.length} transactions</span>
          <span>ApexIron Payments Collection</span>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Record Offline / Manual Payment</h2>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} ({m.memberCode}) — {m.planName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="Credit Card">Credit Card Terminal</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI/Online">UPI / Instant QR</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Personal training add-on, locker fee..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
                >
                  {saving ? 'Recording...' : 'Record Payment & Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt / Invoice Modal */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Official Gym Payment Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptPayment(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-8 space-y-6 font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">ApexIron Gym</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Strength & Conditioning Center</p>
                  <p className="text-xs text-slate-400">100 Fitness Boulevard, Suite 400</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono-nums text-slate-900">
                    {receiptPayment.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-500 font-mono-nums">
                    Date: {receiptPayment.paymentDate}
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    PAID IN FULL
                  </span>
                </div>
              </div>

              {/* Billed to */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-400 uppercase font-semibold text-[10px]">Received From:</div>
                <div className="text-sm font-bold text-slate-900">{receiptPayment.memberName}</div>
                <div className="text-slate-500">Method: {receiptPayment.paymentMethod}</div>
              </div>

              {/* Itemized Line */}
              <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-semibold uppercase text-[10px]">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between font-medium text-slate-900">
                  <span>{receiptPayment.planName}</span>
                  <span className="font-mono-nums font-bold">${receiptPayment.amount}.00</span>
                </div>
                {receiptPayment.receiptNotes && (
                  <div className="text-[11px] text-slate-500 italic">
                    Note: {receiptPayment.receiptNotes}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="text-xl font-black font-mono-nums">${receiptPayment.amount}.00</span>
              </div>

              <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-slate-100">
                Thank you for training with ApexIron Gym. Keep pushing your limits!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
