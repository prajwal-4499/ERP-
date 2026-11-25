import {
  Product,
  Customer,
  Supplier,
  Invoice,
  CashShift,
  Expense,
  Alteration,
  AuditLog,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  SupplierBill,
  PurchaseOrder,
  StoreCreditNote,
  SystemSettingsConfig,
} from '../types';
import { initialProductsDatabase } from './inventoryData';

// Persistent LocalStorage Helpers
function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`cloth_shop_erp_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
  }
  return defaultValue;
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`cloth_shop_erp_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
}

// Initial In-Memory & Disk Cached Collections
let mockProducts: Product[] = loadStorage('products', [...initialProductsDatabase]);
// Initial Customers Seed
const todayIso = new Date().toISOString().slice(0, 10);
const todayMonthDay = todayIso.slice(5); // MM-DD
const defaultInitialCustomers: Customer[] = [
  {
    id: 1,
    name: 'Amit Deshmukh',
    phone: '9822012345',
    email: 'amit.deshmukh@gmail.com',
    birthday: `1988-${todayMonthDay}`, // Today's Birthday
    anniversary: '2015-11-20',
    creditLimit: 15000,
    outstandingBalance: 3200,
    loyaltyPoints: 120,
    notes: 'Regular customer for cotton formal shirts',
    createdAt: '2025-06-12',
  },
  {
    id: 2,
    name: 'Sunita Rajesh Jadhav',
    phone: '9423198765',
    email: 'sunita.jadhav@yahoo.co.in',
    birthday: '1985-04-18',
    anniversary: `2010-${todayMonthDay}`, // Today's Anniversary
    creditLimit: 25000,
    outstandingBalance: 0,
    loyaltyPoints: 340,
    notes: 'Prefers Paithani & pure silk sarees',
    createdAt: '2025-07-04',
  },
  {
    id: 3,
    name: 'Rahul Vilas Patil',
    phone: '9158024680',
    email: 'rahul.patil@outlook.com',
    birthday: '1992-08-14',
    anniversary: '2018-05-22',
    creditLimit: 20000,
    outstandingBalance: 8500,
    loyaltyPoints: 75,
    notes: 'Khata due since last month',
    createdAt: '2025-08-19',
  },
  {
    id: 4,
    name: 'Sachin More',
    phone: '9890123456',
    email: 'sachin.more@gmail.com',
    birthday: '1990-12-05',
    anniversary: `2016-${todayMonthDay}`, // Today's Anniversary
    creditLimit: 12000,
    outstandingBalance: 4750,
    loyaltyPoints: 190,
    notes: 'Suiting & shirting fabrics customer',
    createdAt: '2025-09-02',
  },
  {
    id: 5,
    name: 'Priya Kadam',
    phone: '9765432109',
    email: 'priya.kadam@rediffmail.com',
    birthday: `1995-${todayMonthDay}`, // Today's Birthday
    anniversary: '2021-02-14',
    creditLimit: 10000,
    outstandingBalance: 1800,
    loyaltyPoints: 210,
    notes: 'Ethnic dresses and kurti sets',
    createdAt: '2025-10-15',
  },
];

let mockCustomers: Customer[] = loadStorage('customers', defaultInitialCustomers);
if (!mockCustomers || mockCustomers.length === 0) {
  mockCustomers = [...defaultInitialCustomers];
}
let mockCustomerLedger: CustomerLedgerEntry[] = loadStorage('customer_ledger', []);
let mockInvoices: Invoice[] = loadStorage('invoices', []);
let mockSuppliers: Supplier[] = loadStorage('suppliers', [
  {
    id: 1,
    name: 'Ichalkaranji Textile Mills Ltd',
    phone: '0231-2445566',
    email: 'sales@ichalkaranji.in',
    gstin: '27AAACI1234M1Z9',
    contactPerson: 'Santosh Patil',
    address: 'Industrial Area, Ichalkaranji, Kolhapur',
    paymentTerms: 'Net 30 Days',
    outstandingPayable: 0,
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 2,
    name: 'Surat Fabric & Saree Wholesale Hub',
    phone: '0261-2678901',
    email: 'orders@suratfabrics.com',
    gstin: '24AABCS5678E1Z4',
    contactPerson: 'Kishore Shah',
    address: 'Ring Road Textile Market, Surat',
    paymentTerms: 'Net 45 Days',
    outstandingPayable: 0,
    active: true,
    createdAt: '2026-01-15',
  },
  {
    id: 3,
    name: 'Yeola Paithani & Silk Weavers Guild',
    phone: '02559-223344',
    email: 'weavers@yeolapaithani.org',
    gstin: '27AABCT9876P1Z8',
    contactPerson: 'Nitin Shinde',
    address: 'Paithani Market, Yeola, Nashik',
    paymentTerms: 'Immediate / Advance',
    outstandingPayable: 0,
    active: true,
    createdAt: '2026-02-01',
  },
  {
    id: 4,
    name: 'Raymond Apparel Wholesale Hub',
    phone: '022-44556677',
    email: 'distribution@raymond.in',
    gstin: '27AAACR4321Q1Z3',
    contactPerson: 'Mahesh Kulkarni',
    address: 'Bhiwandi Logistics Hub, Thane',
    paymentTerms: 'Net 30 Days',
    outstandingPayable: 0,
    active: true,
    createdAt: '2026-02-10',
  },
]);

let mockSupplierLedger: SupplierLedgerEntry[] = loadStorage('supplier_ledger', []);
let mockSupplierBills: SupplierBill[] = loadStorage('supplier_bills', []);
let mockPurchaseOrders: PurchaseOrder[] = loadStorage('purchase_orders', []);

let mockCashShift: CashShift = loadStorage('cash_shift', {
  id: 1,
  cashierId: 1,
  cashierName: 'Rajesh Sharma',
  branchName: 'Main Fashion Store',
  startTime: '2026-10-06 10:00 AM',
  openingCash: 5000,
  cashSales: 0,
  cashReceived: 0,
  cashRefunds: 0,
  cashExpenses: 0,
  cashWithdrawals: 0,
  expectedCash: 5000,
  actualCash: 5000,
  difference: 0,
  status: 'OPEN',
});

let mockExpenses: Expense[] = loadStorage('expenses', [
  { id: 1, category: 'Packaging', amount: 450, paymentMode: 'CASH', expenseDate: '2026-10-06', description: 'Carry bags and luxury garment boxes', createdBy: 'Rajesh Sharma' },
  { id: 2, category: 'Electricity', amount: 4200, paymentMode: 'UPI', expenseDate: '2026-10-03', description: 'BESCOM Monthly Electricity Bill for September', createdBy: 'Admin' },
  { id: 3, category: 'Transport', amount: 1200, paymentMode: 'CASH', expenseDate: '2026-10-02', description: 'Stock parcel tempo freight from Peenya', createdBy: 'Rajesh Sharma' },
]);

let mockAlterations: Alteration[] = loadStorage('alterations', [
  { id: 1, orderNumber: 'ALT-1001', customerId: 1, customerName: 'Anand Kumar', customerPhone: '9845012345', invoiceNumber: 'INV-2026-1050', garmentItem: 'Oxford Cotton Shirt - White', measurements: 'Sleeve Length: -1.5 inch, Waist taper: 1 inch', tailorName: 'Master Rafiq', tailorNotes: 'Keep original stitch finish', dueDate: '2026-10-08', alterationCharge: 150, status: 'IN_PROGRESS', notifyCustomerOnReady: true, createdAt: '2026-10-06 19:50' },
  { id: 2, orderNumber: 'ALT-1002', customerName: 'Deepak Rao', customerPhone: '9880011223', invoiceNumber: 'INV-2026-1049', garmentItem: 'Levi’s 511 Dark Indigo Jeans', measurements: 'Length shortening: 2 inches', tailorName: 'Master Rafiq', dueDate: '2026-10-07', alterationCharge: 100, status: 'READY', notifyCustomerOnReady: true, createdAt: '2026-10-06 18:30' },
]);

let mockAuditLogs: AuditLog[] = loadStorage('audit_logs', [
  { id: 1, username: 'admin', role: 'OWNER', action: 'SYSTEM_BOOT', module: 'SECURITY', recordId: 'SYS-1', newValue: 'System operational with persistent storage', reason: 'Initial application boot', authMethod: 'SYSTEM', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) },
]);

let mockCreditNotes: StoreCreditNote[] = loadStorage('credit_notes', []);

let mockSettings: SystemSettingsConfig = loadStorage('settings', {
  blockNegativeStock: false,
  defaultGstRate: 5.0,
  cgstRate: 2.5,
  sgstRate: 2.5,
  storeStateCode: '27',
  autoThermalPrint: true,
});

// Persistence Dispatcher
function persistAll() {
  saveStorage('products', mockProducts);
  saveStorage('customers', mockCustomers);
  saveStorage('customer_ledger', mockCustomerLedger);
  saveStorage('invoices', mockInvoices);
  saveStorage('suppliers', mockSuppliers);
  saveStorage('supplier_ledger', mockSupplierLedger);
  saveStorage('supplier_bills', mockSupplierBills);
  saveStorage('purchase_orders', mockPurchaseOrders);
  saveStorage('cash_shift', mockCashShift);
  saveStorage('expenses', mockExpenses);
  saveStorage('alterations', mockAlterations);
  saveStorage('audit_logs', mockAuditLogs);
  saveStorage('credit_notes', mockCreditNotes);
  saveStorage('settings', mockSettings);
}

export const api = {
  // Settings
  getSettings: async (): Promise<SystemSettingsConfig> => ({ ...mockSettings }),
  updateSettings: async (settings: Partial<SystemSettingsConfig>): Promise<SystemSettingsConfig> => {
    Object.assign(mockSettings, settings);
    saveStorage('settings', mockSettings);
    api.addAuditLog('SETTINGS_UPDATE', 'SETTINGS', 'CONFIG', 'Updated system preferences and rules');
    return { ...mockSettings };
  },

  // Products & Variants
  getProducts: async (): Promise<Product[]> => [...mockProducts],
  getAllVariants: async () => mockProducts.flatMap((p) => p.variants),

  addProduct: async (product: Partial<Product>): Promise<Product> => {
    const newProd: Product = {
      id: Date.now(),
      articleName: product.articleName || 'New Article',
      brand: product.brand || 'Generic',
      category: product.category || 'Apparel',
      hsnCode: product.hsnCode || '6205',
      fabricType: product.fabricType || 'Cotton',
      careInstructions: product.careInstructions || 'Standard Wash',
      description: product.description || '',
      reorderLevel: product.reorderLevel || 5,
      variants: (product.variants || []).map((v, i) => ({
        ...v,
        id: v.id || Date.now() + i,
        unitType: v.unitType || 'PCS',
        lastReceivedAt: new Date().toISOString(),
      })),
    };
    mockProducts.push(newProd);
    persistAll();
    api.addAuditLog('PRODUCT_CREATED', 'PRODUCTS', String(newProd.id), `Added style: ${newProd.articleName}`);
    return newProd;
  },

  updateVariantStock: async (variantId: number, quantityChange: number): Promise<void> => {
    mockProducts.forEach((p) => {
      const v = p.variants.find((vr) => vr.id === variantId);
      if (v) {
        v.stock = Math.max(0, v.stock + quantityChange);
        if (quantityChange > 0) {
          v.lastReceivedAt = new Date().toISOString();
        }
      }
    });
    persistAll();
  },

  // Aging / Dead Stock Inventory Analysis (60, 90, 180+ Days)
  getAgingInventory: async (days: number = 60) => {
    const now = Date.now();
    const thresholdMs = days * 24 * 60 * 60 * 1000;
    const variants = mockProducts.flatMap((p) => p.variants);

    return variants
      .filter((v) => {
        if (v.stock <= 0) return false;
        const refDateStr = v.lastSoldAt || v.lastReceivedAt || v.createdAt || '2026-01-01';
        const ageMs = now - new Date(refDateStr).getTime();
        return ageMs >= thresholdMs;
      })
      .map((v) => {
        const refDateStr = v.lastSoldAt || v.lastReceivedAt || v.createdAt || '2026-01-01';
        const daysUnsold = Math.floor((now - new Date(refDateStr).getTime()) / (24 * 60 * 60 * 1000));
        return {
          ...v,
          daysUnsold,
          tiedCapital: v.stock * v.costPrice,
          estimatedLoss: Math.round(v.stock * (v.mrp - v.sellingPrice)),
        };
      })
      .sort((a, b) => b.daysUnsold - a.daysUnsold);
  },

  // Invoices & POS Billing Engine
  createInvoice: async (invoiceData: Partial<Invoice>, blockNegativeStock?: boolean): Promise<Invoice> => {
    const shouldBlockNegative = blockNegativeStock ?? mockSettings.blockNegativeStock;
    const invNo = invoiceData.invoiceNumber || ('INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));

    // Stock check if blockNegativeStock is true
    if (shouldBlockNegative && invoiceData.items) {
      for (const item of invoiceData.items) {
        if (!item.isReturn) {
          for (const p of mockProducts) {
            const v = p.variants.find((vr) => vr.barcode === item.barcode || vr.sku === item.sku);
            if (v && v.stock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.articleName} (Available: ${v.stock}, Requested: ${item.quantity})`);
            }
          }
        }
      }
    }

    // Resolve or Auto-register Customer
    let targetCust: Customer | undefined;
    if (invoiceData.customerId) {
      targetCust = mockCustomers.find((c) => c.id === invoiceData.customerId);
    } else if (invoiceData.customerPhone && invoiceData.customerPhone.trim()) {
      targetCust = mockCustomers.find((c) => c.phone.trim() === invoiceData.customerPhone?.trim());
    } else if (invoiceData.customerName && invoiceData.customerName.trim().toLowerCase() !== 'walk-in customer') {
      targetCust = mockCustomers.find((c) => c.name.trim().toLowerCase() === invoiceData.customerName?.trim().toLowerCase());
    }

    if (!targetCust && invoiceData.customerName && invoiceData.customerName.trim().toLowerCase() !== 'walk-in customer') {
      targetCust = {
        id: Date.now(),
        name: invoiceData.customerName.trim(),
        phone: invoiceData.customerPhone?.trim() || 'N/A',
        customerGroup: 'Retail Regular',
        creditLimit: 20000,
        outstandingBalance: 0,
        loyaltyPoints: Math.floor((invoiceData.grandTotal || 0) / 100),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      mockCustomers.unshift(targetCust);
    }

    const assignedCustomerId = targetCust ? targetCust.id : invoiceData.customerId;
    const assignedCustomerName = targetCust ? targetCust.name : (invoiceData.customerName || 'Walk-in Customer');
    const assignedCustomerPhone = targetCust ? targetCust.phone : invoiceData.customerPhone;

    // Check Credit Limit across full Credit sale and Split Credit portions
    const creditPortion =
      invoiceData.paymentMode === 'CREDIT'
        ? (invoiceData.grandTotal || 0)
        : (invoiceData.splitDetails?.credit || 0);

    if (creditPortion > 0 && targetCust) {
      if (targetCust.outstandingBalance + creditPortion > targetCust.creditLimit) {
        throw new Error(
          `Credit limit exceeded! Limit: ₹${targetCust.creditLimit}, Current Debt: ₹${targetCust.outstandingBalance}, New Credit: ₹${creditPortion}`
        );
      }
    }

    // Dynamic Apparel GST Slab & Intra/Inter-state Splitting
    const storeStateCode = mockSettings.storeStateCode || '27';
    let isInterState = false;
    if (invoiceData.customerGstin && invoiceData.customerGstin.length >= 2) {
      const gstinState = invoiceData.customerGstin.slice(0, 2);
      if (/^\d{2}$/.test(gstinState) && gstinState !== storeStateCode) {
        isInterState = true;
      }
    }

    let calculatedTax = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const formattedItems = (invoiceData.items || []).map((it, idx) => {
      const gross = it.unitPrice * it.quantity;
      const discVal =
        (it as any).discountType === 'PERCENT'
          ? (gross * (it.discount || 0)) / 100
          : it.discount || 0;
      const lineNet = Math.max(0, it.totalAmount !== undefined ? Math.abs(it.totalAmount) : gross - discVal);
      const perPiecePrice = it.quantity > 0 ? lineNet / it.quantity : lineNet;

      // Indian Apparel GST slab rule: < 1000 => 5%, >= 1000 => 12%
      const slabRate = perPiecePrice < 1000 ? 5.0 : 12.0;
      const lineTax = (lineNet * slabRate) / 100;
      calculatedTax += lineTax;

      let lineCgst = 0;
      let lineSgst = 0;
      let lineIgst = 0;

      if (isInterState) {
        lineIgst = lineTax;
        igstTotal += lineTax;
      } else {
        lineCgst = lineTax / 2;
        lineSgst = lineTax / 2;
        cgstTotal += lineTax / 2;
        sgstTotal += lineTax / 2;
      }

      return {
        id: it.id || idx + 1,
        variantId: it.variantId,
        articleName: it.articleName,
        sku: it.sku,
        barcode: it.barcode,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        totalAmount: it.totalAmount,
        unitType: it.unitType || 'PCS',
        hsnCode: it.hsnCode || '6205',
        taxRate: slabRate,
        cgst: Number(lineCgst.toFixed(2)),
        sgst: Number(lineSgst.toFixed(2)),
        igst: Number(lineIgst.toFixed(2)),
        salesmanName: it.salesmanName || invoiceData.salesmanName,
        isReturn: it.isReturn || false,
      };
    });

    const finalGrandTotal = invoiceData.grandTotal !== undefined ? invoiceData.grandTotal : 0;
    const finalPaid = invoiceData.paidAmount !== undefined ? invoiceData.paidAmount : (invoiceData.paymentMode === 'CREDIT' ? 0 : finalGrandTotal);
    const finalBalance = invoiceData.balanceAmount !== undefined ? invoiceData.balanceAmount : (invoiceData.paymentMode === 'CREDIT' ? finalGrandTotal : 0);

    // Salesman Commission: 2% by default
    const commissionAmt = invoiceData.salesmanName ? Math.round(finalGrandTotal * 0.02) : 0;

    const newInv: Invoice = {
      id: Date.now(),
      invoiceNumber: invNo,
      invoiceType: invoiceData.invoiceType || 'RETAIL',
      customerId: assignedCustomerId,
      customerName: assignedCustomerName,
      customerPhone: assignedCustomerPhone,
      customerGstin: invoiceData.customerGstin,
      subtotal: invoiceData.subtotal || 0,
      itemDiscountTotal: invoiceData.itemDiscountTotal || 0,
      billDiscount: invoiceData.billDiscount || 0,
      discountType: invoiceData.discountType || 'FLAT',
      taxAmount: Number(calculatedTax.toFixed(2)),
      cgstAmount: Number(cgstTotal.toFixed(2)),
      sgstAmount: Number(sgstTotal.toFixed(2)),
      igstAmount: Number(igstTotal.toFixed(2)),
      isInterState,
      grandTotal: finalGrandTotal,
      paidAmount: finalPaid,
      balanceAmount: finalBalance,
      paymentMode: invoiceData.paymentMode || 'CASH',
      splitDetails: invoiceData.splitDetails,
      status: invoiceData.status || (invoiceData.paymentMode === 'CREDIT' ? 'CREDIT' : 'COMPLETED'),
      cashierName: invoiceData.cashierName || 'Vijay Kumar',
      salesmanId: invoiceData.salesmanId,
      salesmanName: invoiceData.salesmanName,
      commissionAmount: commissionAmt,
      returnRefInvoiceNumber: invoiceData.returnRefInvoiceNumber,
      creditNoteIssued: invoiceData.creditNoteIssued || 0,
      creditNoteRedeemed: invoiceData.creditNoteRedeemed || 0,
      branchName: invoiceData.branchName || 'Pargaon (Mangrul)',
      createdAt: invoiceData.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19),
      items: formattedItems,
    };

    mockInvoices.unshift(newInv);

    // 1. Stock Updates & Movements (Supports exact fractional meter quantities for fabrics)
    newInv.items.forEach((item) => {
      mockProducts.forEach((p) => {
        const v = p.variants.find((vr) => vr.barcode === item.barcode || vr.sku === item.sku);
        if (v) {
          if (item.isReturn) {
            v.stock = Number((v.stock + item.quantity).toFixed(2));
          } else {
            v.stock = Number(Math.max(0, v.stock - item.quantity).toFixed(2));
            v.lastSoldAt = new Date().toISOString();
          }
        }
      });
    });

    // 2. Issue Store Credit Note if applicable
    if (newInv.creditNoteIssued && newInv.creditNoteIssued > 0) {
      const creditNote: StoreCreditNote = {
        id: Date.now(),
        noteNumber: 'CN-' + Date.now().toString().slice(-6),
        invoiceNumber: newInv.invoiceNumber,
        customerId: targetCust?.id,
        customerName: assignedCustomerName,
        customerPhone: assignedCustomerPhone,
        amount: newInv.creditNoteIssued,
        balance: newInv.creditNoteIssued,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().slice(0, 10),
        expiresAt: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      };
      mockCreditNotes.unshift(creditNote);
    }

    // 3. Redeem Store Credit Note if applied
    if (newInv.creditNoteRedeemed && newInv.creditNoteRedeemed > 0) {
      const activeCN = mockCreditNotes.find((cn) => cn.status === 'ACTIVE' && cn.balance >= (newInv.creditNoteRedeemed || 0));
      if (activeCN) {
        activeCN.balance = Math.max(0, activeCN.balance - newInv.creditNoteRedeemed);
        if (activeCN.balance === 0) activeCN.status = 'REDEEMED';
      }
    }

    // 4. Customer Khata Ledger Entry
    const creditAmount = newInv.paymentMode === 'CREDIT' ? finalBalance : (newInv.splitDetails?.credit || 0);
    if (targetCust && creditAmount > 0) {
      targetCust.outstandingBalance += creditAmount;
      mockCustomerLedger.unshift({
        id: Date.now(),
        customerId: targetCust.id,
        invoiceNo: newInv.invoiceNumber,
        transactionType: 'SALE',
        debit: creditAmount,
        credit: 0,
        balance: targetCust.outstandingBalance,
        paymentMode: newInv.paymentMode,
        remarks: `Credit bill #${newInv.invoiceNumber} (${newInv.items.length} items)`,
        createdAt: newInv.createdAt,
      });
    }

    if (targetCust) {
      targetCust.loyaltyPoints += Math.floor(newInv.grandTotal / 100);
    }

    // 5. Cash Shift Drawer Update (Supports both CASH mode and SPLIT cash portions)
    const cashPortion =
      newInv.paymentMode === 'CASH'
        ? newInv.paidAmount
        : newInv.paymentMode === 'SPLIT'
        ? newInv.splitDetails?.cash || 0
        : 0;

    if (cashPortion > 0) {
      mockCashShift.cashSales += cashPortion;
      mockCashShift.expectedCash += cashPortion;
      mockCashShift.actualCash += cashPortion;
    }

    persistAll();
    api.addAuditLog('INVOICE_GENERATED', 'POS', newInv.invoiceNumber, `Generated ${newInv.invoiceType} invoice total ₹${newInv.grandTotal} via ${newInv.paymentMode}`);
    return newInv;
  },

  getInvoices: async (): Promise<Invoice[]> => [...mockInvoices],

  getCustomerInvoices: async (customerId: number): Promise<Invoice[]> => {
    const cust = mockCustomers.find((c) => c.id === customerId);
    return mockInvoices.filter((inv) => {
      if (inv.customerId === customerId) return true;
      if (cust) {
        if (inv.customerPhone && cust.phone && inv.customerPhone.trim() === cust.phone.trim()) return true;
        if (inv.customerName && cust.name && inv.customerName.trim().toLowerCase() === cust.name.trim().toLowerCase()) return true;
      }
      return false;
    });
  },

  // Secure PIN Verification & Invoice Modification
  verifySecurityPin: async (pin: string, action: string = 'PIN_CHECK', module: string = 'SECURITY'): Promise<boolean> => {
    let isValid = false;

    // Check Electron IPC first if in desktop shell
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.verifyPin === 'function') {
      try {
        const res = await window.electronAPI.verifyPin(pin, action, module);
        isValid = res.valid;
      } catch (e) {
        isValid = pin === '1234' || pin === '9999';
      }
    } else {
      isValid = pin === '1234' || pin === '9999';
    }

    api.addAuditLog(
      isValid ? 'PIN_VERIFY_SUCCESS' : 'PIN_VERIFY_FAILED',
      module,
      'PIN',
      `PIN verification for action: ${action}`,
      'PIN'
    );
    return isValid;
  },

  updateInvoiceWithPin: async (invoiceId: number, pin: string, reason: string, updatedFields: Partial<Invoice>): Promise<boolean> => {
    const verified = await api.verifySecurityPin(pin, 'INVOICE_EDIT', 'INVOICE');
    if (!verified) throw new Error('Invalid Security PIN. Access Denied.');

    const target = mockInvoices.find((i) => i.id === invoiceId);
    if (!target) throw new Error('Invoice not found');

    const oldSnapshot = JSON.stringify({ customer: target.customerName, total: target.grandTotal, discount: target.billDiscount });
    Object.assign(target, updatedFields, { status: 'EDITED' });
    const newSnapshot = JSON.stringify({ customer: target.customerName, total: target.grandTotal, discount: target.billDiscount });

    persistAll();
    api.addAuditLog('INVOICE_EDIT', 'INVOICE', target.invoiceNumber, `Invoice modified. Reason: ${reason}`, 'PIN_VERIFIED', oldSnapshot, newSnapshot);
    return true;
  },

  // Store Credit Notes
  getCreditNotes: async (): Promise<StoreCreditNote[]> => [...mockCreditNotes],

  // Customers & Khata Ledger
  getCustomers: async (): Promise<Customer[]> => [...mockCustomers],
  getCustomerLedger: async (customerId: number): Promise<CustomerLedgerEntry[]> =>
    mockCustomerLedger.filter((l) => l.customerId === customerId),

  addCustomerTransaction: async (
    customerId: number,
    type: 'PAYMENT_RECEIVED' | 'PAYMENT_GIVEN' | 'SALE',
    amount: number,
    mode: string,
    refNo: string,
    remarks: string,
    dateTimeStr?: string,
    invoiceNo?: string
  ) => {
    const cust = mockCustomers.find((c) => c.id === customerId);
    if (!cust) throw new Error('Customer not found');

    const dt = dateTimeStr || new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (type === 'PAYMENT_RECEIVED') {
      cust.outstandingBalance = Math.max(0, cust.outstandingBalance - amount);
      if (mode === 'CASH') {
        mockCashShift.cashReceived += amount;
        mockCashShift.expectedCash += amount;
        mockCashShift.actualCash += amount;
      }
      mockCustomerLedger.unshift({
        id: Date.now(),
        customerId,
        invoiceNo: invoiceNo || undefined,
        transactionType: 'PAYMENT_RECEIVED' as any,
        debit: 0,
        credit: amount,
        balance: cust.outstandingBalance,
        paymentMode: mode,
        referenceNo: refNo,
        remarks: remarks || 'Khata settlement payment received',
        createdAt: dt,
      });
      api.addAuditLog('CUSTOMER_PAYMENT_REC', 'CUSTOMERS', String(customerId), `Payment received of ₹${amount} via ${mode}`);
    } else if (type === 'PAYMENT_GIVEN') {
      cust.outstandingBalance += amount;
      if (mode === 'CASH') {
        mockCashShift.cashRefunds += amount;
        mockCashShift.expectedCash -= amount;
        mockCashShift.actualCash -= amount;
      }
      mockCustomerLedger.unshift({
        id: Date.now(),
        customerId,
        invoiceNo: invoiceNo || undefined,
        transactionType: 'PAYMENT_GIVEN' as any,
        debit: amount,
        credit: 0,
        balance: cust.outstandingBalance,
        paymentMode: mode,
        referenceNo: refNo,
        remarks: remarks || 'Payment given / refund to customer',
        createdAt: dt,
      });
      api.addAuditLog('CUSTOMER_PAYMENT_GIVEN', 'CUSTOMERS', String(customerId), `Payment given of ₹${amount} to customer via ${mode}`);
    } else {
      cust.outstandingBalance += amount;
      mockCustomerLedger.unshift({
        id: Date.now(),
        customerId,
        invoiceNo: invoiceNo || undefined,
        transactionType: 'SALE',
        debit: amount,
        credit: 0,
        balance: cust.outstandingBalance,
        paymentMode: mode,
        referenceNo: refNo,
        remarks: remarks || 'Credit sale ledger entry',
        createdAt: dt,
      });
      api.addAuditLog('CUSTOMER_CREDIT_SALE', 'CUSTOMERS', String(customerId), `Credit sale of ₹${amount} recorded`);
    }

    persistAll();
    return cust;
  },

  addCustomerPayment: async (customerId: number, amount: number, mode: string, refNo: string, remarks: string) => {
    return api.addCustomerTransaction(customerId, 'PAYMENT_RECEIVED', amount, mode, refNo, remarks);
  },

  // Today's Alerts & Reminders Widget
  getTodayAlerts: async () => {
    const today = new Date();
    const curMonth = today.getMonth() + 1;
    const curDay = today.getDate();

    const birthdaysToday = mockCustomers.filter((c) => {
      if (!c.birthday) return false;
      const bDate = new Date(c.birthday);
      return bDate.getMonth() + 1 === curMonth && bDate.getDate() === curDay;
    });

    const anniversariesToday = mockCustomers.filter((c) => {
      if (!c.anniversary) return false;
      const aDate = new Date(c.anniversary);
      return aDate.getMonth() + 1 === curMonth && aDate.getDate() === curDay;
    });

    const overdueKhata = mockCustomers.filter((c) => c.outstandingBalance > 0);

    return {
      birthdaysToday,
      anniversariesToday,
      overdueKhata,
    };
  },

  // Suppliers & Purchases
  getSuppliers: async (): Promise<Supplier[]> => [...mockSuppliers],
  getSupplierBills: async (): Promise<SupplierBill[]> => [...mockSupplierBills],
  getSupplierLedger: async (supplierId: number): Promise<SupplierLedgerEntry[]> =>
    mockSupplierLedger.filter((l) => l.supplierId === supplierId),

  addSupplierTransaction: async (
    supplierId: number,
    type: 'PURCHASE_CREDIT' | 'PAYMENT_MADE',
    amount: number,
    invNo: string,
    mode: string,
    refNo: string,
    remarks: string,
    attachmentUrl?: string
  ) => {
    const supp = mockSuppliers.find((s) => s.id === supplierId);
    if (!supp) throw new Error('Supplier not found');

    if (type === 'PURCHASE_CREDIT') {
      supp.outstandingPayable += amount;
      mockSupplierLedger.unshift({
        id: Date.now(),
        supplierId,
        invoiceNo: invNo,
        transactionType: 'PURCHASE_CREDIT',
        debit: 0,
        credit: amount,
        balance: supp.outstandingPayable,
        referenceNo: refNo,
        remarks,
        attachmentUrl,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      mockSupplierBills.unshift({
        id: Date.now(),
        supplierId,
        supplierName: supp.name,
        supplierInvoiceNo: invNo || `BILL-${Date.now().toString().slice(-4)}`,
        purchaseDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        amount,
        taxableAmount: Math.round(amount / 1.05),
        gstAmount: Math.round(amount - amount / 1.05),
        discount: 0,
        paidAmount: 0,
        outstandingAmount: amount,
        paymentStatus: 'PENDING',
        attachmentUrl,
        notes: remarks,
      });
    } else {
      supp.outstandingPayable = Math.max(0, supp.outstandingPayable - amount);
      mockSupplierLedger.unshift({
        id: Date.now(),
        supplierId,
        invoiceNo: invNo,
        transactionType: 'PAYMENT_MADE',
        debit: amount,
        credit: 0,
        balance: supp.outstandingPayable,
        paymentMode: mode,
        referenceNo: refNo,
        remarks,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
    }

    persistAll();
    api.addAuditLog(type, 'PURCHASES', String(supplierId), `${type === 'PURCHASE_CREDIT' ? 'Added bill credit' : 'Made payment'} ₹${amount} for ${supp.name}`);
    return supp;
  },

  // Purchase Orders & Inward Bills
  getPurchaseOrders: async (): Promise<PurchaseOrder[]> => [...mockPurchaseOrders],

  createPurchaseOrder: async (poData: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const supp = mockSuppliers.find((s) => s.id === poData.supplierId);
    const poNum = poData.poNumber || `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPO: PurchaseOrder = {
      id: Date.now(),
      poNumber: poNum,
      supplierId: poData.supplierId || (supp ? supp.id : 1),
      supplierName: supp ? supp.name : (poData.supplierName || 'Textile Supplier'),
      orderDate: poData.orderDate || new Date().toISOString().slice(0, 10),
      expectedDate: poData.expectedDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: poData.status || 'ORDERED',
      subtotal: poData.subtotal || 0,
      taxAmount: poData.taxAmount || 0,
      grandTotal: poData.grandTotal || 0,
      notes: poData.notes || '',
      items: (poData.items || []).map((it, idx) => ({
        id: idx + 1,
        variantId: it.variantId,
        articleName: it.articleName,
        sku: it.sku,
        color: it.color,
        size: it.size,
        orderedQty: it.orderedQty || 1,
        receivedQty: it.receivedQty || 0,
        unitCost: it.unitCost || 0,
        taxRate: it.taxRate || 5,
        totalAmount: it.totalAmount || 0,
      })),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    mockPurchaseOrders.unshift(newPO);
    persistAll();
    api.addAuditLog('PO_CREATED', 'PURCHASES', newPO.poNumber, `Created PO for ${newPO.supplierName} total ₹${newPO.grandTotal}`);
    return newPO;
  },

  updatePurchaseOrderStatus: async (id: number, status: PurchaseOrder['status']): Promise<void> => {
    const po = mockPurchaseOrders.find((p) => p.id === id);
    if (po) {
      po.status = status;
      persistAll();
      api.addAuditLog('PO_STATUS_UPDATED', 'PURCHASES', po.poNumber, `PO status changed to ${status}`);
    }
  },

  createSupplierBillWithItems: async (billData: Partial<SupplierBill>): Promise<SupplierBill> => {
    const supp = mockSuppliers.find((s) => s.id === billData.supplierId);
    const invoiceNum = billData.supplierInvoiceNo || `BILL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBill: SupplierBill = {
      id: Date.now(),
      supplierId: billData.supplierId || (supp ? supp.id : 1),
      supplierName: supp ? supp.name : (billData.supplierName || 'Textile Supplier'),
      supplierInvoiceNo: invoiceNum,
      purchaseDate: billData.purchaseDate || new Date().toISOString().slice(0, 10),
      dueDate: billData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      poNumber: billData.poNumber,
      grnNumber: billData.grnNumber || `GRN-${Date.now().toString().slice(-5)}`,
      amount: billData.amount || 0,
      taxableAmount: billData.taxableAmount || 0,
      gstAmount: billData.gstAmount || 0,
      discount: billData.discount || 0,
      paidAmount: billData.paidAmount || 0,
      outstandingAmount: Math.max(0, (billData.amount || 0) - (billData.paidAmount || 0)),
      paymentStatus: (billData.paidAmount || 0) >= (billData.amount || 0) ? 'PAID' : (billData.paidAmount || 0) > 0 ? 'PARTIAL' : 'PENDING',
      notes: billData.notes || '',
      items: billData.items || [],
    };

    // Increment variant stock & update prices
    if (newBill.items && newBill.items.length > 0) {
      newBill.items.forEach((item) => {
        mockProducts.forEach((p) => {
          const variant = p.variants.find((v) => v.id === item.variantId || v.sku === item.sku || v.barcode === item.sku);
          if (variant) {
            variant.stock += item.quantity;
            variant.lastReceivedAt = new Date().toISOString();
            if (item.costPrice > 0) variant.costPrice = item.costPrice;
            if (item.sellingPrice > 0) variant.sellingPrice = item.sellingPrice;
          }
        });
      });
    }

    mockSupplierBills.unshift(newBill);

    if (supp) {
      supp.outstandingPayable += newBill.outstandingAmount;
      mockSupplierLedger.unshift({
        id: Date.now(),
        supplierId: supp.id,
        invoiceNo: newBill.supplierInvoiceNo,
        transactionType: 'PURCHASE_CREDIT',
        debit: 0,
        credit: newBill.amount,
        balance: supp.outstandingPayable,
        referenceNo: newBill.grnNumber,
        remarks: `Inward Purchase Bill #${newBill.supplierInvoiceNo} (${(newBill.items || []).length} items)`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });

      if (newBill.paidAmount > 0) {
        mockSupplierLedger.unshift({
          id: Date.now() + 1,
          supplierId: supp.id,
          invoiceNo: newBill.supplierInvoiceNo,
          transactionType: 'PAYMENT_MADE',
          debit: newBill.paidAmount,
          credit: 0,
          balance: supp.outstandingPayable,
          remarks: `Initial payment for Purchase Bill #${newBill.supplierInvoiceNo}`,
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
      }
    }

    if (newBill.poNumber) {
      const linkedPO = mockPurchaseOrders.find((p) => p.poNumber === newBill.poNumber);
      if (linkedPO) linkedPO.status = 'RECEIVED';
    }

    persistAll();
    api.addAuditLog('PURCHASE_BILL_CREATED', 'INVENTORY', newBill.supplierInvoiceNo, `Inward purchase bill created. Total ₹${newBill.amount}`);
    return newBill;
  },

  // Salesman Commission Summary
  getSalesmanCommissionSummary: async () => {
    const summaryMap: Record<string, { totalSales: number; totalInvoices: number; commission: number }> = {};

    mockInvoices.forEach((inv) => {
      const salesman = inv.salesmanName || 'Direct Store Counter';
      if (!summaryMap[salesman]) {
        summaryMap[salesman] = { totalSales: 0, totalInvoices: 0, commission: 0 };
      }
      summaryMap[salesman].totalSales += inv.grandTotal;
      summaryMap[salesman].totalInvoices += 1;
      summaryMap[salesman].commission += inv.commissionAmount || Math.round(inv.grandTotal * 0.02);
    });

    return Object.entries(summaryMap).map(([name, data]) => ({
      salesmanName: name,
      ...data,
    }));
  },

  // Cash Shifts
  getCurrentCashShift: async (): Promise<CashShift> => ({ ...mockCashShift }),
  reconcileCashShift: async (actualCash: number, notes: string): Promise<CashShift> => {
    mockCashShift.actualCash = actualCash;
    mockCashShift.difference = actualCash - mockCashShift.expectedCash;
    mockCashShift.closingNotes = notes;
    mockCashShift.status = 'CLOSED';
    persistAll();
    return { ...mockCashShift };
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => [...mockExpenses],
  addExpense: async (expense: Partial<Expense>): Promise<Expense> => {
    const newExp: Expense = {
      id: Date.now(),
      category: expense.category || 'Miscellaneous',
      amount: expense.amount || 0,
      paymentMode: expense.paymentMode || 'CASH',
      expenseDate: expense.expenseDate || new Date().toISOString().slice(0, 10),
      description: expense.description || '',
      receiptUrl: expense.receiptUrl,
      createdBy: 'Rajesh Sharma',
    };
    mockExpenses.unshift(newExp);
    if (newExp.paymentMode === 'CASH') {
      mockCashShift.cashExpenses += newExp.amount;
      mockCashShift.expectedCash -= newExp.amount;
      mockCashShift.actualCash -= newExp.amount;
    }
    persistAll();
    api.addAuditLog('EXPENSE_RECORDED', 'ACCOUNTING', String(newExp.id), `Recorded ${newExp.category} expense: ₹${newExp.amount}`);
    return newExp;
  },

  // Alterations
  getAlterations: async (): Promise<Alteration[]> => [...mockAlterations],
  addAlteration: async (alt: Partial<Alteration>): Promise<Alteration> => {
    const newAlt: Alteration = {
      id: Date.now(),
      orderNumber: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
      customerId: alt.customerId,
      customerName: alt.customerName || 'Customer',
      customerPhone: alt.customerPhone || '',
      invoiceNumber: alt.invoiceNumber,
      garmentItem: alt.garmentItem || 'Garment Item',
      measurements: alt.measurements || '',
      tailorName: alt.tailorName || 'Master Rafiq',
      tailorNotes: alt.tailorNotes,
      dueDate: alt.dueDate || new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      alterationCharge: alt.alterationCharge || 0,
      status: 'PENDING',
      notifyCustomerOnReady: alt.notifyCustomerOnReady ?? true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    mockAlterations.unshift(newAlt);
    persistAll();
    api.addAuditLog('ALTERATION_CREATED', 'ALTERATIONS', newAlt.orderNumber, `Created alteration order for ${newAlt.customerName}`);
    return newAlt;
  },
  updateAlterationStatus: async (id: number, status: Alteration['status']) => {
    const target = mockAlterations.find((a) => a.id === id);
    if (target) {
      target.status = status;
      persistAll();
      api.addAuditLog('ALTERATION_STATUS_CHANGE', 'ALTERATIONS', target.orderNumber, `Updated status to ${status}`);
    }
    return target;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => [...mockAuditLogs],
  addAuditLog: (action: string, module: string, recordId: string, reason: string, authMethod: string = 'USER_LOGIN', oldValue?: string, newValue?: string) => {
    mockAuditLogs.unshift({
      id: Date.now(),
      username: 'admin',
      role: 'OWNER',
      action,
      module,
      recordId,
      oldValue,
      newValue,
      reason,
      authMethod,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    saveStorage('audit_logs', mockAuditLogs);
  },

  // Dashboard Aggregates
  getDashboardMetrics: async () => {
    const todayRevenue = mockInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const todayProfit = Math.round(todayRevenue * 0.38);
    const totalInvoices = mockInvoices.length;
    const itemsSold = mockInvoices.reduce((sum, i) => sum + i.items.reduce((s, it) => s + it.quantity, 0), 0);
    const avgInvoiceValue = totalInvoices > 0 ? Math.round(todayRevenue / totalInvoices) : 0;
    const customerOutstanding = mockCustomers.reduce((sum, c) => sum + c.outstandingBalance, 0);
    const supplierPayables = mockSuppliers.reduce((sum, s) => sum + s.outstandingPayable, 0);
    const allVariants = mockProducts.flatMap((p) => p.variants);
    const stockValue = allVariants.reduce((sum, v) => sum + v.stock * v.sellingPrice, 0);
    const lowStockItems = allVariants.filter((v) => v.stock <= v.reorderLevel).length;
    const pendingAlterations = mockAlterations.filter((a) => a.status !== 'DELIVERED').length;

    // Garment Department / Segment Revenue Distribution
    const deptTotals: Record<string, { revenue: number; items: number }> = {
      'Formal & Casual Menswear': { revenue: 0, items: 0 },
      'Womenswear & Pure Silk Sarees': { revenue: 0, items: 0 },
      'Kids & Teen Festive Wear': { revenue: 0, items: 0 },
      'Suiting & Shirting Fabrics': { revenue: 0, items: 0 },
      'Tailoring & Custom Stitching': { revenue: 0, items: 0 },
    };

    mockInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const name = (item.articleName || '').toLowerCase();
        const amt = item.totalAmount || (item.unitPrice * item.quantity);
        const qty = item.quantity || 1;

        if (name.includes('saree') || name.includes('paithani') || name.includes('kurti') || name.includes('silk') || name.includes('dress') || name.includes('dupatta')) {
          deptTotals['Womenswear & Pure Silk Sarees'].revenue += amt;
          deptTotals['Womenswear & Pure Silk Sarees'].items += qty;
        } else if (name.includes('kid') || name.includes('frock') || name.includes('baba') || name.includes('boy') || name.includes('girl')) {
          deptTotals['Kids & Teen Festive Wear'].revenue += amt;
          deptTotals['Kids & Teen Festive Wear'].items += qty;
        } else if (item.unitType === 'METER' || name.includes('fabric') || name.includes('shirting') || name.includes('suiting') || name.includes('raymond')) {
          deptTotals['Suiting & Shirting Fabrics'].revenue += amt;
          deptTotals['Suiting & Shirting Fabrics'].items += qty;
        } else if (name.includes('alteration') || name.includes('stitch') || name.includes('tailor') || name.includes('fitting')) {
          deptTotals['Tailoring & Custom Stitching'].revenue += amt;
          deptTotals['Tailoring & Custom Stitching'].items += qty;
        } else {
          deptTotals['Formal & Casual Menswear'].revenue += amt;
          deptTotals['Formal & Casual Menswear'].items += qty;
        }
      });
    });

    const totalCalcRevenue = Object.values(deptTotals).reduce((sum, d) => sum + d.revenue, 0);
    const baseRevenue = totalCalcRevenue > 0 ? totalCalcRevenue : (todayRevenue || 124580);

    const revenueBySegment = [
      {
        name: 'Formal & Casual Menswear',
        department: 'Menswear & Denims',
        value: totalCalcRevenue > 0 ? Math.max(1, Math.round((deptTotals['Formal & Casual Menswear'].revenue / totalCalcRevenue) * 100)) : 42,
        revenueAmount: totalCalcRevenue > 0 ? Math.round(deptTotals['Formal & Casual Menswear'].revenue) : Math.round(baseRevenue * 0.42),
        itemsSold: deptTotals['Formal & Casual Menswear'].items || 48,
        growth: '+24%',
        margin: '42%',
        status: 'High Growth',
        color: '#2563EB',
      },
      {
        name: 'Womenswear & Silk Sarees',
        department: 'Ethnic & Sarees',
        value: totalCalcRevenue > 0 ? Math.max(1, Math.round((deptTotals['Womenswear & Pure Silk Sarees'].revenue / totalCalcRevenue) * 100)) : 28,
        revenueAmount: totalCalcRevenue > 0 ? Math.round(deptTotals['Womenswear & Pure Silk Sarees'].revenue) : Math.round(baseRevenue * 0.28),
        itemsSold: deptTotals['Womenswear & Pure Silk Sarees'].items || 32,
        growth: '+18%',
        margin: '48%',
        status: 'High Margin',
        color: '#10B981',
      },
      {
        name: 'Kids & Teen Festive Wear',
        department: 'Kids & Children',
        value: totalCalcRevenue > 0 ? Math.max(1, Math.round((deptTotals['Kids & Teen Festive Wear'].revenue / totalCalcRevenue) * 100)) : 15,
        revenueAmount: totalCalcRevenue > 0 ? Math.round(deptTotals['Kids & Teen Festive Wear'].revenue) : Math.round(baseRevenue * 0.15),
        itemsSold: deptTotals['Kids & Teen Festive Wear'].items || 24,
        growth: '+12%',
        margin: '38%',
        status: 'Stable',
        color: '#F59E0B',
      },
      {
        name: 'Suiting & Shirting Fabrics',
        department: 'Cut-Piece / Meter Fabrics',
        value: totalCalcRevenue > 0 ? Math.max(1, Math.round((deptTotals['Suiting & Shirting Fabrics'].revenue / totalCalcRevenue) * 100)) : 10,
        revenueAmount: totalCalcRevenue > 0 ? Math.round(deptTotals['Suiting & Shirting Fabrics'].revenue) : Math.round(baseRevenue * 0.10),
        itemsSold: deptTotals['Suiting & Shirting Fabrics'].items || 18,
        growth: '+15%',
        margin: '35%',
        status: 'Popular',
        color: '#8B5CF6',
      },
      {
        name: 'Tailoring & Stitching',
        department: 'Bespoke Tailoring',
        value: totalCalcRevenue > 0 ? Math.max(1, Math.round((deptTotals['Tailoring & Custom Stitching'].revenue / totalCalcRevenue) * 100)) : 5,
        revenueAmount: totalCalcRevenue > 0 ? Math.round(deptTotals['Tailoring & Custom Stitching'].revenue) : Math.round(baseRevenue * 0.05),
        itemsSold: deptTotals['Tailoring & Custom Stitching'].items || 12,
        growth: '+9%',
        margin: '62%',
        status: 'Consistent',
        color: '#EC4899',
      },
    ];

    return {
      todayRevenue,
      todayProfit,
      totalInvoices,
      itemsSold,
      avgInvoiceValue,
      customerOutstanding,
      supplierPayables,
      stockValue,
      lowStockItems,
      pendingAlterations,
      revenueBySegment,
    };
  },
};
