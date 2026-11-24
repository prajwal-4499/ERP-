import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, X } from 'lucide-react';
import { Invoice } from '../../types';
import { api } from '../../services/api';

interface InvoiceEditPinModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceEditPinModal: React.FC<InvoiceEditPinModalProps> = ({
  invoice,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('');
  const [customerName, setCustomerName] = useState(invoice.customerName);
  const [customerPhone, setCustomerPhone] = useState(invoice.customerPhone || '');
  const [newDiscount, setNewDiscount] = useState<number>(invoice.billDiscount);
  const [editableTotal, setEditableTotal] = useState<string>(invoice.grandTotal.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawNetSubtotal = Math.max(0, invoice.subtotal - invoice.itemDiscountTotal);

  const handleTotalChange = (valStr: string) => {
    setEditableTotal(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      if (rawNetSubtotal > parsed) {
        const diff = rawNetSubtotal - parsed;
        setNewDiscount(diff);
      } else {
        setNewDiscount(0);
      }
    }
  };

  const handleDiscountChange = (val: number) => {
    setNewDiscount(val);
    const newTot = Math.max(0, rawNetSubtotal - val);
    setEditableTotal(newTot.toFixed(2));
  };

  const handleAuthorizeEdit = async () => {
    try {
      setError(null);
      if (!pin) {
        setError('Please enter the 4-digit Security PIN.');
        return;
      }
      if (!reason.trim()) {
        setError('A mandatory reason is required for invoice modification audit logs.');
        return;
      }

      setIsSubmitting(true);

      const finalGrandTotal = parseFloat(editableTotal) || Math.max(0, rawNetSubtotal - newDiscount);

      await api.updateInvoiceWithPin(invoice.id, pin, reason, {
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || undefined,
        billDiscount: newDiscount,
        grandTotal: finalGrandTotal,
        paidAmount: finalGrandTotal,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900">Authorized Invoice Edit</h2>
              <p className="text-xs text-gray-500 font-normal">Enter authorized Security PIN to modify invoice {invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice:</span>
              <span className="font-bold font-mono text-blue-600">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Original Subtotal:</span>
              <span className="text-gray-900 font-mono">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Customer Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Revised Bill Discount (₹)
              </label>
              <input
                type="number"
                value={newDiscount}
                onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-rose-600 font-bold text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Final Payable Amount (₹)
              </label>
              <input
                type="number"
                value={editableTotal}
                onChange={(e) => handleTotalChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-emerald-700 font-bold text-sm focus:bg-white focus:border-blue-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Reason for Invoice Modification *
            </label>
            <input
              type="text"
              placeholder="e.g. Authorized manager discount or billing correction"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-none transition"
            />
          </div>

          {/* Security PIN Input */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-amber-900">
                Security PIN (Enter: 1234) *
              </label>
              <button
                type="button"
                onClick={() => setPin('1234')}
                className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-mono font-bold text-[10px] hover:bg-amber-300 transition"
              >
                Auto-fill PIN 1234
              </button>
            </div>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center tracking-widest text-lg font-mono font-bold p-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 font-semibold text-gray-700 border border-gray-200 transition shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAuthorizeEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shadow-amber-600/20 transition disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Authorize & Save Edit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
