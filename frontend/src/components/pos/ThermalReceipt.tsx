import React, { useState, useEffect } from 'react';
import { Invoice } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import {
  generateInvoiceQrDataUrl,
  downloadInvoicePdf,
  PrinterRole,
} from '../../utils/billGenerator';
import {
  getEnglishWhatsAppMessage,
  getMarathiWhatsAppMessage,
  shareBillOnWhatsApp,
} from '../../utils/whatsappShare';
import { Download, QrCode, MessageSquare } from 'lucide-react';
import { useFocusTrap } from '../../utils/useFocusTrap';

interface ThermalReceiptProps {
  invoice: Invoice;
  onClose?: () => void;
  onPrint?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  invoice,
  onClose,
  onPrint,
}) => {
  const { activeStore, user } = useAuthStore();
  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen: true,
    onClose,
    returnFocusSelector: '#pos-barcode-search',
  });
  const initialRole: PrinterRole =
    user?.role === 'MANAGER' || user?.role === 'OWNER' ? 'MANAGER' : 'CASHIER';
  const [printerRole, setPrinterRole] = useState<PrinterRole>(initialRole);
  const operatorName = user?.fullName || (printerRole === 'MANAGER' ? 'Priya Nair (Manager)' : 'Vijay Kumar (Cashier)');

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    generateInvoiceQrDataUrl(invoice, printerRole, operatorName).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [invoice, printerRole, operatorName]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadInvoicePdf(invoice, activeStore, printerRole, operatorName);
    } catch (e) {
      console.error(e);
      alert('Error downloading bill');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (window.electronAPI?.printThermal) {
      const receiptEl = document.getElementById('thermal-receipt');
      if (receiptEl) {
        try {
          const res = await window.electronAPI.printThermal({
            htmlContent: receiptEl.innerHTML,
            silent: true,
          });
          if (res.success) {
            alert('Receipt sent silently to ESC/POS thermal printer.');
            return;
          }
        } catch (e) {
          console.warn('Silent print fallback:', e);
        }
      }
    }

    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const roleBadgeLabel = printerRole === 'MANAGER' ? 'Manager Print Bill' : 'Cashier Print Bill';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-sm w-full shadow-2xl flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-white font-bold text-sm">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Thermal Receipt (80mm)</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            Close (Esc)
          </button>
        </div>

        {/* Print Operator Selector */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">Print Stamped As:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPrinterRole('MANAGER')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                printerRole === 'MANAGER'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => setPrinterRole('CASHIER')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                printerRole === 'CASHIER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Cashier
            </button>
          </div>
        </div>

        {/* The Printable 80mm ESC/POS Container */}
        <div
          className="flex-1 overflow-y-auto my-3 bg-white text-black p-4 font-sans text-[11px] leading-snug rounded shadow-inner"
          id="thermal-receipt"
        >
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-gray-400">
            <div className="font-extrabold text-sm uppercase tracking-wider">{activeStore.name}</div>
            <div className="text-[10px] text-gray-700">{activeStore.branch}</div>
            <div className="text-[10px] text-gray-700">{activeStore.address}</div>
            <div className="text-[10px] font-semibold mt-1">GSTIN: {activeStore.gstin}</div>
            <div className="text-[10px]">Phone: {activeStore.phone}</div>
          </div>

          {/* Invoice Meta */}
          <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>
                Invoice No: <strong>{invoice.invoiceNumber}</strong>
              </span>
              <span>{invoice.invoiceType}</span>
            </div>
            <div className="flex justify-between">
              <span>Date: {invoice.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer: {invoice.customerName}</span>
              {invoice.customerPhone && <span>Ph: {invoice.customerPhone}</span>}
            </div>
            <div className="flex justify-between">
              <span>Cashier: {invoice.cashierName}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full my-2 text-left text-[10px]">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dotted divide-gray-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1 pr-1">
                    <div className="font-semibold truncate max-w-[120px]">{item.articleName}</div>
                    <div className="text-[9px] text-gray-600">
                      {item.color} | {item.size} | {item.sku}
                    </div>
                  </td>
                  <td className="py-1 text-center font-bold">{item.quantity}</td>
                  <td className="py-1 text-right">₹{item.unitPrice}</td>
                  <td className="py-1 text-right font-bold">₹{item.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Tax */}
          <div className="pt-2 border-t border-dashed border-gray-400 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.billDiscount > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Discount:</span>
                <span>-₹{invoice.billDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-700">
              <span>CGST (2.5%):</span>
              <span>₹{(invoice.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>SGST (2.5%):</span>
              <span>₹{(invoice.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-black text-black">
              <span>NET GRAND TOTAL:</span>
              <span>₹{invoice.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-0.5">
              <span>Payment Mode:</span>
              <span className="uppercase">{invoice.paymentMode}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span>₹{invoice.paidAmount.toFixed(2)}</span>
            </div>
            {invoice.balanceAmount > 0 && (
              <div className="flex justify-between font-bold text-rose-700">
                <span>Balance / Khata Due:</span>
                <span>₹{invoice.balanceAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Unique QR Code & Authority Indicator Below QR */}
          <div
            onClick={handleDownload}
            className="my-3 p-2 border border-dashed border-gray-400 rounded text-center cursor-pointer hover:bg-gray-50"
            title="Click to Download Purchase Bill PDF"
          >
            {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 mx-auto" />}
            <div className="font-extrabold text-[10px] mt-1 uppercase tracking-wide text-gray-900">
              {roleBadgeLabel}
            </div>
            <div className="text-[9px] text-gray-600">Printed By: {operatorName}</div>
            <div className="text-[8.5px] text-emerald-700 font-bold mt-0.5">
              Scan QR to Download Bill
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 border-t border-dashed border-gray-400 text-[9px] text-gray-600 space-y-0.5">
            <p>Exchange allowed within 7 days with original bill &amp; tag.</p>
            <p className="font-semibold">*** THANK YOU FOR SHOPPING WITH US! ***</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          {/* WhatsApp Action Row */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const msg = getEnglishWhatsAppMessage(invoice, activeStore, printerRole, operatorName);
                shareBillOnWhatsApp(invoice.customerPhone, msg);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-[11px] text-white transition flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp (ENG)</span>
            </button>
            <button
              onClick={() => {
                const msg = getMarathiWhatsAppMessage(invoice, activeStore, printerRole, operatorName);
                shareBillOnWhatsApp(invoice.customerPhone, msg);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] font-extrabold text-[11px] text-slate-900 transition flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3 h-3 text-slate-900" />
              <span>व्हॉट्सॲप (मराठी)</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading...' : 'Download Bill'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-lg transition"
            >
              Print Thermal (Ctrl+P)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
