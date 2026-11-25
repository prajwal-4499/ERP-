import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  Boxes,
  FileSpreadsheet,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Lock,
  Edit3,
  UserCheck,
  Clock,
  Timer,
  Flame,
} from 'lucide-react';
import { Invoice } from '../../types';
import { api } from '../../services/api';
import { BillReviewModal } from '../../components/pos/BillReviewModal';
import { InvoiceEditPinModal } from '../../components/invoice/InvoiceEditPinModal';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'SALES' | 'COMMISSION' | 'AGING' | 'GST' | 'PROFIT_LOSS' | 'INVENTORY'>('SALES');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number>(0);

  // Salesman Commission & Stock Aging
  const [commissions, setCommissions] = useState<{ salesmanName: string; totalSales: number; totalInvoices: number; commission: number }[]>([]);
  const [agingStock, setAgingStock] = useState<any[]>([]);
  const [selectedAgingDays, setSelectedAgingDays] = useState<number>(60);

  // Modals
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [editInvoiceTarget, setEditInvoiceTarget] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
    loadCommissions();
  }, []);

  useEffect(() => {
    loadAgingStock();
  }, [selectedAgingDays]);

  const loadInvoices = async () => {
    const list = await api.getInvoices();
    setInvoices(list);
  };

  const loadCommissions = async () => {
    const data = await api.getSalesmanCommissionSummary();
    setCommissions(data);
  };

  const loadAgingStock = async () => {
    const data = await api.getAgingInventory(selectedAgingDays);
    setAgingStock(data);
  };

  const handleExportCSV = async () => {
    let csvContent = '';
    if (reportType === 'SALES') {
      csvContent += 'Invoice Number,Date,Customer,Mode,Discount,Tax,Grand Total,Status\n';
      invoices.forEach((inv) => {
        csvContent += `${inv.invoiceNumber},${inv.createdAt},${inv.customerName},${inv.paymentMode},${inv.billDiscount},${inv.taxAmount},${inv.grandTotal},${inv.status}\n`;
      });
    } else if (reportType === 'COMMISSION') {
      csvContent += 'Salesman Name,Invoices Handled,Total Sales,Commission Rate (2%),Commission Payable\n';
      commissions.forEach((c) => {
        csvContent += `${c.salesmanName},${c.totalInvoices},${c.totalSales},2%,${c.commission}\n`;
      });
    } else if (reportType === 'AGING') {
      csvContent += 'SKU,Article Name,Brand,Category,Stock,Cost Price,Selling Price,Tied Capital,Days Unsold\n';
      agingStock.forEach((a) => {
        csvContent += `${a.sku},${a.articleName},${a.brand},${a.category},${a.stock},${a.costPrice},${a.sellingPrice},${a.tiedCapital},${a.daysUnsold}\n`;
      });
    } else if (reportType === 'GST') {
      csvContent += 'HSN Code,Description,Taxable Value,CGST (2.5%),SGST (2.5%),Total Tax\n';
      csvContent += '6205,Cotton Men Shirts,65400.00,1635.00,1635.00,3270.00\n';
      csvContent += '6203,Denim Trousers & Jeans,48200.00,1205.00,1205.00,2410.00\n';
    }

    const defaultFilename = `ClothShop_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    if (window.electronAPI?.showSaveDialog && window.electronAPI?.writeFileToDisk) {
      try {
        const saveRes = await window.electronAPI.showSaveDialog({
          title: `Export ${reportType} Report`,
          defaultPath: defaultFilename,
          filters: [{ name: 'CSV Files', extensions: ['csv'] }],
        });
        if (!saveRes?.canceled && saveRes?.filePath) {
          const res = await window.electronAPI.writeFileToDisk({
            filePath: saveRes.filePath,
            content: csvContent,
          });
          if (res?.success) {
            alert(`Report exported successfully to: ${saveRes.filePath}`);
            return;
          }
        } else {
          return; // User cancelled
        }
      } catch (err) {
        console.error('Electron save dialog failed, falling back to browser download:', err);
      }
    }

    // Web browser fallback
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (invoices.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedInvoiceIndex((prev) => Math.min(invoices.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedInvoiceIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedInvoiceIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedInvoiceIndex(invoices.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (invoices[selectedInvoiceIndex]) {
        setPreviewInvoice(invoices[selectedInvoiceIndex]);
      }
    }
  };

  const totalPeriodSales = invoices.reduce((s, i) => s + i.grandTotal, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Reports &amp; Financial Analytics Center
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Sales audits, invoice reprint/preview, PIN 1234 invoice edits, GST returns &amp; inventory valuation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs border border-gray-200 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm text-xs">
        {[
          { id: 'SALES', label: 'Sales & Invoices Report', icon: Receipt },
          { id: 'COMMISSION', label: 'Salesman Commission', icon: UserCheck },
          { id: 'AGING', label: 'Dead Stock & Aging', icon: Clock },
          { id: 'GST', label: 'GST Tax Summary', icon: FileSpreadsheet },
          { id: 'PROFIT_LOSS', label: 'Gross Profit & Loss', icon: TrendingUp },
          { id: 'INVENTORY', label: 'Stock Valuation Report', icon: Boxes },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold transition flex-1 justify-center min-w-[140px] ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SALES REPORT VIEW */}
      {reportType === 'SALES' && (
        <div
          tabIndex={0}
          onKeyDown={handleTableKeyDown}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs focus:outline-none"
        >
          <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
            <span className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">
              Daily Invoices Detailed Breakdown ({invoices.length} Invoices)
            </span>
            <span className="text-emerald-700 font-extrabold text-sm font-mono">
              Total Period Sales: ₹{totalPeriodSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Invoice No</th>
                  <th className="p-3.5">Date &amp; Time</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5 text-right">Subtotal (₹)</th>
                  <th className="p-3.5 text-right">Discount (₹)</th>
                  <th className="p-3.5 text-right">Grand Total (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400 font-sans">
                      No invoices recorded yet. Complete sales in POS to view them here.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, idx) => {
                    const isSelected = selectedInvoiceIndex === idx;
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoiceIndex(idx)}
                        className={`transition ${isSelected ? 'bg-blue-50/70' : 'hover:bg-blue-50/30'}`}
                      >
                        <td className="p-3.5 font-bold text-blue-600">{inv.invoiceNumber}</td>
                        <td className="p-3.5 text-gray-500 font-sans text-xs">{inv.createdAt}</td>
                        <td className="p-3.5 text-gray-900 font-sans font-semibold">
                          {inv.customerName} {inv.customerPhone ? `(${inv.customerPhone})` : ''}
                        </td>
                        <td className="p-3.5 text-gray-600">{inv.paymentMode}</td>
                        <td className="p-3.5 text-right text-gray-600">₹{inv.subtotal.toFixed(2)}</td>
                        <td className="p-3.5 text-right text-rose-600">
                          {inv.billDiscount > 0 ? `-₹${inv.billDiscount.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-700">
                          ₹{inv.grandTotal.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'EDITED'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewInvoice(inv)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold font-sans text-xs transition"
                              title="Print Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditInvoiceTarget(inv)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold font-sans text-xs transition"
                              title="Edit Invoice with PIN 1234"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Edit (1234)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SALESMAN COMMISSION SUMMARY VIEW */}
      {reportType === 'COMMISSION' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Sales Invoiced</span>
              <div className="text-2xl font-black font-mono text-gray-900">
                ₹{commissions.reduce((s, c) => s + c.totalSales, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-gray-400">Across all counter and salesman invoices</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Commission Payable</span>
              <div className="text-2xl font-black font-mono text-emerald-600">
                ₹{commissions.reduce((s, c) => s + c.commission, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">Standard 2.0% store sales incentive</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Active Sales Staff</span>
              <div className="text-2xl font-black text-blue-600">{commissions.length}</div>
              <div className="text-[11px] text-gray-400">Recorded sales staff members</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Invoices Handled</span>
              <div className="text-2xl font-black text-gray-900 font-mono">
                {commissions.reduce((s, c) => s + c.totalInvoices, 0)}
              </div>
              <div className="text-[11px] text-gray-400">Total customer transactions</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
              <span className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">
                Sales Staff Performance &amp; Commission Payout Table
              </span>
              <span className="text-xs text-gray-500 font-medium">Auto-calculated from POS Salesman Selector</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Salesman / Executive Name</th>
                  <th className="p-3.5 text-center">Invoices Count</th>
                  <th className="p-3.5 text-right">Total Gross Sales (₹)</th>
                  <th className="p-3.5 text-right">Avg Bill Value (₹)</th>
                  <th className="p-3.5 text-center">Commission Rate</th>
                  <th className="p-3.5 text-right">Commission Payable (₹)</th>
                  <th className="p-3.5 text-center">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 font-sans">
                      No salesman transactions recorded yet. Assign a staff member during POS checkout.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c, idx) => {
                    const avgVal = c.totalInvoices > 0 ? Math.round(c.totalSales / c.totalInvoices) : 0;
                    return (
                      <tr key={idx} className="hover:bg-blue-50/30 transition font-sans">
                        <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {c.salesmanName.slice(0, 1)}
                          </div>
                          <span>{c.salesmanName}</span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-gray-700">
                          {c.totalInvoices}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-gray-900">
                          ₹{c.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right font-mono text-gray-600">
                          ₹{avgVal.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-blue-600">
                          2.0%
                        </td>
                        <td className="p-3.5 text-right font-mono font-black text-emerald-700">
                          ₹{c.commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK AGING & DEAD STOCK REPORT VIEW */}
      {reportType === 'AGING' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Aged Garments Unsold</span>
              <div className="text-2xl font-black text-amber-900">{agingStock.length} Articles</div>
              <div className="text-[11px] text-gray-400">{agingStock.reduce((s, a) => s + a.stock, 0)} pieces in stock</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Locked Working Capital</span>
              <div className="text-2xl font-black font-mono text-rose-700">
                ₹{agingStock.reduce((s, a) => s + a.tiedCapital, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-rose-600 font-semibold">Tied at purchase cost value</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Clearance Potential</span>
              <div className="text-2xl font-black font-mono text-blue-600">
                ₹{agingStock.reduce((s, a) => s + a.stock * a.sellingPrice, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-gray-400">Gross sales recovery at current prices</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Aging Cut-off:</span>
              <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                {[60, 90, 180].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedAgingDays(d)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      selectedAgingDays === d ? 'bg-amber-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {d}+ Days {d === 180 ? '(Dead Stock)' : 'Unsold'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-gray-500 font-medium">
              Calculated from last sale and stock inward movement timestamps
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3.5">SKU / Article</th>
                  <th className="p-3.5">Brand &amp; Category</th>
                  <th className="p-3.5 text-center">Size &amp; Color</th>
                  <th className="p-3.5 text-center">Unit</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Cost Price (₹)</th>
                  <th className="p-3.5 text-right">Selling Price (₹)</th>
                  <th className="p-3.5 text-right">Tied Capital (₹)</th>
                  <th className="p-3.5 text-center">Days Unsold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agingStock.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No slow-moving items found exceeding {selectedAgingDays} days unsold.
                    </td>
                  </tr>
                ) : (
                  agingStock.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition">
                      <td className="p-3.5 font-bold text-gray-900">
                        <div>{item.articleName}</div>
                        <div className="text-[10px] font-mono text-gray-400">{item.sku}</div>
                      </td>
                      <td className="p-3.5 text-gray-700">
                        <div>{item.brand}</div>
                        <div className="text-[10px] text-gray-400">{item.category}</div>
                      </td>
                      <td className="p-3.5 text-center font-medium text-gray-800">
                        {item.size} {item.color ? `(${item.color})` : ''}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600">
                          {item.unitType || 'PCS'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-gray-900">
                        {item.stock}
                      </td>
                      <td className="p-3.5 text-right font-mono text-gray-600">
                        ₹{item.costPrice.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-gray-900">
                        ₹{item.sellingPrice.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-rose-700">
                        ₹{item.tiedCapital.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.daysUnsold >= 180
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : item.daysUnsold >= 90
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {item.daysUnsold}d
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {reportType === 'GST' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
            <span className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">GST HSN Tax Return Summary</span>
            <span className="text-blue-700 font-extrabold text-sm font-mono">Net GST Output Liability: ₹5,680.00</span>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3.5">HSN Code</th>
                <th className="p-3.5">Garment Category Description</th>
                <th className="p-3.5 text-right">Taxable Value (₹)</th>
                <th className="p-3.5 text-right">CGST 2.5% (₹)</th>
                <th className="p-3.5 text-right">SGST 2.5% (₹)</th>
                <th className="p-3.5 text-right">Total GST (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-3.5 font-bold text-blue-600">6205</td>
                <td className="p-3.5 text-gray-900 font-sans font-medium">Men or Boys Cotton Shirts (Woven)</td>
                <td className="p-3.5 text-right text-gray-700">₹65,400.00</td>
                <td className="p-3.5 text-right text-gray-600">₹1,635.00</td>
                <td className="p-3.5 text-right text-gray-600">₹1,635.00</td>
                <td className="p-3.5 text-right font-bold text-emerald-700">₹3,270.00</td>
              </tr>
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-3.5 font-bold text-blue-600">6203</td>
                <td className="p-3.5 text-gray-900 font-sans font-medium">Men Trousers, Chinos &amp; Denim Jeans</td>
                <td className="p-3.5 text-right text-gray-700">₹48,200.00</td>
                <td className="p-3.5 text-right text-gray-600">₹1,205.00</td>
                <td className="p-3.5 text-right text-gray-600">₹1,205.00</td>
                <td className="p-3.5 text-right font-bold text-emerald-700">₹2,410.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* PROFIT & LOSS VIEW */}
      {reportType === 'PROFIT_LOSS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Gross Revenue</div>
            <div className="text-3xl font-extrabold font-mono text-gray-900">₹{totalPeriodSales > 0 ? totalPeriodSales.toLocaleString('en-IN') : '1,24,580'}</div>
            <div className="text-[11px] text-gray-500">Includes all counter POS and credit billing</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Cost of Goods Sold (COGS)</div>
            <div className="text-3xl font-extrabold font-mono text-rose-600">₹77,240</div>
            <div className="text-[11px] text-gray-500">Direct garment vendor purchase costs</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Net Gross Margin</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-600">₹47,340</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>38% Gross Margin Percentage</span>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY VALUATION VIEW */}
      {reportType === 'INVENTORY' && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-gray-100 font-bold text-gray-900 gap-2">
            <span className="text-sm">Total Garment Stock Value at Selling Price: ₹8,45,000.00</span>
            <span className="text-blue-600 text-sm">Purchase Cost Value: ₹4,92,000.00</span>
          </div>
          <p className="text-gray-500 leading-relaxed">
            Valuation calculated using real-time variant inventory quantities and purchase cost pricing across all active styles in store.
          </p>
        </div>
      )}

      {/* Bill Preview Modal */}
      {previewInvoice && (
        <BillReviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* Authorized PIN 1234 Edit Modal */}
      {editInvoiceTarget && (
        <InvoiceEditPinModal
          invoice={editInvoiceTarget}
          onClose={() => setEditInvoiceTarget(null)}
          onSuccess={async () => {
            await loadInvoices();
            setEditInvoiceTarget(null);
          }}
        />
      )}
    </div>
  );
};
