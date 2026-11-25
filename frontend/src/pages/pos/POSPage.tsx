import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  X,
  Banknote,
  CreditCard,
  Receipt,
  Eye,
  Edit3,
  Lock,
  ArrowUpDown,
  RotateCcw,
  UserCheck,
  Tag,
  AlertCircle,
  Scissors,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { api } from '../../services/api';
import { ProductVariant, Customer, Invoice, PaymentMode, StoreCreditNote } from '../../types';
import { BillReviewModal } from '../../components/pos/BillReviewModal';
import { InvoiceEditPinModal } from '../../components/invoice/InvoiceEditPinModal';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { useAuthStore } from '../../stores/authStore';
import { useFocusTrap } from '../../utils/useFocusTrap';

interface POSPageProps {
  onNavigateTab?: (tab: string) => void;
}

const SALES_STAFF = [
  { id: 1, name: 'Vijay Kumar (Counter)' },
  { id: 2, name: 'Suresh Patil (Sales Staff)' },
  { id: 3, name: 'Ramesh Pawar (Fabric Specialist)' },
  { id: 4, name: 'Pooja Shinde (Ethnic Wear)' },
  { id: 5, name: 'Rajesh Sharma (Owner)' },
];

export const POSPage: React.FC<POSPageProps> = () => {
  const { activeStore, user } = useAuthStore();
  const {
    items,
    customer,
    billDiscount,
    discountType,
    addItem,
    removeItem,
    updateQuantity,
    updateItemDiscount,
    setBillDiscount,
    setCustomer,
    clearCart,
    getTotals,
    applyCreditNote,
    activeCreditNote,
    setSalesmanName,
  } = useCartStore();

  const totals = getTotals();

  // Search & Barcode state
  const [searchInput, setSearchInput] = useState('');
  const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Credit'>('Cash');
  const [customTotal, setCustomTotal] = useState<string>('');
  const [discountSymbol, setDiscountSymbol] = useState<'₹' | '%'>('₹');
  const [discountValue, setDiscountValue] = useState<string>('');

  // Salesman Selection
  const [selectedSalesman, setSelectedSalesman] = useState<string>(SALES_STAFF[0].name);

  // Store Credit Note Input
  const [creditNoteInput, setCreditNoteInput] = useState<string>('');
  const [creditNoteError, setCreditNoteError] = useState<string>('');

  // Modals
  const [reviewInvoice, setReviewInvoice] = useState<Invoice | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [showRecentInvoicesModal, setShowRecentInvoicesModal] = useState(false);
  const [editInvoiceTarget, setEditInvoiceTarget] = useState<Invoice | null>(null);
  const [paymentModalMode, setPaymentModalMode] = useState<'CASH' | 'DIGITAL' | 'SPLIT' | null>(null);

  // Exchange / Return Mode (F4)
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState('');
  const [foundInvoices, setFoundInvoices] = useState<Invoice[]>([]);
  const [selectedExchangeInvoice, setSelectedExchangeInvoice] = useState<Invoice | null>(null);
  const [exchangeReason, setExchangeReason] = useState('Size / Fit Exchange');
  const [returnRefInvoice, setReturnRefInvoice] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const productListRef = useRef<HTMLDivElement>(null);

  const exchangeModalRef = useFocusTrap<HTMLDivElement>({
    isOpen: showExchangeModal,
    onClose: () => {
      setShowExchangeModal(false);
      searchInputRef.current?.focus();
    },
    returnFocusSelector: '#pos-barcode-search',
  });

  useEffect(() => {
    api.getAllVariants().then((variants) => {
      setAllVariants(variants);
    });
    api.getInvoices().then((invs) => {
      setRecentInvoices(invs);
    });
    api.getCustomers().then((custs) => {
      setExistingCustomers(custs);
    });
    setSalesmanName(selectedSalesman);
    searchInputRef.current?.focus();
  }, []);

  // Sync / Reset customTotal when items change to prevent stale discount calculations
  useEffect(() => {
    if (items.length === 0) {
      setCustomTotal('');
      setDiscountValue('');
    }
  }, [items.length]);

  // Unsaved Cart Guard: Warn on window close if items are present
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (items.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have items in the active POS cart. Close window?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items.length]);

  // Global & IPC Event Listeners (F3 Search, F4 Exchange, F5/F6/F8 Payment)
  useEffect(() => {
    const handleOpenPayment = (e: Event) => {
      const customEvt = e as CustomEvent<{ mode: 'CASH' | 'DIGITAL' | 'SPLIT' }>;
      if (items.length > 0) {
        setPaymentModalMode(customEvt.detail?.mode || 'CASH');
      }
    };

    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    const handleOpenExchange = () => {
      setShowExchangeModal(true);
    };

    window.addEventListener('pos:open-payment', handleOpenPayment);
    window.addEventListener('pos:focus-search', handleFocusSearch);
    window.addEventListener('pos:open-exchange', handleOpenExchange);

    return () => {
      window.removeEventListener('pos:open-payment', handleOpenPayment);
      window.removeEventListener('pos:focus-search', handleFocusSearch);
      window.removeEventListener('pos:open-exchange', handleOpenExchange);
    };
  }, [items.length]);

  // F4 Global Shortcut Listener for Exchange Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        e.preventDefault();
        setShowExchangeModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter products for the left panel
  const filteredVariants = allVariants.filter((v) => {
    if (!searchInput.trim()) return true;
    const q = searchInput.toLowerCase();
    return (
      v.articleName.toLowerCase().includes(q) ||
      v.sku.toLowerCase().includes(q) ||
      v.barcode.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      (v.color && v.color.toLowerCase().includes(q)) ||
      (v.size && v.size.toLowerCase().includes(q))
    );
  });

  // Keep selected index in bounds when filter changes
  useEffect(() => {
    setSelectedProductIndex(0);
  }, [searchInput]);

  // Scroll active product into view
  useEffect(() => {
    if (productListRef.current && filteredVariants.length > 0) {
      const activeEl = productListRef.current.children[selectedProductIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedProductIndex, filteredVariants.length]);

  const rawNetSubtotal = Math.max(0, totals.subtotal - totals.itemDiscountTotal - totals.returnTotal);

  // When user edits final total, difference is automatically adjusted as Bill Discount
  const handleCustomTotalChange = (valStr: string) => {
    setCustomTotal(valStr);
    if (valStr === '') {
      setDiscountValue('');
      setBillDiscount(0, 'FLAT');
      return;
    }
    const entered = parseFloat(valStr);
    if (!isNaN(entered)) {
      if (rawNetSubtotal > entered) {
        const diff = rawNetSubtotal - entered;
        setDiscountSymbol('₹');
        setDiscountValue(diff.toFixed(2));
        setBillDiscount(diff, 'FLAT');
      } else {
        setDiscountValue('0');
        setBillDiscount(0, 'FLAT');
      }
    }
  };

  // When user edits discount directly, final total reflects it
  const handleDiscountChange = (valStr: string, sym: '₹' | '%' = discountSymbol) => {
    setDiscountValue(valStr);
    const dVal = parseFloat(valStr) || 0;
    setBillDiscount(dVal, sym === '₹' ? 'FLAT' : 'PERCENT');
    if (sym === '₹') {
      const newTot = Math.max(0, rawNetSubtotal - dVal);
      setCustomTotal(newTot > 0 ? newTot.toFixed(2) : '0');
    } else {
      const discAmt = (rawNetSubtotal * dVal) / 100;
      const newTot = Math.max(0, rawNetSubtotal - discAmt);
      setCustomTotal(newTot > 0 ? newTot.toFixed(2) : '0');
    }
  };

  // Add Item to cart with negative stock check
  const handleAddItemToCart = (variant: ProductVariant, qty: number = 1, isReturn: boolean = false) => {
    const res = addItem(variant, qty, isReturn, selectedSalesman);
    if (res && !res.success) {
      alert(`⚠️ Stock Warning: ${res.error}`);
    }
  };

  // Keyboard navigation on search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProductIndex((prev) => Math.min(filteredVariants.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProductIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredVariants[selectedProductIndex]) {
        handleAddItemToCart(filteredVariants[selectedProductIndex], 1);
        setSearchInput('');
        setSelectedProductIndex(0);
        searchInputRef.current?.focus();
      }
    }
  };

  // Redeem Store Credit Note
  const handleRedeemCreditNote = async () => {
    setCreditNoteError('');
    if (!creditNoteInput.trim()) return;
    const notes = await api.getCreditNotes();
    const match = notes.find(
      (n) => n.noteNumber.toUpperCase() === creditNoteInput.trim().toUpperCase() && n.status === 'ACTIVE'
    );
    if (match) {
      applyCreditNote(match);
      setCreditNoteInput('');
    } else {
      setCreditNoteError('Invalid or expired Credit Note / Voucher number');
    }
  };

  // Search Past Invoices for Exchange
  const handleSearchPastInvoice = () => {
    if (!exchangeSearchQuery.trim()) return;
    const q = exchangeSearchQuery.trim().toLowerCase();
    const matched = recentInvoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.customerPhone && inv.customerPhone.includes(q)) ||
        inv.customerName.toLowerCase().includes(q)
    );
    setFoundInvoices(matched);
    if (matched.length > 0) {
      setSelectedExchangeInvoice(matched[0]);
    } else {
      setSelectedExchangeInvoice(null);
    }
  };

  // Add Item from past invoice as a Return Item
  const handleAddReturnItem = (item: any) => {
    // Find matching variant or synthesize
    const existingVar = allVariants.find((v) => v.sku === item.sku || v.barcode === item.barcode);
    const returnVar: ProductVariant = existingVar || {
      id: item.id || Date.now(),
      productId: 1,
      sku: item.sku,
      barcode: item.barcode || item.sku,
      articleName: item.articleName,
      brand: 'Standard',
      category: 'Readymade',
      color: item.color || 'Standard',
      size: item.size || 'Free',
      costPrice: Math.round(item.unitPrice * 0.7),
      sellingPrice: item.unitPrice,
      mrp: item.unitPrice,
      stock: 0,
      reorderLevel: 5,
      unitType: item.unitType || 'PCS',
      hsnCode: item.hsnCode || '6205',
    };

    setReturnRefInvoice(selectedExchangeInvoice?.invoiceNumber || '');
    addItem(returnVar, 1, true, selectedSalesman);
    setShowExchangeModal(false);
  };

  const handleCompleteSale = async () => {
    if (items.length === 0) return;

    const subtotal = totals.subtotal;
    const itemDiscountTotal = totals.itemDiscountTotal;
    const finalBillDiscount = Number(discountValue) || 0;

    // Check if returns exceed purchases => Credit Note to be issued
    const netPayable = totals.taxableAmount + totals.taxAmount - totals.returnTotal - totals.creditNoteRedeemed;
    const creditNoteToIssue = netPayable < 0 ? Math.round(Math.abs(netPayable)) : 0;

    // Effective grand total
    let effectiveGrandTotal = customTotal !== '' ? Number(customTotal) : totals.grandTotal;
    if (isNaN(effectiveGrandTotal) || effectiveGrandTotal < 0) {
      effectiveGrandTotal = totals.grandTotal;
    }

    const pMode: PaymentMode = paymentMode === 'Credit' ? 'CREDIT' : 'CASH';

    const newInvoice: Invoice = {
      id: Date.now(),
      invoiceNumber: `INV-${new Date().toISOString().replaceAll('-', '').replaceAll(':', '').replace('T', '').slice(0, 14)}${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceType: 'TAX',
      customerId: selectedCustomer?.id,
      customerName: customerNameInput.trim() || (selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'),
      customerPhone: customerPhoneInput.trim() || selectedCustomer?.phone,
      cashierName: user?.fullName || 'Vijay Kumar (Cashier)',
      salesmanName: selectedSalesman,
      salesmanId: SALES_STAFF.find((s) => s.name === selectedSalesman)?.id || 1,
      branchName: activeStore.branch || activeStore.name,
      status: pMode === 'CREDIT' ? 'CREDIT' : 'COMPLETED',
      subtotal,
      itemDiscountTotal,
      billDiscount: finalBillDiscount,
      discountType: discountSymbol === '₹' ? 'FLAT' : 'PERCENT',
      taxAmount: totals.taxAmount,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      isInterState: totals.isInterState,
      grandTotal: effectiveGrandTotal,
      paymentMode: pMode,
      paidAmount: pMode === 'CREDIT' ? 0 : effectiveGrandTotal,
      balanceAmount: pMode === 'CREDIT' ? effectiveGrandTotal : 0,
      returnRefInvoiceNumber: returnRefInvoice || undefined,
      creditNoteIssued: creditNoteToIssue > 0 ? creditNoteToIssue : undefined,
      creditNoteRedeemed: totals.creditNoteRedeemed > 0 ? totals.creditNoteRedeemed : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      items: items.map((i, idx) => ({
        id: idx + 1,
        articleName: i.articleName,
        sku: i.sku,
        barcode: i.barcode,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount,
        totalAmount: i.isReturn ? -i.total : i.total,
        unitType: i.unitType || 'PCS',
        hsnCode: i.hsnCode || '6205',
        salesmanName: i.salesmanName || selectedSalesman,
        isReturn: i.isReturn || false,
      })),
    };

    // Save to local storage / API
    await api.createInvoice(newInvoice);
    const updated = await api.getInvoices();
    setRecentInvoices(updated);

    // Refresh existing customers in case outstanding balance was updated
    const updatedCusts = await api.getCustomers();
    setExistingCustomers(updatedCusts);

    // Open Bill Review Modal directly
    setReviewInvoice(newInvoice);
  };

  const handleCloseReview = () => {
    setReviewInvoice(null);
    clearCart();
    setCustomerNameInput('');
    setCustomerPhoneInput('');
    setSelectedCustomer(null);
    setShowCustomerDropdown(false);
    setDiscountValue('');
    setCustomTotal('');
    setReturnRefInvoice('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Page Title & Subtitle + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Point of sale</h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            Search inventory (↑↓ to navigate, Enter to add) • Press <span className="font-bold text-purple-700 bg-purple-50 px-1 py-0.5 rounded">F4 for Exchange</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Salesman Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-gray-500 hidden sm:inline">Staff:</span>
            <select
              value={selectedSalesman}
              onChange={(e) => {
                setSelectedSalesman(e.target.value);
                setSalesmanName(e.target.value);
              }}
              className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              {SALES_STAFF.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exchange / Return Mode Button (F4) */}
          <button
            type="button"
            onClick={() => setShowExchangeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 shadow-2xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Exchange / Return (F4)</span>
          </button>

          {/* Recent Invoices Button */}
          <button
            type="button"
            onClick={() => setShowRecentInvoicesModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs border border-gray-200 shadow-2xs transition"
          >
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Recent Bills &amp; Edit</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Products (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827]">Products</h2>
            <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-blue-500" />
              <span>Use ↑ ↓ keys to select</span>
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              id="pos-barcode-search"
              ref={searchInputRef}
              type="text"
              placeholder="Search product name, SKU, size, or color (↑↓ + Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full p-2.5 text-xs rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
            />
          </div>

          {/* Products List (Cards) */}
          <div ref={productListRef} className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredVariants.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">No products found</div>
            ) : (
              filteredVariants.map((v, idx) => {
                const isSelected = selectedProductIndex === idx;
                const isFabric = v.unitType === 'METER';
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedProductIndex(idx);
                      handleAddItemToCart(v, isFabric ? 1.0 : 1);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition group ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-100 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[#111827] group-hover:text-blue-700 transition flex items-center gap-2">
                        <span>{v.articleName}</span>
                        {isFabric ? (
                          <span className="text-[9px] bg-purple-100 text-purple-700 font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Scissors className="w-2.5 h-2.5" /> Meter Fabric
                          </span>
                        ) : (
                          <span className="text-[9px] bg-gray-100 text-gray-600 font-mono font-bold px-1.5 py-0.5 rounded">
                            Pcs
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-mono font-bold px-1.5 py-0.5 rounded">
                            ↵ Enter
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5">
                        {v.sku} • {v.size} {v.color ? `• ${v.color}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#111827]">
                        ₹{v.sellingPrice.toFixed(2)}
                        {isFabric && <span className="text-[10px] text-gray-400 font-normal"> /mtr</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {v.stock} {isFabric ? 'meters' : 'in stock'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Current Sale (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111827]">Current sale</h2>
              {returnRefInvoice && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Ref: {returnRefInvoice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{items.length} lines</span>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Customer Inputs with Auto-suggest and Selected Customer Badge */}
          <div className="space-y-2">
            {selectedCustomer ? (
              <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {selectedCustomer.name.slice(0, 1)}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{selectedCustomer.name}</span>
                      <span className="font-mono text-gray-500 font-normal">({selectedCustomer.phone})</span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-0.5 flex gap-2">
                      <span className="text-amber-700 font-semibold">
                        Khata Due: ₹{selectedCustomer.outstandingBalance.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        Limit: ₹{selectedCustomer.creditLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerNameInput('');
                    setCustomerPhoneInput('');
                    setCustomer(null);
                  }}
                  className="px-2 py-1 text-[11px] rounded bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Search / Customer name (optional)"
                    value={customerNameInput}
                    onChange={(e) => {
                      setCustomerNameInput(e.target.value);
                      setShowCustomerDropdown(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (customerNameInput.trim().length > 0) setShowCustomerDropdown(true);
                    }}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Phone number (optional)"
                    value={customerPhoneInput}
                    onChange={(e) => {
                      setCustomerPhoneInput(e.target.value);
                      setShowCustomerDropdown(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (customerPhoneInput.trim().length > 0) setShowCustomerDropdown(true);
                    }}
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Auto-suggest dropdown */}
                {showCustomerDropdown && existingCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto p-1 text-xs">
                    <div className="p-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex justify-between">
                      <span>Matching Customers</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomerDropdown(false)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    {existingCustomers
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes((customerNameInput || '').toLowerCase()) ||
                          c.phone.includes(customerPhoneInput || customerNameInput || '')
                      )
                      .slice(0, 5)
                      .map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCustomer(cust);
                            setCustomerNameInput(cust.name);
                            setCustomerPhoneInput(cust.phone);
                            setShowCustomerDropdown(false);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center justify-between transition"
                        >
                          <div>
                            <span className="font-bold text-gray-900">{cust.name}</span>
                            <span className="text-gray-500 text-[11px] ml-1.5 font-mono">
                              ({cust.phone})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-amber-700 font-mono">
                              Khata: ₹{cust.outstandingBalance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3">ITEM</th>
                  <th className="p-3 text-center">QTY / MTR</th>
                  <th className="p-3 text-right">PRICE</th>
                  <th className="p-3 text-right">AMOUNT</th>
                  <th className="p-3 text-center">DISCOUNT</th>
                  <th className="p-3 text-right">FINAL</th>
                  <th className="p-3 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No items in cart. Click on products from the left panel or press Enter to add.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isFabric = item.unitType === 'METER';
                    const isRet = item.isReturn;
                    return (
                      <tr
                        key={`${item.variantId}-${item.isReturn ? 'ret' : 'sale'}`}
                        className={`transition ${isRet ? 'bg-rose-50/70 border-l-4 border-l-rose-500' : 'hover:bg-gray-50/50'}`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{item.articleName}</span>
                            {isRet && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700 uppercase tracking-wider">
                                Return
                              </span>
                            )}
                            {isFabric && (
                              <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                                MTR
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {item.sku} • {item.color} {item.size ? `(${item.size})` : ''}
                          </div>
                        </td>

                        {/* QTY Stepper (Allows decimals for METER fabric) */}
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => {
                                const step = isFabric ? 0.25 : 1;
                                const nextVal = Math.max(0, item.quantity - step);
                                updateQuantity(item.variantId, Number(nextVal.toFixed(2)));
                              }}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            {isFabric ? (
                              <input
                                type="number"
                                step="0.25"
                                min="0.1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(item.variantId, parseFloat(e.target.value) || 0)
                                }
                                className="w-12 text-center font-semibold text-gray-800 text-xs focus:outline-none"
                              />
                            ) : (
                              <span className="w-6 text-center font-semibold text-gray-800 text-xs">
                                {item.quantity}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const step = isFabric ? 0.25 : 1;
                                const nextVal = item.quantity + step;
                                updateQuantity(item.variantId, Number(nextVal.toFixed(2)));
                              }}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-right font-medium text-gray-700">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>

                        <td className="p-3 text-right font-medium text-gray-700">
                          {isRet ? '-' : ''}₹{(item.unitPrice * item.quantity).toFixed(2)}
                        </td>

                        {/* Item Discount Input */}
                        <td className="p-3 text-center">
                          {!isRet && (
                            <input
                              type="number"
                              placeholder="0.00"
                              value={item.discount || ''}
                              onChange={(e) =>
                                updateItemDiscount(
                                  item.variantId,
                                  Number(e.target.value) || 0,
                                  item.discountType
                                )
                              }
                              className="w-16 p-1 text-center text-xs rounded border border-gray-300 text-gray-800 focus:outline-none"
                            />
                          )}
                        </td>

                        <td className={`p-3 text-right font-bold ${isRet ? 'text-rose-700' : 'text-gray-900'}`}>
                          {isRet ? '-' : ''}₹{item.total.toFixed(2)}
                        </td>

                        {/* Delete X */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="text-gray-400 hover:text-gray-700 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Returns Breakdown */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Gross Subtotal</span>
              <span className="font-bold text-sm text-gray-900">
                ₹{totals.subtotal.toFixed(2)}
              </span>
            </div>

            {totals.returnTotal > 0 && (
              <div className="flex justify-between items-center text-rose-700 font-bold bg-rose-50 p-2 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Exchange / Return Deductions</span>
                </span>
                <span>-₹{totals.returnTotal.toFixed(2)}</span>
              </div>
            )}

            {/* Dynamic GST Tax Split (Intra-state vs Inter-state) */}
            <div className="flex justify-between items-center text-[11px] text-gray-500 pt-0.5">
              <span>
                GST Tax ({totals.isInterState ? 'IGST' : 'CGST + SGST'} Split):
              </span>
              <span className="font-mono">
                {totals.isInterState ? (
                  `IGST: ₹${totals.igstAmount.toFixed(2)}`
                ) : (
                  `CGST: ₹${totals.cgstAmount.toFixed(2)} | SGST: ₹${totals.sgstAmount.toFixed(2)}`
                )}
              </span>
            </div>
          </div>

          {/* Redeem Credit Note Voucher Input */}
          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-purple-600" />
                <span>Redeem Store Credit Note / Voucher</span>
              </span>
              {activeCreditNote && (
                <span className="text-[10px] bg-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  Applied: {activeCreditNote.noteNumber} (-₹{activeCreditNote.balance})
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter CN-XXXXXX Voucher Number"
                value={creditNoteInput}
                onChange={(e) => setCreditNoteInput(e.target.value)}
                className="flex-1 p-1.5 text-xs rounded-lg border border-purple-300 bg-white font-mono uppercase focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRedeemCreditNote}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg transition"
              >
                Apply
              </button>
            </div>
            {creditNoteError && <div className="text-[10px] text-rose-600 font-semibold">{creditNoteError}</div>}
          </div>

          {/* Payment Mode */}
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-gray-700 font-medium">Payment Mode</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('Cash')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  paymentMode === 'Cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('Credit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  paymentMode === 'Credit'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Credit (Khata)</span>
              </button>
            </div>
          </div>

          {/* Bill Discount (Automatically adjusts difference) */}
          <div className="flex justify-between items-center text-xs pt-1">
            <div>
              <span className="text-gray-700 font-medium">Bill Discount</span>
              <p className="text-[10px] text-gray-400">Difference in bills auto-adjusted as discount</p>
            </div>
            <div className="flex gap-1.5 items-center">
              <select
                value={discountSymbol}
                onChange={(e) => {
                  const sym = e.target.value as '₹' | '%';
                  setDiscountSymbol(sym);
                  handleDiscountChange(discountValue, sym);
                }}
                className="p-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none"
              >
                <option value="₹">₹</option>
                <option value="%">%</option>
              </select>
              <input
                type="number"
                placeholder="0.00"
                value={discountValue}
                onChange={(e) => handleDiscountChange(e.target.value, discountSymbol)}
                className="w-24 p-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none font-mono font-bold text-right"
              />
            </div>
          </div>

          {/* Credit Note Issuance Banner (If Returns > Purchases) */}
          {totals.taxableAmount + totals.taxAmount < totals.returnTotal && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold">Store Credit Note to be Issued</div>
                <div className="text-[10px] text-amber-700">
                  Return value exceeds new purchase. Customer will receive a 90-day redeemable voucher.
                </div>
              </div>
              <div className="text-base font-extrabold font-mono text-amber-900">
                ₹{Math.round(totals.returnTotal - (totals.taxableAmount + totals.taxAmount))}
              </div>
            </div>
          )}

          {/* Total (Editable: difference automatically becomes bill discount) */}
          <div className="flex justify-between items-center text-sm pt-1">
            <div>
              <span className="text-gray-900 font-bold">Total (Editable)</span>
              <p className="text-[10px] text-emerald-600 font-medium">
                Changing final amount auto-calculates bill discount
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900">₹</span>
              <input
                type="number"
                value={
                  customTotal !== ''
                    ? customTotal
                    : totals.grandTotal > 0
                    ? totals.grandTotal.toFixed(2)
                    : '0'
                }
                onChange={(e) => handleCustomTotalChange(e.target.value)}
                placeholder={totals.grandTotal.toFixed(2)}
                className="w-32 p-1.5 text-right font-bold text-base rounded-lg border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Payment Settlement Hotkeys */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              disabled={items.length === 0}
              onClick={() => setPaymentModalMode('CASH')}
              className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              title="Cash Settlement (F5)"
            >
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Cash (F5)</span>
            </button>
            <button
              type="button"
              disabled={items.length === 0}
              onClick={() => setPaymentModalMode('DIGITAL')}
              className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              title="UPI / QR Settlement (F6)"
            >
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>UPI / QR (F6)</span>
            </button>
            <button
              type="button"
              disabled={items.length === 0}
              onClick={() => setPaymentModalMode('SPLIT')}
              className="py-2.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40"
              title="Split Tender (F8)"
            >
              <Ticket className="w-4 h-4 text-purple-600" />
              <span>Split (F8)</span>
            </button>
          </div>

          {/* Complete Sale Button */}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              if (customTotal !== '') {
                handleCompleteSale();
              } else {
                setPaymentModalMode('CASH');
              }
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-[#1b5e4a] hover:bg-[#14493a] text-white font-bold text-sm shadow-xs transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            <span>Complete sale</span>
            {items.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                ₹{customTotal !== '' ? customTotal : totals.grandTotal.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* POS Payment Settlement Modal */}
      {paymentModalMode && (
        <PaymentModal
          initialMode={paymentModalMode}
          onClose={() => {
            setPaymentModalMode(null);
            searchInputRef.current?.focus();
          }}
          onInvoiceCreated={(createdInv) => {
            setPaymentModalMode(null);
            setReviewInvoice(createdInv);
          }}
        />
      )}

      {/* Bill Review / Print Preview Modal */}
      {reviewInvoice && (
        <BillReviewModal
          invoice={reviewInvoice}
          onClose={handleCloseReview}
        />
      )}

      {/* F4 Garment Exchange & Return Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            ref={exchangeModalRef}
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-purple-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-gray-900">Garment Exchange / Return (F4)</h2>
                  <p className="text-xs text-gray-500">Lookup original bill, select returned garments, and issue credit note</p>
                </div>
              </div>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              {/* Search Past Bill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Invoice No (e.g. INV-2026...) or Customer Phone"
                  value={exchangeSearchQuery}
                  onChange={(e) => setExchangeSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchPastInvoice();
                  }}
                  className="flex-1 p-2.5 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={handleSearchPastInvoice}
                  className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition"
                >
                  Search Bill
                </button>
              </div>

              {/* Found Invoice Details */}
              {selectedExchangeInvoice ? (
                <div className="border border-purple-200 bg-purple-50/30 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                    <div>
                      <div className="font-extrabold text-gray-900 font-mono text-sm">
                        {selectedExchangeInvoice.invoiceNumber}
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Customer: {selectedExchangeInvoice.customerName} ({selectedExchangeInvoice.customerPhone || 'N/A'})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₹{selectedExchangeInvoice.grandTotal.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400">{selectedExchangeInvoice.createdAt}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-gray-800 mb-2">Select Item to Return / Exchange:</div>
                    <div className="space-y-2">
                      {selectedExchangeInvoice.items.map((it) => (
                        <div
                          key={it.id}
                          className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-purple-300 transition"
                        >
                          <div>
                            <div className="font-bold text-gray-900">{it.articleName}</div>
                            <div className="text-gray-500 text-[11px]">
                              {it.sku} • {it.color} {it.size ? `(${it.size})` : ''} • Qty Sold: {it.quantity}
                            </div>
                            <div className="text-purple-700 font-bold font-mono text-xs mt-0.5">
                              Unit Price: ₹{it.unitPrice.toFixed(2)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddReturnItem(it)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-2xs transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return (-₹{it.unitPrice.toFixed(2)})</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  Search by invoice number or customer mobile to load purchased items for return.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Invoices & PIN 1234 Edit Drawer/Modal */}
      {showRecentInvoicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-gray-900">Recent Store Invoices</h2>
                  <p className="text-xs text-gray-500">Print Preview &amp; PIN-Authorized Secure Invoice Editing</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecentInvoicesModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {recentInvoices.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">No invoices found.</div>
              ) : (
                recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600">{inv.invoiceNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'EDITED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.creditNoteIssued && inv.creditNoteIssued > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            Credit Note: ₹{inv.creditNoteIssued}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-700 font-semibold mt-1">
                        {inv.customerName} {inv.customerPhone ? `(${inv.customerPhone})` : ''}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {inv.createdAt} • Mode: {inv.paymentMode} • Staff: {inv.salesmanName || inv.cashierName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="text-right mr-2">
                        <div className="font-black text-sm text-gray-900 font-mono">
                          ₹{inv.grandTotal.toFixed(2)}
                        </div>
                        {inv.billDiscount > 0 && (
                          <div className="text-[10px] text-rose-600 font-mono">
                            Disc: ₹{inv.billDiscount.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReviewInvoice(inv);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 shadow-2xs transition"
                        title="Print Preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditInvoiceTarget(inv);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs transition"
                        title="Edit Invoice (Requires PIN Authentication)"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Edit (PIN)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authorized PIN Edit Modal */}
      {editInvoiceTarget && (
        <InvoiceEditPinModal
          invoice={editInvoiceTarget}
          onClose={() => setEditInvoiceTarget(null)}
          onSuccess={async () => {
            const updated = await api.getInvoices();
            setRecentInvoices(updated);
            setEditInvoiceTarget(null);
          }}
        />
      )}
    </div>
  );
};
