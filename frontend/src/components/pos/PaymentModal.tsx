import React, { useState, useEffect } from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { Invoice, PaymentMode, SplitPayment } from '../../types';

interface PaymentModalProps {
  initialMode?: 'CASH' | 'DIGITAL' | 'SPLIT' | 'CREDIT';
  onClose: () => void;
  onInvoiceCreated: (invoice: Invoice) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  initialMode = 'CASH',
  onClose,
  onInvoiceCreated,
}) => {
  const { items, customer, discountType, getTotals, clearCart } = useCartStore();
  const { user, activeStore } = useAuthStore();
  const totals = getTotals();

  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    initialMode === 'DIGITAL' ? 'UPI' : initialMode === 'SPLIT' ? 'SPLIT' : initialMode === 'CREDIT' ? 'CREDIT' : 'CASH'
  );

  const [cashTendered, setCashTendered] = useState<number>(totals.grandTotal);
  const [digitalRef, setDigitalRef] = useState<string>('');

  const [splitDetails, setSplitDetails] = useState<SplitPayment>({
    cash: totals.grandTotal,
    upi: 0,
    card: 0,
    credit: 0,
    cheque: 0,
    bankTransfer: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCashTendered(totals.grandTotal);
    setSplitDetails({
      cash: totals.grandTotal,
      upi: 0,
      card: 0,
      credit: 0,
      cheque: 0,
      bankTransfer: 0,
    });
  }, [totals.grandTotal]);

  const cashChange = Math.max(0, cashTendered - totals.grandTotal);

  const splitTotal =
    (Number(splitDetails.cash) || 0) +
    (Number(splitDetails.upi) || 0) +
    (Number(splitDetails.card) || 0) +
    (Number(splitDetails.credit) || 0) +
    (Number(splitDetails.cheque) || 0) +
    (Number(splitDetails.bankTransfer) || 0);

  const splitDiff = totals.grandTotal - splitTotal;

  const handleCompleteSale = async () => {
    // 1. Double-submission prevention guard
    if (isProcessing) return;

    try {
      setError(null);
      setIsProcessing(true);

      if (paymentMode === 'CREDIT') {
        if (!customer) {
          setError('Customer profile is mandatory for Credit / Khata sales.');
          setIsProcessing(false);
          return;
        }
        if (customer.outstandingBalance + totals.grandTotal > customer.creditLimit) {
          setError(
            `Credit limit exceeded! Limit: ₹${customer.creditLimit}, Current Due: ₹${customer.outstandingBalance}, Bill: ₹${totals.grandTotal}`
          );
          setIsProcessing(false);
          return;
        }
      }

      if (paymentMode === 'SPLIT' && splitDiff !== 0) {
        setError(`Split amounts do not balance with Grand Total (Difference: ₹${splitDiff}).`);
        setIsProcessing(false);
        return;
      }

      if (paymentMode === 'CASH' && cashTendered < totals.grandTotal) {
        setError('Cash received cannot be less than Grand Total. Use Split or Khata for partial payments.');
        setIsProcessing(false);
        return;
      }

      const invoicePayload: Partial<Invoice> = {
        invoiceType: 'RETAIL',
        customerId: customer?.id,
        customerName: customer ? customer.name : 'Walk-in Customer',
        customerPhone: customer?.phone,
        cashierId: user?.id || 1,
        cashierName: user?.fullName || 'Cashier',
        branchName: activeStore?.branch || activeStore?.name || 'Pargaon (Mangrul)',
        subtotal: totals.subtotal,
        itemDiscountTotal: totals.itemDiscountTotal,
        billDiscount: totals.billDiscountAmount,
        discountType: discountType,
        taxAmount: totals.taxAmount,
        cgstAmount: totals.cgstAmount,
        sgstAmount: totals.sgstAmount,
        igstAmount: totals.igstAmount,
        isInterState: totals.isInterState,
        grandTotal: totals.grandTotal,
        paidAmount: paymentMode === 'CREDIT' ? 0 : totals.grandTotal,
        balanceAmount: paymentMode === 'CREDIT' ? totals.grandTotal : 0,
        paymentMode: paymentMode,
        splitDetails: paymentMode === 'SPLIT' ? splitDetails : undefined,
        status: paymentMode === 'CREDIT' ? 'CREDIT' : 'COMPLETED',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        items: items.map((i, idx) => ({
          id: idx + 1,
          articleName: i.articleName,
          sku: i.sku,
          barcode: i.barcode,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
          totalAmount: i.isReturn ? -i.total : i.total,
          unitType: i.unitType || 'PCS',
          hsnCode: i.hsnCode || '6205',
          salesmanName: i.salesmanName,
          isReturn: i.isReturn || false,
        })),
      };

      const createdInvoice = await api.createInvoice(invoicePayload);
      clearCart();
      onInvoiceCreated(createdInvoice);
    } catch (err: any) {
      setError(err?.message || 'Error processing payment and creating invoice.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcut listener within modal (Escape to cancel, Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        const isInput =
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement;

        // If not typing in input or if enter pressed on submit
        if (!isProcessing && (!isInput || (document.activeElement as HTMLElement)?.tagName === 'BUTTON')) {
          e.preventDefault();
          handleCompleteSale();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, totals, paymentMode, splitDiff, cashTendered, customer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold text-base border border-emerald-100">
              ₹
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1F2937]">POS Payment Settlement</h2>
              <p className="text-xs text-gray-500">
                Total payable amount: <span className="text-[#10B981] font-bold font-mono text-sm">₹{totals.grandTotal.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-5 gap-1.5 p-3 bg-gray-50/60 border-b border-gray-200">
          {[
            { id: 'CASH', label: 'Cash (F5)', icon: Banknote },
            { id: 'UPI', label: 'UPI / QR (F6)', icon: QrCode },
            { id: 'CARD', label: 'Card Swiped', icon: CreditCard },
            { id: 'SPLIT', label: 'Split (F8)', icon: Layers },
            { id: 'CREDIT', label: 'Khata Credit', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = paymentMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPaymentMode(tab.id as PaymentMode);
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200/60'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* CASH MODE */}
          {paymentMode === 'CASH' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Cash Amount Received (₹)
                </label>
                <input
                  type="number"
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                  placeholder="Enter cash received"
                  className="w-full text-2xl font-mono font-bold p-3 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-[#1F2937]"
                  autoFocus
                />
              </div>

              {/* Quick Cash Suggestions */}
              <div className="flex gap-2">
                {[totals.grandTotal, Math.ceil(totals.grandTotal / 100) * 100, Math.ceil(totals.grandTotal / 500) * 500, Math.ceil(totals.grandTotal / 1000) * 1000]
                  .filter((v, i, a) => a.indexOf(v) === i && v >= totals.grandTotal)
                  .map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashTendered(val)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-mono font-bold text-gray-700 transition"
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Change Due to Customer:</span>
                <span className="font-mono text-xl font-black text-[#10B981]">
                  ₹{cashChange.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* UPI / QR MODE */}
          {paymentMode === 'UPI' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-slate-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Scan to Pay via PhonePe, GPay, Paytm</div>
                  <div className="text-[11px] text-gray-500 font-mono">UPI ID: 8999308582@ybl</div>
                  <div className="text-xs font-mono font-bold text-[#10B981] mt-1">₹{totals.grandTotal.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  UPI / Bank Reference / UTR (Optional)
                </label>
                <input
                  type="text"
                  value={digitalRef}
                  onChange={(e) => setDigitalRef(e.target.value)}
                  placeholder="e.g. 403819283721"
                  className="w-full text-sm font-mono p-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[#1F2937]"
                />
              </div>
            </div>
          )}

          {/* CARD MODE */}
          {paymentMode === 'CARD' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-2 text-center">
                <CreditCard className="w-10 h-10 text-[#2563EB] mx-auto" />
                <div className="text-xs font-bold text-blue-900">Swipe or Tap Card on EDC POS Machine</div>
                <div className="text-sm font-mono font-bold text-[#2563EB]">Charge Amount: ₹{totals.grandTotal.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* SPLIT PAYMENT MODE */}
          {paymentMode === 'SPLIT' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Cash (₹)</label>
                  <input
                    type="number"
                    value={splitDetails.cash}
                    onChange={(e) => setSplitDetails({ ...splitDetails, cash: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 font-mono text-[#1F2937] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">UPI / QR (₹)</label>
                  <input
                    type="number"
                    value={splitDetails.upi}
                    onChange={(e) => setSplitDetails({ ...splitDetails, upi: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 font-mono text-[#1F2937] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Card (₹)</label>
                  <input
                    type="number"
                    value={splitDetails.card}
                    onChange={(e) => setSplitDetails({ ...splitDetails, card: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 font-mono text-[#1F2937] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Khata Credit (₹)</label>
                  <input
                    type="number"
                    value={splitDetails.credit}
                    onChange={(e) => setSplitDetails({ ...splitDetails, credit: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 font-mono text-[#1F2937] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Cheque (₹)</label>
                  <input
                    type="number"
                    value={splitDetails.cheque}
                    onChange={(e) => setSplitDetails({ ...splitDetails, cheque: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 font-mono text-[#1F2937] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-semibold">Bank Wire (₹)</label>
                  <input
                    type="number"
                    value={splitDetails.bankTransfer}
                    onChange={(e) => setSplitDetails({ ...splitDetails, bankTransfer: Number(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-300 font-mono text-[#1F2937] font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex justify-between text-xs font-mono">
                <span>Sum Tendered: <strong>₹{splitTotal}</strong></span>
                <span className={splitDiff === 0 ? 'text-[#10B981] font-bold' : 'text-[#EF4444] font-bold'}>
                  {splitDiff === 0 ? '✓ Balanced' : `Difference: ₹${splitDiff}`}
                </span>
              </div>
            </div>
          )}

          {/* CREDIT MODE */}
          {paymentMode === 'CREDIT' && (
            <div className="space-y-3">
              {customer ? (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Customer Name:</span>
                    <span className="font-bold text-[#1F2937] text-sm">{customer.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Current Outstanding Due:</span>
                    <span className="font-mono text-amber-600 font-bold">₹{customer.outstandingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Allowed Credit Limit:</span>
                    <span className="font-mono text-[#10B981] font-bold">₹{customer.creditLimit.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-xs font-bold">
                    <span className="text-[#2563EB]">Total After This Bill:</span>
                    <span className="font-mono text-[#1F2937]">₹{(customer.outstandingBalance + totals.grandTotal).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
                  Please link a Customer from the POS screen before choosing Credit sale.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 border border-gray-200 transition"
          >
            Cancel (Esc)
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCompleteSale}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? 'Recording...' : 'Complete & Print Invoice (Enter)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
