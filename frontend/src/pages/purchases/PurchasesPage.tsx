import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Paperclip,
  CheckCircle2,
  DollarSign,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Supplier, SupplierLedgerEntry, SupplierBill } from '../../types';
import { api } from '../../services/api';

export const PurchasesPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState<number>(0);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState<SupplierLedgerEntry[]>([]);
  const [bills, setBills] = useState<SupplierBill[]>([]);
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'BILLS' | 'PO_GRN'>('LEDGER');

  const [transactionType, setTransactionType] = useState<'PURCHASE_CREDIT' | 'PAYMENT_MADE'>('PURCHASE_CREDIT');
  const [amount, setAmount] = useState<number>(0);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sList = await api.getSuppliers();
    const bList = await api.getSupplierBills();
    setSuppliers(sList);
    setBills(bList);
    if (sList.length > 0 && !selectedSupplier) {
      setSelectedSupplier(sList[0]);
      setSelectedSupplierIndex(0);
      const lEntries = await api.getSupplierLedger(sList[0].id);
      setLedgerEntries(lEntries);
    }
  };

  const handleSelectSupplier = async (supp: Supplier, idx?: number) => {
    setSelectedSupplier(supp);
    if (idx !== undefined) setSelectedSupplierIndex(idx);
    const lEntries = await api.getSupplierLedger(supp.id);
    setLedgerEntries(lEntries);
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.gstin?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.phone.includes(supplierSearch)
  );

  const handleSupplierKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSuppliers.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.min(filteredSuppliers.length - 1, selectedSupplierIndex + 1);
      setSelectedSupplierIndex(nextIdx);
      handleSelectSupplier(filteredSuppliers[nextIdx], nextIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = Math.max(0, selectedSupplierIndex - 1);
      setSelectedSupplierIndex(prevIdx);
      handleSelectSupplier(filteredSuppliers[prevIdx], prevIdx);
    }
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    if (amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.addSupplierTransaction(
        selectedSupplier.id,
        transactionType,
        amount,
        invoiceNo,
        paymentMode,
        referenceNo,
        remarks,
        attachmentUrl
      );

      setAmount(0);
      setInvoiceNo('');
      setReferenceNo('');
      setRemarks('');
      setAttachmentUrl('');

      const updatedList = await api.getSuppliers();
      const updatedLedger = await api.getSupplierLedger(selectedSupplier.id);
      const updatedBills = await api.getSupplierBills();
      setSuppliers(updatedList);
      setLedgerEntries(updatedLedger);
      setBills(updatedBills);
      const curr = updatedList.find((s) => s.id === selectedSupplier.id);
      if (curr) setSelectedSupplier(curr);
    } catch (err: any) {
      alert(err?.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Suppliers &amp; Document Khata
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Vendor purchase bills, physical invoice attachments &amp; double-entry ledgers
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-red-50 text-[#EF4444] border border-red-200 font-extrabold text-xs">
          Total Vendor Payables: ₹{suppliers.reduce((s, x) => s + x.outstandingPayable, 0).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Supplier Directory */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold uppercase text-gray-700">Supplier Directory</h3>
            <span className="text-[10px] text-gray-500 font-mono font-semibold">{filteredSuppliers.length} Vendors</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Vendor / GST (↑↓)..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              onKeyDown={handleSupplierKeyDown}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937] placeholder:text-gray-400 focus:bg-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredSuppliers.map((supp, idx) => {
              const isSelected = selectedSupplier?.id === supp.id;
              return (
                <div
                  key={supp.id}
                  onClick={() => handleSelectSupplier(supp, idx)}
                  className={`p-3 rounded-xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-100 shadow-xs'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-xs text-[#1F2937] truncate max-w-[150px]">{supp.name}</div>
                    <span className="text-[10px] font-mono text-[#EF4444] font-bold">
                      ₹{supp.outstandingPayable.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    GST: <span className="font-mono text-gray-700 font-semibold">{supp.gstin}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{supp.phone} • {supp.paymentTerms}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Selected Supplier Workspace */}
        {selectedSupplier ? (
          <div className="lg:col-span-3 space-y-5">
            {/* Overview Banner */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black border border-blue-100">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1F2937]">{selectedSupplier.name}</h3>
                  <div className="text-xs text-gray-500">
                    Contact: {selectedSupplier.contactPerson} • {selectedSupplier.phone} • Terms: {selectedSupplier.paymentTerms}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-right">
                <div className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider">Outstanding Payable Balance</div>
                <div className="text-2xl font-black font-mono text-[#EF4444]">
                  ₹{selectedSupplier.outstandingPayable.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs">
              <button
                onClick={() => setActiveTab('LEDGER')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  activeTab === 'LEDGER' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Statement Ledger
              </button>
              <button
                onClick={() => setActiveTab('BILLS')}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  activeTab === 'BILLS' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Supplier Bills &amp; Attachments ({bills.filter((b) => b.supplierId === selectedSupplier.id).length})
              </button>
            </div>

            {activeTab === 'LEDGER' && (
              <div className="space-y-5">
                {/* Record Supplier Transaction Form */}
                <form
                  onSubmit={handleRecordTransaction}
                  className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#1F2937] uppercase tracking-wide">
                      Record Supplier Transaction
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTransactionType('PURCHASE_CREDIT')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          transactionType === 'PURCHASE_CREDIT'
                            ? 'bg-[#EF4444] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        + Purchase Credit (Owe)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransactionType('PAYMENT_MADE')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          transactionType === 'PAYMENT_MADE'
                            ? 'bg-[#10B981] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        - Payment Made (Settle)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">Transaction Amount (₹) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 25000"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[#1F2937] font-bold text-sm focus:bg-white focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">Supplier Invoice / Bill No</label>
                      <input
                        type="text"
                        placeholder="e.g. MF-OCT-401"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-mono text-xs focus:bg-white focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">Payment Mode</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] text-xs font-semibold"
                      >
                        <option value="BANK_TRANSFER">Bank Wire / RTGS</option>
                        <option value="UPI">UPI / QR</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="CASH">Cash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">UTR / Cheque Ref No</label>
                      <input
                        type="text"
                        placeholder="Reference code"
                        value={referenceNo}
                        onChange={(e) => setReferenceNo(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">Remarks / Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Part payment against Autumn Batch"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">Attached Bill File / Photo URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. https://... or local file path"
                          value={attachmentUrl}
                          onChange={(e) => setAttachmentUrl(e.target.value)}
                          className="flex-1 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-mono"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                        >
                          {isSubmitting ? 'Recording...' : 'Submit Transaction'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Statement Ledger Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-[#1F2937] uppercase tracking-wider">
                      Supplier Statement Ledger ({ledgerEntries.length} Transactions)
                    </h4>
                    <span className="text-[11px] text-gray-500 font-mono">Running Balance Calculation</span>
                  </div>

                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3 font-sans">Type</th>
                        <th className="p-3">Invoice No</th>
                        <th className="p-3 text-right">Debit (₹)</th>
                        <th className="p-3 text-right">Credit (₹)</th>
                        <th className="p-3 text-right">Running Balance (₹)</th>
                        <th className="p-3 text-center font-sans">Mode</th>
                        <th className="p-3 font-sans">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition">
                          <td className="p-3 text-gray-500">{entry.createdAt}</td>
                          <td className="p-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                entry.transactionType === 'PURCHASE_CREDIT'
                                  ? 'bg-red-50 text-[#EF4444] border border-red-200'
                                  : 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                              }`}
                            >
                              {entry.transactionType === 'PURCHASE_CREDIT' ? 'Purchase Bill' : 'Payment Made'}
                            </span>
                          </td>
                          <td className="p-3 text-[#2563EB] font-bold">{entry.invoiceNo || '—'}</td>
                          <td className="p-3 text-right text-[#10B981] font-bold">
                            {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right text-[#EF4444] font-bold">
                            {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3 text-right text-[#1F2937] font-black">
                            ₹{entry.balance.toLocaleString()}
                          </td>
                          <td className="p-3 text-center text-gray-700 font-sans">
                            {entry.paymentMode || '—'}
                          </td>
                          <td className="p-3 text-gray-600 font-sans text-xs">
                            {entry.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'BILLS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bills
                  .filter((b) => b.supplierId === selectedSupplier.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-sm text-[#1F2937] font-mono">{b.supplierInvoiceNo}</div>
                          <div className="text-xs text-gray-500">Date: {b.purchaseDate} • Due: {b.dueDate}</div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 text-xs font-mono space-y-1">
                        <div className="flex justify-between text-gray-500">
                          <span>Total Bill Amount:</span>
                          <span className="text-[#1F2937] font-bold">₹{b.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Paid:</span>
                          <span className="text-[#10B981] font-bold">₹{b.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Outstanding:</span>
                          <span className="text-[#EF4444] font-black">₹{b.outstandingAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      {b.attachmentUrl && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-[#2563EB]">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span className="truncate font-semibold">Attached Physical Bill Document</span>
                          <a
                            href={b.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto font-bold hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center p-12 text-gray-400 font-medium">
            Select a supplier to view statement ledger and purchase history.
          </div>
        )}
      </div>
    </div>
  );
};
