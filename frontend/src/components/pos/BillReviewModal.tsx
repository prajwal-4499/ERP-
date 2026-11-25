import React, { useRef, useState, useEffect } from 'react';
import { Invoice } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import {
  generateInvoiceQrDataUrl,
  downloadInvoicePdf,
  getInvoiceQrText,
  PrinterRole,
} from '../../utils/billGenerator';
import {
  getEnglishWhatsAppMessage,
  getMarathiWhatsAppMessage,
  shareBillOnWhatsApp,
} from '../../utils/whatsappShare';
import { Download, QrCode, Printer, UserCheck, CheckCircle2, MessageSquare, Smartphone } from 'lucide-react';
import { useFocusTrap } from '../../utils/useFocusTrap';

interface BillReviewModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const BillReviewModal: React.FC<BillReviewModalProps> = ({ invoice, onClose }) => {
  const { activeStore, user } = useAuthStore();
  const [previewFormat, setPreviewFormat] = useState<'A4' | 'THERMAL'>('A4');
  
  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen: true,
    onClose,
    returnFocusSelector: '#pos-barcode-search',
  });
  
  // Default printer role based on active logged-in user
  const initialRole: PrinterRole =
    user?.role === 'MANAGER' || user?.role === 'OWNER' ? 'MANAGER' : 'CASHIER';
  const [printerRole, setPrinterRole] = useState<PrinterRole>(initialRole);
  const operatorName = user?.fullName || (printerRole === 'MANAGER' ? 'Priya Nair (Manager)' : 'Vijay Kumar (Cashier)');

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showQrTextModal, setShowQrTextModal] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Generate QR code whenever invoice, role, or operator changes
  useEffect(() => {
    let isMounted = true;
    generateInvoiceQrDataUrl(invoice, printerRole, operatorName).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [invoice, printerRole, operatorName]);

  const handleSendWhatsAppEnglish = () => {
    const msg = getEnglishWhatsAppMessage(invoice, activeStore, printerRole, operatorName);
    shareBillOnWhatsApp(invoice.customerPhone, msg);
  };

  const handleSendWhatsAppMarathi = () => {
    const msg = getMarathiWhatsAppMessage(invoice, activeStore, printerRole, operatorName);
    shareBillOnWhatsApp(invoice.customerPhone, msg);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadInvoicePdf(invoice, activeStore, printerRole, operatorName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const roleBadgeLabel = printerRole === 'MANAGER' ? 'Manager Print Bill' : 'Cashier Print Bill';

  const getA4Html = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #1f2937; margin: 0; padding: 20px; font-size: 13px; font-weight: 400; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 20px; margin: 0 0 4px 0; font-weight: 700; color: #111827; }
          .header p { margin: 2px 0; color: #4b5563; font-size: 13px; font-weight: 400; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
          .meta-label { color: #6b7280; font-weight: 400; }
          .meta-val { font-weight: 600; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }
          th { background-color: #f9fafb; color: #4b5563; font-weight: 600; text-transform: uppercase; font-size: 11px; padding: 8px 10px; text-align: left; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
          td { padding: 9px 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; font-weight: 400; vertical-align: top; color: #1f2937; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .item-sku { font-size: 11px; color: #6b7280; margin-top: 2px; font-weight: 400; }
          .totals { margin-top: 16px; width: 100%; border-top: 1px solid #e5e7eb; padding-top: 10px; }
          .totals-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; font-weight: 400; color: #4b5563; }
          .grand-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #111827; padding-top: 8px; border-top: 1.5px solid #111827; margin-top: 6px; }
          .qr-section { margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #d1d5db; padding-top: 16px; }
          .qr-box { text-align: center; border: 1.5px solid #111827; border-radius: 8px; padding: 10px 14px; background: #fff; width: 160px; }
          .qr-box img { width: 105px; height: 105px; display: block; margin: 0 auto; }
          .qr-role { font-weight: 800; font-size: 11px; text-transform: uppercase; color: #111827; margin-top: 6px; letter-spacing: 0.5px; border-top: 1px solid #e5e7eb; padding-top: 4px; }
          .qr-meta { font-size: 9.5px; color: #4b5563; margin-top: 2px; }
          .qr-action { font-size: 8.5px; color: #047857; font-weight: 700; margin-top: 3px; }
          .sig-box { text-align: right; font-size: 11px; color: #4b5563; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #6b7280; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${activeStore.name}</h1>
          <p>${activeStore.address}</p>
          <p>Phone: ${activeStore.phone} | GSTIN: ${activeStore.gstin}</p>
          <p style="margin-top: 6px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Tax Invoice / Purchase Memo</p>
        </div>

        <div class="meta-row">
          <span class="meta-label">Invoice Number:</span>
          <span class="meta-val">${invoice.invoiceNumber}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Date & Time:</span>
          <span class="meta-val">${invoice.createdAt}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Customer:</span>
          <span class="meta-val">${invoice.customerName} ${invoice.customerPhone ? `(${invoice.customerPhone})` : ''}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Payment Mode:</span>
          <span class="meta-val" style="color: #047857;">${invoice.paymentMode}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">SR.</th>
              <th>ITEMS</th>
              <th class="text-center" style="width: 50px;">QTY</th>
              <th class="text-right" style="width: 90px;">PRICE</th>
              <th class="text-right" style="width: 90px;">AMOUNT</th>
              <th class="text-right" style="width: 100px;">FINAL</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <div style="font-weight: 600; color: #111827;">${item.articleName}</div>
                  <div class="item-sku">${item.size ? `Size: ${item.size}` : ''} ${item.color ? `• Color: ${item.color}` : ''} ${item.sku ? `• SKU: ${item.sku}` : ''}</div>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₹${item.unitPrice.toFixed(2)}</td>
                <td class="text-right">₹${(item.unitPrice * item.quantity).toFixed(2)}</td>
                <td class="text-right" style="font-weight: 700;">₹${item.totalAmount.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span class="meta-label">Subtotal</span>
            <span class="meta-val">₹${invoice.subtotal.toFixed(2)}</span>
          </div>
          ${
            invoice.billDiscount > 0
              ? `
          <div class="totals-row" style="color: #dc2626;">
            <span>Bill Discount</span>
            <span>-₹${invoice.billDiscount.toFixed(2)}</span>
          </div>
          `
              : ''
          }
          <div class="grand-total">
            <span>Net Grand Total</span>
            <span style="color: #047857;">₹${invoice.grandTotal.toFixed(2)}</span>
          </div>
          <div class="totals-row" style="margin-top: 4px;">
            <span>Paid Amount</span>
            <span>₹${invoice.paidAmount.toFixed(2)}</span>
          </div>
          ${
            invoice.balanceAmount > 0
              ? `
          <div class="totals-row" style="color: #dc2626; font-weight: 700;">
            <span>Khata Balance Due</span>
            <span>₹${invoice.balanceAmount.toFixed(2)}</span>
          </div>
          `
              : ''
          }
        </div>

        <!-- Unique QR Code & Below Print Info -->
        <div class="qr-section">
          <div class="qr-box">
            ${qrDataUrl ? `<img src="${qrDataUrl}" alt="Invoice QR" />` : ''}
            <div class="qr-role">${roleBadgeLabel}</div>
            <div class="qr-meta">Printed By: ${operatorName}</div>
            <div class="qr-action">Scan QR to Download Purchase Bill</div>
          </div>

          <div class="sig-box">
            <div>For <strong>${activeStore.name}</strong></div>
            <div style="margin-top: 40px; border-top: 1px solid #111827; padding-top: 4px; font-weight: 600;">Authorized Signatory</div>
          </div>
        </div>

        <div class="footer">
          <p>Exchange allowed within 7 days with original tag and bill. Thank you for shopping with us!</p>
        </div>
      </body>
    </html>
  `;

  const getThermalHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Receipt - ${invoice.invoiceNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 3mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #000;
            margin: 0;
            padding: 6px;
            font-size: 11px;
            font-weight: 400;
            line-height: 1.35;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: 700; }
          .store-title { font-size: 14px; font-weight: 800; margin-bottom: 2px; text-transform: uppercase; }
          .divider { border-top: 1px dashed #888; margin: 5px 0; }
          .meta-line { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; font-weight: 400; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 5px 0; }
          th { border-bottom: 1px dashed #888; padding: 3px 0; text-align: left; font-size: 10px; font-weight: 600; }
          td { padding: 3px 0; vertical-align: top; font-weight: 400; }
          .total-line { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-top: 4px; }
          .qr-wrap { text-align: center; margin: 8px 0; padding: 6px; border: 1px dashed #666; border-radius: 4px; }
          .qr-wrap img { width: 95px; height: 95px; display: block; margin: 0 auto; }
          .qr-title { font-size: 10px; font-weight: 800; margin-top: 4px; text-transform: uppercase; }
          .qr-sub { font-size: 8.5px; color: #333; margin-top: 1px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="store-title">${activeStore.name}</div>
          <div>${activeStore.branch} • ${activeStore.address}</div>
          <div>Phone: ${activeStore.phone}</div>
          <div>GSTIN: ${activeStore.gstin}</div>
          <div style="margin-top: 3px; font-weight: 700;">SALES RECEIPT</div>
        </div>

        <div class="divider"></div>

        <div class="meta-line">
          <span>Invoice:</span>
          <span class="bold">${invoice.invoiceNumber}</span>
        </div>
        <div class="meta-line">
          <span>Payment:</span>
          <span class="bold">${invoice.paymentMode}</span>
        </div>
        <div class="meta-line">
          <span>Date:</span>
          <span>${invoice.createdAt}</span>
        </div>
        <div class="meta-line">
          <span>Customer:</span>
          <span>${invoice.customerName}</span>
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th>ITEM</th>
              <th style="text-align: center; width: 28px;">QTY</th>
              <th class="text-right" style="width: 48px;">PRICE</th>
              <th class="text-right" style="width: 52px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>
                  <div class="bold">${item.articleName}</div>
                  <div style="font-size: 9px; color: #555;">${item.size || ''} ${item.color ? `• ${item.color}` : ''}</div>
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td class="text-right">₹${item.unitPrice.toFixed(2)}</td>
                <td class="text-right bold">₹${item.totalAmount.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="meta-line">
          <span>Subtotal:</span>
          <span>₹${invoice.subtotal.toFixed(2)}</span>
        </div>
        ${
          invoice.billDiscount > 0
            ? `
        <div class="meta-line">
          <span>Discount:</span>
          <span>-₹${invoice.billDiscount.toFixed(2)}</span>
        </div>
        `
            : ''
        }
        <div class="total-line">
          <span>TOTAL:</span>
          <span>₹${invoice.grandTotal.toFixed(2)}</span>
        </div>
        <div class="meta-line">
          <span>Paid Amount:</span>
          <span>₹${invoice.paidAmount.toFixed(2)}</span>
        </div>
        ${
          invoice.balanceAmount > 0
            ? `
        <div class="meta-line" style="font-weight: 700; color: #b91c1c;">
          <span>Khata Due:</span>
          <span>₹${invoice.balanceAmount.toFixed(2)}</span>
        </div>
        `
            : ''
        }

        <!-- Thermal Receipt QR Code & Print Authority -->
        <div class="qr-wrap">
          ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR" />` : ''}
          <div class="qr-title">${roleBadgeLabel}</div>
          <div class="qr-sub">Printed By: ${operatorName}</div>
          <div class="qr-sub" style="font-weight: 700; margin-top: 2px;">Scan QR to Download Bill</div>
        </div>

        <div class="divider"></div>
        <div class="text-center" style="font-size: 9.5px; margin-top: 4px;">
          Exchange within 7 days with bill tag.<br/>
          *** THANK YOU VISIT AGAIN ***
        </div>
      </body>
    </html>
  `;

  const handlePrint = async (format: 'A4' | 'THERMAL') => {
    const htmlContent = format === 'A4' ? getA4Html() : getThermalHtml();

    if (format === 'THERMAL' && window.electronAPI?.printThermal) {
      try {
        const res = await window.electronAPI.printThermal({ htmlContent, silent: true });
        if (res.success) {
          alert('Receipt sent silently to ESC/POS thermal printer.');
          return;
        }
      } catch (e) {
        console.warn('Silent print fallback:', e);
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto font-sans flex flex-col max-h-[94vh]"
      >
        {/* Top Header Bar with Format Selector & Role Indicator */}
        <div className="p-4 bg-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-400 font-bold text-sm tracking-wide flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>DIGITAL BILL &amp; PRINT</span>
            </span>
            <span className="text-xs text-gray-400 font-mono">({invoice.invoiceNumber})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Manager vs Cashier Print Toggle */}
            <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 px-1 font-semibold uppercase">Print By:</span>
              <button
                type="button"
                onClick={() => setPrinterRole('MANAGER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  printerRole === 'MANAGER'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
                }`}
                title="Mark bill printed by Manager"
              >
                <span>Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setPrinterRole('CASHIER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  printerRole === 'CASHIER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
                }`}
                title="Mark bill printed by Cashier"
              >
                <span>Cashier</span>
              </button>
            </div>

            {/* A4 vs Thermal Preview Toggle */}
            <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
              <button
                type="button"
                onClick={() => setPreviewFormat('A4')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  previewFormat === 'A4'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => setPreviewFormat('THERMAL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  previewFormat === 'THERMAL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                80mm
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Printable Bill Preview Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gray-100 flex justify-center">
          {previewFormat === 'A4' ? (
            /* A4 Sheet Preview Card */
            <div
              id="bill-review-content"
              ref={printAreaRef}
              className="bg-white rounded-xl border border-gray-200 shadow-md w-full p-6 sm:p-8 space-y-5 max-w-xl"
            >
              {/* Header Section */}
              <div className="text-center space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {activeStore.name}
                </h1>
                <p className="text-xs font-normal text-gray-500">{activeStore.address}</p>
                <p className="text-xs font-normal text-gray-500">
                  Phone: {activeStore.phone} • GSTIN: {activeStore.gstin}
                </p>
                <p className="text-xs font-semibold text-gray-700 pt-1 uppercase tracking-wider">
                  Retail Sales Tax Invoice
                </p>
              </div>

              {/* Invoice Metadata */}
              <div className="space-y-1.5 text-xs font-normal pt-2 text-gray-600 border-t border-b border-gray-100 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Invoice Number:</span>
                  <span className="text-gray-900 font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Date &amp; Time:</span>
                  <span className="text-gray-900">{invoice.createdAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Customer:</span>
                  <span className="text-gray-900 font-medium">
                    {invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Method:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                      invoice.paymentMode === 'CREDIT'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {invoice.paymentMode}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] text-gray-600 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-2.5 w-10">SR.</th>
                      <th className="p-2.5">ITEMS</th>
                      <th className="p-2.5 text-center w-12">QTY</th>
                      <th className="p-2.5 text-right w-20">PRICE</th>
                      <th className="p-2.5 text-right w-20">AMOUNT</th>
                      <th className="p-2.5 text-right w-20 font-bold">FINAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition">
                        <td className="p-2.5 text-gray-500">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-medium text-gray-900">{item.articleName}</div>
                          <div className="text-[11px] text-gray-400">
                            {item.size ? `Size: ${item.size}` : ''}{' '}
                            {item.color ? `• ${item.color}` : ''}
                          </div>
                        </td>
                        <td className="p-2.5 text-center text-gray-700">{item.quantity}</td>
                        <td className="p-2.5 text-right text-gray-700">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right text-gray-700">
                          ₹{(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right font-semibold text-gray-900">
                          ₹{item.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{invoice.subtotal.toFixed(2)}</span>
                </div>

                {invoice.billDiscount > 0 && (
                  <div className="flex justify-between items-center text-rose-600 font-medium">
                    <span>Bill Discount</span>
                    <span>-₹{invoice.billDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-900 pt-2 flex justify-between items-center text-sm font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-lg text-emerald-800 font-extrabold">
                    ₹{invoice.grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600 pt-0.5">
                  <span>Paid Amount</span>
                  <span className="font-semibold text-gray-900">₹{invoice.paidAmount.toFixed(2)}</span>
                </div>

                {invoice.balanceAmount > 0 && (
                  <div className="flex justify-between items-center text-rose-600 font-bold">
                    <span>Khata Due / Balance</span>
                    <span>₹{invoice.balanceAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Unique QR Code & Below Authority Badge */}
              <div className="pt-4 border-t border-dashed border-gray-300 flex items-center justify-between gap-4">
                <div
                  onClick={handleDownloadPdf}
                  className="cursor-pointer group p-3 rounded-xl border-2 border-gray-900 bg-white shadow-xs hover:border-emerald-600 hover:bg-emerald-50/40 transition text-center max-w-[170px]"
                  title="Click to Download Bill PDF"
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Unique Bill QR Code"
                      className="w-24 h-24 mx-auto group-hover:scale-105 transition transform"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs mx-auto">
                      Generating QR...
                    </div>
                  )}

                  {/* Below QR: Manager Print Bill / Cashier Print Bill */}
                  <div className="mt-2 pt-1 border-t border-gray-200">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                        printerRole === 'MANAGER'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {roleBadgeLabel}
                    </span>
                    <div className="text-[10px] text-gray-600 mt-1 font-medium truncate">
                      Printed by: {operatorName}
                    </div>
                    <div className="text-[9px] text-emerald-700 font-bold mt-0.5 flex items-center justify-center gap-1">
                      <Download className="w-2.5 h-2.5" />
                      <span>Click to Download</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1 text-xs text-gray-500">
                  <div className="text-gray-900 font-semibold">For {activeStore.name}</div>
                  <div className="h-12 flex items-end justify-end">
                    <div className="border-t border-gray-900 w-32 text-center text-[10px] text-gray-700 pt-1 font-medium">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Thermal 80mm Roll Preview Card */
            <div className="bg-white rounded-lg border border-gray-300 shadow-md p-5 w-80 font-mono text-xs space-y-3">
              <div className="text-center">
                <div className="font-bold text-sm text-gray-900 uppercase">{activeStore.name}</div>
                <div className="text-[10px] text-gray-600">{activeStore.branch} • {activeStore.address}</div>
                <div className="text-[10px] text-gray-600">Phone: {activeStore.phone}</div>
                <div className="text-[10px] text-gray-600">GSTIN: {activeStore.gstin}</div>
                <div className="text-[10px] font-bold mt-1 text-gray-800 uppercase">SALES RECEIPT</div>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Invoice:</span>
                  <span className="font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{invoice.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{invoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-bold">{invoice.paymentMode}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th>ITEM</th>
                      <th className="text-center">QTY</th>
                      <th className="text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-1">
                          <div className="font-semibold">{item.articleName}</div>
                          <div className="text-[9px] text-gray-500">
                            {item.size || ''} {item.color || ''}
                          </div>
                        </td>
                        <td className="text-center py-1">{item.quantity}</td>
                        <td className="text-right font-bold py-1">₹{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.billDiscount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-₹{invoice.billDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-400">
                  <span>NET TOTAL:</span>
                  <span>₹{invoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>₹{invoice.paidAmount.toFixed(2)}</span>
                </div>
                {invoice.balanceAmount > 0 && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Khata Due:</span>
                    <span>₹{invoice.balanceAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Thermal QR Code Container & Below Indicator */}
              <div
                onClick={handleDownloadPdf}
                className="cursor-pointer border border-dashed border-gray-500 rounded p-3 text-center my-2 bg-gray-50 hover:bg-emerald-50 transition"
                title="Click to Download Bill PDF"
              >
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 mx-auto" />
                )}
                <div className="font-extrabold text-[10px] mt-1.5 uppercase text-gray-900">
                  {roleBadgeLabel}
                </div>
                <div className="text-[9px] text-gray-600">Printed By: {operatorName}</div>
                <div className="text-[8.5px] text-emerald-700 font-bold mt-0.5">
                  Scan QR to Download Bill
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
                Exchange allowed within 7 days.<br/>
                Thank you for your visit!
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions with WhatsApp English & Marathi + Print + PDF Download */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Bill Print Stamped As:{' '}
                  <strong className="text-gray-900">{roleBadgeLabel}</strong>
                </span>
              </span>

              {/* View QR Code Text Button */}
              <button
                type="button"
                onClick={() => setShowQrTextModal(true)}
                className="px-2.5 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-bold transition flex items-center gap-1"
                title="View what phones see when scanning this QR"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                <span>QR Scan View</span>
              </button>
            </div>

            {/* WhatsApp Buttons (English & Marathi) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleSendWhatsAppEnglish}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                title="Send bill summary to customer via WhatsApp in English"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp (ENG)</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsAppMarathi}
                className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-900 font-extrabold text-xs shadow-xs transition flex items-center gap-1.5"
                title="ग्राहकाला व्हॉट्सॲपवर मराठीमध्ये बिल पाठवा"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-900" />
                <span>व्हॉट्सॲप (मराठी)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap pt-1 border-t border-gray-200">
            {/* Direct Download Bill PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Bill Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Purchase Bill'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handlePrint('A4')}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrint('THERMAL')}
              className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 80mm</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-medium text-xs border border-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Scanned QR Receipt Text Modal */}
      {showQrTextModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-5 max-w-md w-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span>Mobile Camera QR Scan Output</span>
              </span>
              <button
                type="button"
                onClick={() => setShowQrTextModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-gray-500">
              When any smartphone camera or Google Lens scans this bill’s QR code, it instantly displays this full digital text receipt:
            </p>

            <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[10px] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap select-all">
              {getInvoiceQrText(invoice, printerRole, operatorName)}
            </pre>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getInvoiceQrText(invoice, printerRole, operatorName));
                  alert('Scanned QR Receipt text copied to clipboard!');
                }}
                className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-800 transition"
              >
                Copy Receipt Text
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white transition flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Bill PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
