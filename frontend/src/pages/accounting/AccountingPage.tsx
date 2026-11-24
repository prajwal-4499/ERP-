import React, { useState, useEffect } from 'react';
import {
  WalletCards,
  Plus,
  Receipt,
  CheckCircle2,
  Banknote,
} from 'lucide-react';
import { CashShift, Expense } from '../../types';
import { api } from '../../services/api';

export const AccountingPage: React.FC = () => {
  const [cashShift, setCashShift] = useState<CashShift | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [shiftReconciled, setShiftReconciled] = useState(false);

  const [expenseCategory, setExpenseCategory] = useState('Packaging');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseMode, setExpenseMode] = useState('CASH');
  const [expenseDesc, setExpenseDesc] = useState('');

  useEffect(() => {
    loadAccountingData();
  }, []);

  const loadAccountingData = async () => {
    const shift = await api.getCurrentCashShift();
    const expList = await api.getExpenses();
    setCashShift(shift);
    setExpenses(expList);
    setActualCashInput(shift.actualCash);
  };

  const handleReconcileShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await api.reconcileCashShift(actualCashInput, closingNotes);
    setCashShift(updated);
    setShiftReconciled(true);
    setTimeout(() => setShiftReconciled(false), 3000);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    await api.addExpense({
      category: expenseCategory,
      amount: expenseAmount,
      paymentMode: expenseMode,
      description: expenseDesc,
    });

    setExpenseAmount(0);
    setExpenseDesc('');
    loadAccountingData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Cash Shift Reconciliation &amp; Expenses
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Cashier drawer reconciliation, expected vs actual cash, day closing &amp; store expenses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cashier Shift Reconciliation */}
        {cashShift && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold border border-emerald-100">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1F2937]">Active Shift Drawer Reconciliation</h3>
                  <div className="text-xs text-gray-500">
                    Cashier: <strong className="text-gray-800">{cashShift.cashierName}</strong> • Started: {cashShift.startTime}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#10B981] border border-emerald-200">
                DRAWER ACTIVE
              </span>
            </div>

            {/* Shift Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-gray-500 text-[10px] font-sans font-semibold">Opening Float</div>
                <div className="text-base font-black text-[#1F2937] mt-0.5">₹{cashShift.openingCash.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-gray-500 text-[10px] font-sans font-semibold">+ Cash Sales</div>
                <div className="text-base font-black text-[#10B981] mt-0.5">₹{cashShift.cashSales.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-gray-500 text-[10px] font-sans font-semibold">+ Cash Received</div>
                <div className="text-base font-black text-[#2563EB] mt-0.5">₹{cashShift.cashReceived.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-gray-500 text-[10px] font-sans font-semibold">- Cash Expenses</div>
                <div className="text-base font-black text-[#EF4444] mt-0.5">₹{cashShift.cashExpenses.toLocaleString()}</div>
              </div>
            </div>

            {/* Expected Cash Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wide">System Expected Drawer Cash</div>
                <div className="text-3xl font-black font-mono text-[#1F2937] mt-1">
                  ₹{cashShift.expectedCash.toLocaleString()}
                </div>
              </div>
              <div className="text-right text-xs font-bold text-[#10B981] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                100% Traceable
              </div>
            </div>

            {/* Reconciliation Form */}
            <form onSubmit={handleReconcileShift} className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-[#1F2937]">Count &amp; Reconcile Physical Cash in Drawer</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 font-semibold mb-1">Physical Cash Counted (₹)</label>
                  <input
                    type="number"
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[#10B981] font-black text-base focus:bg-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-semibold mb-1">Shift Closing Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. End of evening shift drawer handover"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937]"
                  />
                </div>
              </div>

              {/* Difference Shortage/Excess Badge */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-600 font-sans font-medium">Reconciliation Variance:</span>
                <span
                  className={`font-black ${
                    actualCashInput - cashShift.expectedCash === 0
                      ? 'text-[#10B981]'
                      : actualCashInput - cashShift.expectedCash < 0
                      ? 'text-[#EF4444]'
                      : 'text-amber-600'
                  }`}
                >
                  {actualCashInput - cashShift.expectedCash === 0
                    ? '✓ Balanced (Zero Difference)'
                    : `Difference: ₹${actualCashInput - cashShift.expectedCash} (${
                        actualCashInput - cashShift.expectedCash < 0 ? 'Shortage' : 'Excess'
                      })`}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reconcile Shift (Day Closing)</span>
                </button>
              </div>

              {shiftReconciled && (
                <div className="p-3 text-center text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl font-bold">
                  ✓ Shift successfully reconciled and audited!
                </div>
              )}
            </form>
          </div>
        )}

        {/* Right Column: Record Expense */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Receipt className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-extrabold text-base text-[#1F2937]">Record Shop Expense</h3>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 mb-1 font-semibold">Expense Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-semibold"
              >
                <option value="Packaging">Packaging &amp; Carry Bags</option>
                <option value="Electricity">Electricity &amp; Power</option>
                <option value="Salary">Staff Salary / Advance</option>
                <option value="Transport">Freight / Transport Logistics</option>
                <option value="Maintenance">Shop Maintenance / Repair</option>
                <option value="Internet">Internet &amp; Telephony</option>
                <option value="Marketing">Marketing &amp; Printing</option>
                <option value="Rent">Shop Rent</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-semibold">Amount (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={expenseAmount || ''}
                onChange={(e) => setExpenseAmount(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[#EF4444] font-black text-sm focus:bg-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-semibold">Payment Mode</label>
              <select
                value={expenseMode}
                onChange={(e) => setExpenseMode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-semibold"
              >
                <option value="CASH">Cash Drawer</option>
                <option value="UPI">UPI / Digital</option>
                <option value="BANK_TRANSFER">Bank Wire</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-semibold">Description / Details</label>
              <textarea
                rows={2}
                placeholder="Details of expenditure..."
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/20 transition"
            >
              Add Expense Voucher
            </button>
          </form>

          {/* Recent Expenses List */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <h4 className="text-[11px] font-extrabold text-gray-500 uppercase">Recent Expenses</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-[#1F2937]">{exp.category}</div>
                    <div className="text-[10px] text-gray-500">{exp.expenseDate} • {exp.paymentMode}</div>
                  </div>
                  <span className="font-mono text-[#EF4444] font-black">₹{exp.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
