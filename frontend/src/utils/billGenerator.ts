import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Invoice } from '../types';

export type PrinterRole = 'MANAGER' | 'CASHIER';

export interface PrintMeta {
  printerRole: PrinterRole;
  operatorName: string;
  printedAt: string;
}

/**
 * Formats a clean, human-readable text receipt that any smartphone camera
 * (Google Lens, iPhone Camera, Samsung, Vivo, Oppo) instantly displays on screen when scanned.
 */
export function getInvoiceQrText(
  invoice: Invoice,
  printerRole: PrinterRole = 'CASHIER',
  operatorName: string = 'Staff'
): string {
  const printedLabel = printerRole === 'MANAGER' ? 'Manager Print Bill' : 'Cashier Print Bill';
  const itemsText = invoice.items
    .slice(0, 10)
    .map((item, idx) => {
      const qtyStr = item.unitType === 'METER' ? `${item.quantity} Mtr` : `x${item.quantity}`;
      const returnTag = item.isReturn ? ' [RETURN]' : '';
      return `${idx + 1}. ${item.articleName} (${item.size || ''} ${item.color || ''})${returnTag} ${qtyStr} = Rs.${item.totalAmount.toLocaleString('en-IN')}`;
    })
    .join('\n');

  const moreItems = invoice.items.length > 10 ? `\n...and ${invoice.items.length - 10} more items` : '';
  const taxSummary = invoice.isInterState
    ? `IGST: Rs. ${(invoice.igstAmount || invoice.taxAmount).toFixed(2)}`
    : `CGST: Rs. ${(invoice.cgstAmount || invoice.taxAmount / 2).toFixed(2)} | SGST: Rs. ${(invoice.sgstAmount || invoice.taxAmount / 2).toFixed(2)}`;
  const creditNoteText = invoice.creditNoteIssued && invoice.creditNoteIssued > 0
    ? `\nStore Credit Note Issued: Rs. ${invoice.creditNoteIssued.toLocaleString('en-IN')}`
    : '';
  const salesmanText = invoice.salesmanName ? `\nStaff: ${invoice.salesmanName}` : '';

  return `===============================
SHRAVANI COLLECTION & NEW SK TELORS
Pargaon (Mangrul) | Ph: 8999308582
GSTIN: 27AABCU9603R1ZM
===============================
INVOICE: ${invoice.invoiceNumber}
Date: ${invoice.createdAt}
Customer: ${invoice.customerName}${invoice.customerPhone ? ` (${invoice.customerPhone})` : ''}${salesmanText}
-------------------------------
PURCHASED ITEMS:
${itemsText}${moreItems}
-------------------------------
${taxSummary}
GRAND TOTAL: Rs. ${invoice.grandTotal.toLocaleString('en-IN')}
Payment: ${invoice.paymentMode} | Paid: Rs. ${invoice.paidAmount.toLocaleString('en-IN')}${
    invoice.balanceAmount > 0 ? `\nKhata Due: Rs. ${invoice.balanceAmount.toLocaleString('en-IN')}` : ''
  }${creditNoteText}
-------------------------------
[${printedLabel.toUpperCase()}]
Printed by: ${operatorName}
-------------------------------
Exchange within 7 days with bill.
Thank you! Visit again!
===============================`;
}

/**
 * Generate a unique QR Code Data URL for an invoice.
 * Encodes legible digital text receipt for immediate display on all scanners.
 */
export async function generateInvoiceQrDataUrl(
  invoice: Invoice,
  printerRole: PrinterRole = 'CASHIER',
  operatorName: string = 'Staff'
): Promise<string> {
  const qrPayload = getInvoiceQrText(invoice, printerRole, operatorName);

  return await QRCode.toDataURL(qrPayload, {
    width: 280,
    margin: 1,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'L', // 'L' keeps density optimal for easy scanning of text receipts
  });
}

/**
 * Download the purchase bill as a formatted PDF invoice using jsPDF.
 */
export async function downloadInvoicePdf(
  invoice: Invoice,
  store: {
    name: string;
    branch: string;
    address: string;
    phone: string;
    gstin: string;
  },
  printerRole: PrinterRole = 'CASHIER',
  operatorName: string = 'Staff'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // Header: Store Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(store.name.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(`${store.branch} • ${store.address}`, pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text(`Phone: ${store.phone}  |  GSTIN: ${store.gstin}`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Title Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text('RETAIL TAX INVOICE / PURCHASE BILL', pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Divider line
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Invoice & Customer Info Box
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Invoice No:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(17, 24, 39);
  doc.text(invoice.invoiceNumber, margin + 22, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Customer:', pageWidth / 2, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(17, 24, 39);
  doc.text(
    `${invoice.customerName} ${invoice.customerPhone ? '(' + invoice.customerPhone + ')' : ''}`,
    pageWidth / 2 + 18,
    y
  );
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Date & Time:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(17, 24, 39);
  doc.text(invoice.createdAt, margin + 22, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Payment Mode:', pageWidth / 2, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(invoice.paymentMode, pageWidth / 2 + 26, y);
  y += 6;

  // Divider line
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Table Header
  const colSr = margin;
  const colDesc = margin + 10;
  const colQty = margin + 105;
  const colPrice = margin + 125;
  const colTotal = pageWidth - margin;

  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text('SR', colSr + 2, y + 5);
  doc.text('DESCRIPTION OF GOODS', colDesc, y + 5);
  doc.text('QTY', colQty, y + 5, { align: 'center' });
  doc.text('RATE (Rs)', colPrice, y + 5, { align: 'right' });
  doc.text('TOTAL (Rs)', colTotal - 2, y + 5, { align: 'right' });
  y += 8;

  // Items
  doc.setFontSize(8.5);
  invoice.items.forEach((item, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(String(idx + 1), colSr + 2, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(item.articleName, colDesc, y + 4);

    // Sub-line for variant
    const variantDesc = [
      item.size ? `Size: ${item.size}` : '',
      item.color ? `Color: ${item.color}` : '',
      item.sku ? `SKU: ${item.sku}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    if (variantDesc) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text(variantDesc, colDesc, y + 8);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    const qtyDisplay = item.unitType === 'METER' ? `${item.quantity} M` : String(item.quantity);
    doc.text(qtyDisplay, colQty, y + 4, { align: 'center' });
    doc.text(item.unitPrice.toFixed(2), colPrice, y + 4, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(item.totalAmount.toFixed(2), colTotal - 2, y + 4, { align: 'right' });

    y += variantDesc ? 11 : 7;
    doc.setDrawColor(243, 244, 246);
    doc.line(margin, y, pageWidth - margin, y);
    y += 2;
  });

  y += 2;
  doc.setDrawColor(209, 213, 219);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Financial Summary Section (Right Side)
  const summaryXLabel = pageWidth - margin - 65;
  const summaryXVal = pageWidth - margin - 2;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Subtotal:', summaryXLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, summaryXVal, y, { align: 'right' });
  y += 4.5;

  if (invoice.billDiscount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 38, 38);
    doc.text('Bill Discount:', summaryXLabel, y);
    doc.text(`-Rs. ${invoice.billDiscount.toFixed(2)}`, summaryXVal, y, { align: 'right' });
    y += 4.5;
  }

  if (invoice.taxAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    if (invoice.isInterState) {
      doc.text('IGST:', summaryXLabel, y);
      doc.text(`Rs. ${(invoice.igstAmount || invoice.taxAmount).toFixed(2)}`, summaryXVal, y, { align: 'right' });
      y += 4.5;
    } else {
      const cgstVal = invoice.cgstAmount !== undefined ? invoice.cgstAmount : invoice.taxAmount / 2;
      const sgstVal = invoice.sgstAmount !== undefined ? invoice.sgstAmount : invoice.taxAmount / 2;
      doc.text('CGST:', summaryXLabel, y);
      doc.text(`Rs. ${cgstVal.toFixed(2)}`, summaryXVal, y, { align: 'right' });
      y += 4;
      doc.text('SGST:', summaryXLabel, y);
      doc.text(`Rs. ${sgstVal.toFixed(2)}`, summaryXVal, y, { align: 'right' });
      y += 4.5;
    }
  }

  if (invoice.creditNoteRedeemed && invoice.creditNoteRedeemed > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(5, 150, 105);
    doc.text('Store Credit Redeemed:', summaryXLabel, y);
    doc.text(`-Rs. ${invoice.creditNoteRedeemed.toFixed(2)}`, summaryXVal, y, { align: 'right' });
    y += 4.5;
  }

  // Grand Total Box
  doc.setFillColor(243, 244, 246);
  doc.rect(summaryXLabel - 2, y - 1, summaryXVal - summaryXLabel + 4, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(17, 24, 39);
  doc.text('NET GRAND TOTAL:', summaryXLabel, y + 5);
  doc.setTextColor(4, 120, 87);
  doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, summaryXVal, y + 5, { align: 'right' });
  y += 11;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Amount Paid:', summaryXLabel, y);
  doc.setTextColor(17, 24, 39);
  doc.text(`Rs. ${invoice.paidAmount.toFixed(2)}`, summaryXVal, y, { align: 'right' });
  y += 4.5;

  if (invoice.balanceAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('Khata Balance Due:', summaryXLabel, y);
    doc.text(`Rs. ${invoice.balanceAmount.toFixed(2)}`, summaryXVal, y, { align: 'right' });
    y += 5;
  }

  // QR Code & Print Authority Section
  // Placed at bottom left / center
  const qrDataUrl = await generateInvoiceQrDataUrl(invoice, printerRole, operatorName);
  const qrSize = 34;
  const qrX = margin + 10;
  const qrY = Math.max(y - 25, 200);

  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Labels BELOW the QR code
  const roleLabel = printerRole === 'MANAGER' ? 'Manager Print Bill' : 'Cashier Print Bill';
  const labelY = qrY + qrSize + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(`[ ${roleLabel.toUpperCase()} ]`, qrX + qrSize / 2, labelY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`Printed by: ${operatorName}`, qrX + qrSize / 2, labelY + 4, { align: 'center' });
  doc.text(`Role: ${printerRole}`, qrX + qrSize / 2, labelY + 7.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Scan QR to verify / download purchase bill', qrX + qrSize / 2, labelY + 11.5, { align: 'center' });

  // Store Signatory / Footer on the right
  const sigX = pageWidth - margin - 35;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`For ${store.name}`, sigX, labelY + 2, { align: 'center' });
  doc.text('Authorized Signatory', sigX, labelY + 11, { align: 'center' });

  // Bottom Notice
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, 280, pageWidth - margin, 280);
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    'Exchange allowed within 7 days with original tag and bill. Thank you for your visit!',
    pageWidth / 2,
    284,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
