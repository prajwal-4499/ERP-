import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Phone,
  Search,
  Calendar,
  Clock,
  Eye,
  ArrowUpDown,
  FileText,
  CreditCard,
  Banknote,
  Layers,
  Download,
  QrCode,
  CheckCircle2,
  Receipt,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';
import { Customer, CustomerLedgerEntry, Invoice } from '../../types';
import { api } from '../../services/api';
import { BillReviewModal } from '../../components/pos/BillReviewModal';
import { useAuthStore } from '../../stores/authStore';
import { downloadInvoicePdf, generateInvoiceQrDataUrl, PrinterRole } from '../../utils/billGenerator';
import {
  getEnglishWhatsAppMessage,
  getMarathiWhatsAppMessage,
  shareBillOnWhatsApp,
} from '../../utils/whatsappShare';

export const CustomersPage: React.FC = () => {
  const { activeStore, user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number>(0);
  const [ledger, setLedger] = useState<CustomerLedgerEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 3-Option Filter for Customer Purchases (Primary Default is 'CREDIT')
  const [billFilter, setBillFilter] = useState<'CREDIT' | 'CASH' | 'BOTH'>('CREDIT');
  const [activeProfileTab, setActiveProfileTab] = useState<'PURCHASES' | 'LEDGER'>('PURCHASES');

  // Quick QR code modal state
  const [qrModalInvoice, setQrModalInvoice] = useState<Invoice | null>(null);
  const [qrModalUrl, setQrModalUrl] = useState<string>('');

  // Transaction form state (matching supplier ledger + payment given)
  const [transactionType, setTransactionType] = useState<'PAYMENT_RECEIVED' | 'PAYMENT_GIVEN' | 'SALE'>('PAYMENT_RECEIVED');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [refNo, setRefNo] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [transactionDateTime, setTransactionDateTime] = useState<string>(
    new Date().toISOString().replace('T', ' ').slice(0, 19)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Preview invoice modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const customerListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const list = await api.getCustomers();
    setCustomers(list);
    if (list.length > 0 && !selectedCustomer) {
      handleSelectCustomer(list[0], 0);
    }
  };

  const handleSelectCustomer = async (cust: Customer, index?: number) => {
    setSelectedCustomer(cust);
    if (index !== undefined) setSelectedCustomerIndex(index);
    const [l, invs] = await Promise.all([
      api.getCustomerLedger(cust.id),
      api.getCustomerInvoices(cust.id),
    ]);
    setLedger(l);
    setInvoices(invs);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  // Keyboard navigation on customer search and list
  const handleCustomerListKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCustomers.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.min(filteredCustomers.length - 1, selectedCustomerIndex + 1);
      setSelectedCustomerIndex(nextIdx);
      handleSelectCustomer(filteredCustomers[nextIdx], nextIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = Math.max(0, selectedCustomerIndex - 1);
      setSelectedCustomerIndex(prevIdx);
      handleSelectCustomer(filteredCustomers[prevIdx], prevIdx);
    }
  };

  // Filter bills based on 3 options: CREDIT (primary default), CASH, BOTH
  const filteredInvoices = invoices.filter((inv) => {
    if (billFilter === 'CREDIT') {
      return inv.paymentMode === 'CREDIT' || inv.balanceAmount > 0;
    }
    if (billFilter === 'CASH') {
      return (
        inv.paymentMode === 'CASH' ||
        (inv.paymentMode !== 'CREDIT' && inv.balanceAmount === 0)
      );
    }
    // 'BOTH' includes all cash and credit purchases
    return true;
  });

  const creditBillsCount = invoices.filter(
    (i) => i.paymentMode === 'CREDIT' || i.balanceAmount > 0
  ).length;
  const cashBillsCount = invoices.filter(
    (i) => i.paymentMode === 'CASH' || (i.paymentMode !== 'CREDIT' && i.balanceAmount === 0)
  ).length;
  const totalPurchasesAmount = invoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalCreditPurchasesAmount = invoices
    .filter((i) => i.paymentMode === 'CREDIT' || i.balanceAmount > 0)
    .reduce((s, i) => s + i.grandTotal, 0);
  const totalCashPurchasesAmount = invoices
    .filter((i) => i.paymentMode === 'CASH' || (i.paymentMode !== 'CREDIT' && i.balanceAmount === 0))
    .reduce((s, i) => s + i.grandTotal, 0);

  const handleDownloadPdf = async (inv: Invoice) => {
    const role: PrinterRole =
      user?.role === 'MANAGER' || user?.role === 'OWNER' ? 'MANAGER' : 'CASHIER';
    const operatorName = user?.fullName || 'Vijay Kumar';
    await downloadInvoicePdf(inv, activeStore, role, operatorName);
  };

  const handleShowQrModal = async (inv: Invoice) => {
    const role: PrinterRole =
      user?.role === 'MANAGER' || user?.role === 'OWNER' ? 'MANAGER' : 'CASHIER';
    const operatorName = user?.fullName || 'Vijay Kumar';
    const url = await generateInvoiceQrDataUrl(inv, role, operatorName);
    setQrModalUrl(url);
    setQrModalInvoice(inv);
  };

  const handleSendWhatsAppEnglish = (inv: Invoice) => {
    const role: PrinterRole =
      user?.role === 'MANAGER' || user?.role === 'OWNER' ? 'MANAGER' : 'CASHIER';
    const operatorName = user?.fullName || 'Vijay Kumar';
    const msg = getEnglishWhatsAppMessage(inv, activeStore, role, operatorName);
    shareBillOnWhatsApp(inv.customerPhone, msg);
  };

  const handleSendWhatsAppMarathi = (inv: Invoice) => {
    const role: PrinterRole =
      user?.role === 'MANAGER' || user?.role === 'OWNER' ? 'MANAGER' : 'CASHIER';
    const operatorName = user?.fullName || 'Vijay Kumar';
    const msg = getMarathiWhatsAppMessage(inv, activeStore, role, operatorName);
    shareBillOnWhatsApp(inv.customerPhone, msg);
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (paymentAmount <= 0) {
      alert('Please enter a valid transaction amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.addCustomerTransaction(
        selectedCustomer.id,
        transactionType,
        paymentAmount,
        paymentMode,
        refNo,
        remarks ||
          (transactionType === 'PAYMENT_GIVEN'
            ? 'Payment given / refund / advance to customer'
            : 'Khata settlement payment'),
        transactionDateTime,
        invoiceNo
      );

      setPaymentAmount(0);
      setInvoiceNo('');
      setRefNo('');
      setRemarks('');
      setTransactionDateTime(new Date().toISOString().replace('T', ' ').slice(0, 19));

      const updatedList = await api.getCustomers();
      const updatedLedger = await api.getCustomerLedger(selectedCustomer.id);
      const updatedInvs = await api.getCustomerInvoices(selectedCustomer.id);
      setCustomers(updatedList);
      setLedger(updatedLedger);
      setInvoices(updatedInvs);
      const curr = updatedList.find((c) => c.id === selectedCustomer.id);
      if (curr) setSelectedCustomer(curr);
    } catch (err: any) {
      alert(err?.message || 'Error recording transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewBill = async (invNumber?: string) => {
    if (!invNumber) return;
    const invs = await api.getInvoices();
    const found = invs.find((i) => i.invoiceNumber === invNumber);
    if (found) {
      setPreviewInvoice(found);
    } else {
      // Create mock view
      setPreviewInvoice({
        id: Date.now(),
        invoiceNumber: invNumber,
        invoiceType: 'TAX',
        customerName: selectedCustomer?.name || 'Customer',
        customerPhone: selectedCustomer?.phone,
        cashierName: 'Vijay Kumar',
        branchName: activeStore.branch || 'Pargaon (Mangrul)',
        status: 'COMPLETED',
        subtotal: 3500,
        itemDiscountTotal: 0,
        billDiscount: 0,
        discountType: 'FLAT',
        taxAmount: 175,
        grandTotal: 3675,
        paidAmount: 3675,
        balanceAmount: 0,
        paymentMode: 'CREDIT',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        items: [
          {
            id: 1,
            articleName: 'Cotton Formal Shirt',
            sku: 'CS-40-WHT',
            barcode: '8901234567890',
            color: 'White',
            size: '40',
            quantity: 1,
            unitPrice: 1500,
            discount: 0,
            totalAmount: 1500,
          },
        ],
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1F2937] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Customer Profiles &amp; Purchases</span>
          </h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            Track customer purchase bills (Credit by default, Cash, or Both), download bills with unique QR, and manage Khata settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-xs shadow-2xs">
            Total Khata Due: ₹{customers.reduce((s, c) => s + c.outstandingBalance, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Customer Directory (Arrow key accessible) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Customers Directory</h3>
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-blue-500" />
              <span>Use ↑ ↓ keys</span>
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Name / Mobile (↑↓)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleCustomerListKeyDown}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1F2937] placeholder:text-gray-400 focus:bg-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div ref={customerListRef} className="space-y-2 max-h-[560px] overflow-y-auto">
            {filteredCustomers.map((cust, idx) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust, idx)}
                  className={`p-3 rounded-xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-100 shadow-xs'
                      : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-xs text-[#1F2937]">{cust.name}</div>
                    <span className="text-[10px] font-mono text-amber-600 font-bold">
                      ₹{cust.outstandingBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="text-[10px] text-[#2563EB] font-medium mt-1 flex justify-between">
                    <span>{cust.customerGroup}</span>
                    <span>★ {cust.loyaltyPoints} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Selected Customer Profile Workspace */}
        {selectedCustomer ? (
          <div className="lg:col-span-3 space-y-5">
            {/* Customer Header Card */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-50 text-amber-700 flex items-center justify-center font-extrabold text-lg border border-amber-200 shadow-2xs">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#1F2937]">{selectedCustomer.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedCustomer.customerGroup}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Phone: <span className="font-mono text-gray-700 font-semibold">{selectedCustomer.phone}</span> • {selectedCustomer.address || 'Address on file'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-right min-w-[100px]">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Credit Limit</div>
                  <div className="text-sm font-bold font-mono text-[#10B981]">
                    ₹{selectedCustomer.creditLimit.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-right min-w-[110px]">
                  <div className="text-[10px] text-amber-800 font-semibold uppercase">Khata Outstanding</div>
                  <div className="text-base font-extrabold font-mono text-amber-700">
                    ₹{selectedCustomer.outstandingBalance.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Workspace Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveProfileTab('PURCHASES')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeProfileTab === 'PURCHASES'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Purchases &amp; Bills ({invoices.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveProfileTab('LEDGER')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeProfileTab === 'LEDGER'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Khata Ledger &amp; Payments ({ledger.length})</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 font-medium hidden sm:block">
                Loyalty: <span className="font-bold text-amber-600">★ {selectedCustomer.loyaltyPoints} points</span>
              </div>
            </div>

            {/* TAB 1: PURCHASES & BILLS TRACKING (With 3-Option Filter) */}
            {activeProfileTab === 'PURCHASES' && (
              <div className="space-y-4">
                {/* 3-Option Filter Toolbar (Credit Bills [Default] | Cash Bills | Both) */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide block">
                      Filter Customer Purchases
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Default shows Credit Bills. Select Cash or Both to view all customer purchases.
                    </span>
                  </div>

                  {/* 3 Options Segmented Control */}
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 self-start sm:self-auto">
                    {/* Option 1 (Primary / Default): Credit Bills */}
                    <button
                      type="button"
                      onClick={() => setBillFilter('CREDIT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                        billFilter === 'CREDIT'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-gray-700 hover:text-black hover:bg-gray-200'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Credit Bills</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        billFilter === 'CREDIT' ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {creditBillsCount}
                      </span>
                    </button>

                    {/* Option 2: Cash Bills */}
                    <button
                      type="button"
                      onClick={() => setBillFilter('CASH')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                        billFilter === 'CASH'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-700 hover:text-black hover:bg-gray-200'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Cash Bills</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        billFilter === 'CASH' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {cashBillsCount}
                      </span>
                    </button>

                    {/* Option 3: Both (Cash & Credit) */}
                    <button
                      type="button"
                      onClick={() => setBillFilter('BOTH')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                        billFilter === 'BOTH'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-700 hover:text-black hover:bg-gray-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Both (Cash &amp; Credit)</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        billFilter === 'BOTH' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {invoices.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Filter Summary Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                      Total Credit Purchases
                    </div>
                    <div className="text-lg font-black font-mono text-amber-700 mt-0.5">
                      ₹{totalCreditPurchasesAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">
                      {creditBillsCount} Credit Bills Generated
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                      Total Cash Purchases
                    </div>
                    <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">
                      ₹{totalCashPurchasesAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      {cashBillsCount} Cash Bills Generated
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                      Lifetime Purchases Value
                    </div>
                    <div className="text-lg font-black font-mono text-blue-700 mt-0.5">
                      ₹{totalPurchasesAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-blue-700 mt-0.5">
                      {invoices.length} Total Purchases Across All Modes
                    </div>
                  </div>
                </div>

                {/* Customer Purchases Bills Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-xs text-[#1F2937] uppercase tracking-wider">
                        {billFilter === 'CREDIT'
                          ? `Credit Purchase Bills (${filteredInvoices.length})`
                          : billFilter === 'CASH'
                          ? `Cash Purchase Bills (${filteredInvoices.length})`
                          : `All Customer Bills - Cash & Credit (${filteredInvoices.length})`}
                      </h4>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      Each bill includes unique QR with Manager/Cashier print verification
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-semibold border-b border-gray-200">
                        <tr>
                          <th className="p-3">Bill / Invoice</th>
                          <th className="p-3">Date &amp; Time</th>
                          <th className="p-3">Items Purchased</th>
                          <th className="p-3 text-right">Bill Total (₹)</th>
                          <th className="p-3 text-center">Payment Mode</th>
                          <th className="p-3 text-right">Paid (₹)</th>
                          <th className="p-3 text-right">Khata Due (₹)</th>
                          <th className="p-3 text-center">Cashier / Manager</th>
                          <th className="p-3 text-center">Bill Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-gray-400">
                              No {billFilter.toLowerCase()} bills found for {selectedCustomer.name}.
                            </td>
                          </tr>
                        ) : (
                          filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50 transition">
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => setPreviewInvoice(inv)}
                                  className="font-bold text-blue-600 hover:text-blue-800 font-mono hover:underline text-left block"
                                >
                                  {inv.invoiceNumber}
                                </button>
                                <span className="text-[10px] text-gray-400">{inv.invoiceType}</span>
                              </td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{inv.createdAt}</td>
                              <td className="p-3 max-w-[200px]">
                                <div className="font-semibold text-gray-900 truncate">
                                  {inv.items.map((i) => i.articleName).join(', ') || 'Retail items'}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {inv.items.length} items • Qty: {inv.items.reduce((s, i) => s + i.quantity, 0)}
                                </div>
                              </td>
                              <td className="p-3 text-right font-extrabold text-gray-900 font-mono">
                                ₹{inv.grandTotal.toLocaleString()}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    inv.paymentMode === 'CREDIT'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : inv.paymentMode === 'CASH'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                                  }`}
                                >
                                  {inv.paymentMode}
                                </span>
                              </td>
                              <td className="p-3 text-right text-gray-700 font-mono">
                                ₹{inv.paidAmount.toLocaleString()}
                              </td>
                              <td className="p-3 text-right font-mono">
                                {inv.balanceAmount > 0 ? (
                                  <span className="text-rose-600 font-bold">
                                    ₹{inv.balanceAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">₹0</span>
                                )}
                              </td>
                              <td className="p-3 text-center text-gray-600 text-[11px]">
                                {inv.cashierName || 'Staff'}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* View / Print Bill Modal */}
                                  <button
                                    type="button"
                                    onClick={() => setPreviewInvoice(inv)}
                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition shadow-2xs"
                                    title="View & Print Bill (A4 / Thermal)"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Quick Download PDF */}
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadPdf(inv)}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                                    title="Download Purchase Bill (PDF with QR)"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>

                                  {/* View QR Code Modal */}
                                  <button
                                    type="button"
                                    onClick={() => handleShowQrModal(inv)}
                                    className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition shadow-2xs"
                                    title="View Unique Bill QR Code"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                  </button>

                                  {/* WhatsApp English */}
                                  <button
                                    type="button"
                                    onClick={() => handleSendWhatsAppEnglish(inv)}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                                    title="Send bill on WhatsApp (English)"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>

                                  {/* WhatsApp Marathi */}
                                  <button
                                    type="button"
                                    onClick={() => handleSendWhatsAppMarathi(inv)}
                                    className="px-1.5 py-1 rounded-lg bg-[#25D366]/15 text-[#047857] hover:bg-[#25D366]/25 transition shadow-2xs font-bold text-[10px]"
                                    title="व्हॉट्सॲपवर मराठीत बिल पाठवा"
                                  >
                                    मराठी
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KHATA LEDGER & TRANSACTION RECORDING */}
            {activeProfileTab === 'LEDGER' && (
              <div className="space-y-5">
                {/* Record Transaction Form */}
                <form
                  onSubmit={handleRecordTransaction}
                  className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-[#1F2937] uppercase tracking-wide">
                      Record Customer Ledger Transaction
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTransactionType('PAYMENT_RECEIVED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          transactionType === 'PAYMENT_RECEIVED'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        - Payment Received (From Cust)
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransactionType('PAYMENT_GIVEN')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          transactionType === 'PAYMENT_GIVEN'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        + Payment Given / Refund (To Cust)
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransactionType('SALE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          transactionType === 'SALE'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        + Credit Sale (Owe)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Transaction Amount (₹) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 2000"
                        value={paymentAmount || ''}
                        onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-mono text-gray-900 font-bold text-sm focus:bg-white focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Date &amp; Time *</label>
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD HH:mm:ss"
                        value={transactionDateTime}
                        onChange={(e) => setTransactionDateTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-xs font-mono focus:bg-white focus:border-[#2563EB] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Payment Mode</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] text-xs font-semibold"
                      >
                        <option value="UPI">UPI / PhonePe / GPay</option>
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card EDC</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="BANK_TRANSFER">Bank Wire</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Voucher / Bill No (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. INV-2026-1050"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">UTR / Cheque / Ref ID</label>
                      <input
                        type="text"
                        placeholder="Reference Code"
                        value={refNo}
                        onChange={(e) => setRefNo(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937] font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1 font-medium">Remarks / Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Part payment or advance return"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#1F2937]"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition disabled:opacity-50 ${
                          transactionType === 'PAYMENT_RECEIVED'
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                            : transactionType === 'PAYMENT_GIVEN'
                            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                      >
                        {isSubmitting
                          ? 'Recording...'
                          : transactionType === 'PAYMENT_RECEIVED'
                          ? 'Accept Payment Received'
                          : transactionType === 'PAYMENT_GIVEN'
                          ? 'Record Payment Given'
                          : 'Record Credit Sale'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Customer Statement Ledger Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#1F2937] uppercase tracking-wider">
                      Customer Khata Statement ({ledger.length} Entries)
                    </h4>
                    <span className="text-[11px] text-gray-500">Date &amp; Time Logged Transactions</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-semibold border-b border-gray-200">
                        <tr>
                          <th className="p-3">Date &amp; Time</th>
                          <th className="p-3">Voucher / Invoice</th>
                          <th className="p-3">Type</th>
                          <th className="p-3 text-right">Debit / Given (₹)</th>
                          <th className="p-3 text-right">Credit / Recv (₹)</th>
                          <th className="p-3 text-right">Khata Balance (₹)</th>
                          <th className="p-3 text-center">Mode</th>
                          <th className="p-3">Remarks</th>
                          <th className="p-3 text-center w-16">Bill</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {ledger.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 transition">
                            <td className="p-3 text-gray-600 font-normal whitespace-nowrap">{entry.createdAt}</td>
                            <td className="p-3 text-[#2563EB] font-semibold">{entry.invoiceNo || '—'}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  entry.transactionType === 'SALE'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : entry.transactionType === 'PAYMENT_GIVEN' || (entry as any).transactionType === 'REFUND'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {entry.transactionType === 'PAYMENT_GIVEN'
                                  ? 'Payment Given'
                                  : entry.transactionType === 'PAYMENT_RECEIVED' || entry.transactionType === 'PAYMENT'
                                  ? 'Payment Received'
                                  : entry.transactionType}
                              </span>
                            </td>
                            <td className="p-3 text-right text-rose-600 font-semibold">
                              {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '—'}
                            </td>
                            <td className="p-3 text-right text-emerald-600 font-semibold">
                              {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '—'}
                            </td>
                            <td className="p-3 text-right text-gray-900 font-bold">
                              ₹{entry.balance.toLocaleString()}
                            </td>
                            <td className="p-3 text-center text-gray-700">
                              {entry.paymentMode || '—'}
                            </td>
                            <td className="p-3 text-gray-600 text-xs">
                              {entry.remarks}
                            </td>
                            <td className="p-3 text-center">
                              {entry.invoiceNo ? (
                                <button
                                  type="button"
                                  onClick={() => handlePreviewBill(entry.invoiceNo)}
                                  className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                  title="Print Preview Bill"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center p-12 text-gray-400 font-normal">
            Select a customer from the directory to view profile and bills.
          </div>
        )}
      </div>

      {/* Bill Review / Print Preview Modal */}
      {previewInvoice && (
        <BillReviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* Quick QR Code Modal */}
      {qrModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Unique Bill QR Code</span>
              </span>
              <button
                type="button"
                onClick={() => setQrModalInvoice(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              {qrModalUrl && (
                <img src={qrModalUrl} alt="Bill QR" className="w-44 h-44 mx-auto rounded-lg shadow-2xs" />
              )}
              <div className="mt-3">
                <div className="font-extrabold text-sm text-gray-900 font-mono">
                  {qrModalInvoice.invoiceNumber}
                </div>
                <div className="text-xs text-gray-500">
                  Customer: <strong>{qrModalInvoice.customerName}</strong>
                </div>
                <div className="text-sm font-bold text-emerald-700 mt-1">
                  Amount: ₹{qrModalInvoice.grandTotal.toLocaleString()}
                </div>
                <div className="mt-2 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-lg font-bold">
                  Manager &amp; Cashier Print Verified
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf(qrModalInvoice)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Bill PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewInvoice(qrModalInvoice);
                  setQrModalInvoice(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
              >
                Print Preview
              </button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleSendWhatsAppEnglish(qrModalInvoice)}
                className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                title="Send bill summary via WhatsApp in English"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp (ENG)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendWhatsAppMarathi(qrModalInvoice)}
                className="flex-1 py-2 px-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-900 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                title="व्हॉट्सॲपवर मराठीत बिल पाठवा"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-900" />
                <span>व्हॉट्सॲप (मराठी)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
