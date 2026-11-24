export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'ACCOUNTANT' | 'TAILOR' | 'INVENTORY_MANAGER';

export interface User {
  id: number;
  username: string;
  fullName: string;
  mobile: string;
  email: string;
  role: UserRole;
  branchId: number;
  branchName: string;
  active: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  articleName: string;
  brand: string;
  category: string;
  sku: string;
  barcode: string;
  color: string;
  size: string;
  costPrice: number;
  mrp: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
  unitType?: 'PCS' | 'METER';
  hsnCode?: string;
  lastSoldAt?: string;
  lastReceivedAt?: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  articleName: string;
  brand: string;
  category: string;
  hsnCode: string;
  fabricType: string;
  careInstructions: string;
  description: string;
  imageUrl?: string;
  supplierId?: number;
  reorderLevel: number;
  variants: ProductVariant[];
}

export interface CartItem {
  variantId: number;
  articleName: string;
  brand: string;
  sku: string;
  barcode: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  discountType: 'FLAT' | 'PERCENT';
  taxRate: number;
  total: number;
  unitType?: 'PCS' | 'METER';
  hsnCode?: string;
  cgst?: number;
  sgst?: number;
  igst?: number;
  salesmanName?: string;
  isReturn?: boolean;
}

export interface HeldBill {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  heldAt: string;
  notes?: string;
}

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CHEQUE' | 'BANK_TRANSFER' | 'CREDIT' | 'SPLIT';

export interface SplitPayment {
  cash: number;
  upi: number;
  card: number;
  credit: number;
  cheque: number;
  bankTransfer: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceType: 'RETAIL' | 'TAX' | 'PROFORMA' | 'CREDIT_NOTE' | 'RETURN';
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  subtotal: number;
  itemDiscountTotal: number;
  billDiscount: number;
  discountType: 'FLAT' | 'PERCENT';
  taxAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  isInterState?: boolean;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMode: PaymentMode;
  splitDetails?: SplitPayment;
  status: 'COMPLETED' | 'PAID' | 'PARTIAL' | 'CREDIT' | 'CANCELLED' | 'RETURNED' | 'EDITED';
  cashierName: string;
  cashierId?: number;
  salesmanId?: number;
  salesmanName?: string;
  commissionAmount?: number;
  returnRefInvoiceNumber?: string;
  creditNoteIssued?: number;
  creditNoteRedeemed?: number;
  branchName: string;
  createdAt: string;
  items: {
    id: number;
    variantId?: number;
    articleName: string;
    sku: string;
    barcode: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalAmount: number;
    unitType?: 'PCS' | 'METER';
    hsnCode?: string;
    taxRate?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    salesmanName?: string;
    isReturn?: boolean;
  }[];
}

export interface StoreCreditNote {
  id: number;
  noteNumber: string;
  invoiceNumber: string;
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  amount: number;
  balance: number;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

export interface SystemSettingsConfig {
  blockNegativeStock: boolean;
  defaultGstRate: number;
  cgstRate: number;
  sgstRate: number;
  storeStateCode: string; // e.g. "27"
  autoThermalPrint: boolean;
  thermalPrinterName?: string;
  silentPrinting?: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerGroup?: string;
  creditLimit: number;
  outstandingBalance: number;
  loyaltyPoints: number;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerLedgerEntry {
  id: number;
  customerId: number;
  invoiceNo?: string;
  transactionType: 'SALE' | 'PAYMENT' | 'PAYMENT_RECEIVED' | 'PAYMENT_GIVEN' | 'RETURN' | 'ADVANCE' | 'REFUND';
  debit: number;
  credit: number;
  balance: number;
  paymentMode?: string;
  referenceNo?: string;
  remarks?: string;
  createdAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  contactPerson?: string;
  address?: string;
  paymentTerms?: string;
  outstandingPayable: number;
  active: boolean;
  createdAt: string;
}

export interface SupplierLedgerEntry {
  id: number;
  supplierId: number;
  invoiceNo?: string;
  transactionType: 'PURCHASE_CREDIT' | 'PAYMENT_MADE' | 'RETURN' | 'ADJUSTMENT';
  debit: number; // decreases payable
  credit: number; // increases payable
  balance: number;
  paymentMode?: string;
  referenceNo?: string;
  remarks?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  variantId?: number;
  articleName: string;
  sku?: string;
  color?: string;
  size?: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number; // in ₹
  taxRate: number; // %
  totalAmount: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDate?: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface SupplierBillItem {
  id: number;
  variantId?: number;
  articleName: string;
  sku?: string;
  color?: string;
  size?: string;
  quantity: number;
  costPrice: number; // in ₹
  sellingPrice: number; // in ₹
  taxRate: number;
  totalAmount: number;
}

export interface SupplierBill {
  id: number;
  supplierId: number;
  supplierName: string;
  supplierInvoiceNo: string;
  purchaseDate: string;
  dueDate: string;
  poNumber?: string;
  grnNumber?: string;
  amount: number;
  taxableAmount: number;
  gstAmount: number;
  discount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID';
  attachmentUrl?: string;
  notes?: string;
  items?: SupplierBillItem[];
}

export interface CashShift {
  id: number;
  cashierId: number;
  cashierName: string;
  branchName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  cashSales: number;
  cashReceived: number;
  cashRefunds: number;
  cashExpenses: number;
  cashWithdrawals: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  status: 'OPEN' | 'CLOSED';
  closingNotes?: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  paymentMode: string;
  expenseDate: string;
  description: string;
  receiptUrl?: string;
  createdBy: string;
}

export interface Alteration {
  id: number;
  orderNumber: string;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  invoiceNumber?: string;
  garmentItem: string;
  measurements: string;
  tailorName: string;
  tailorNotes?: string;
  dueDate: string;
  alterationCharge: number;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
  notifyCustomerOnReady: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  username: string;
  role: string;
  action: string;
  module: string;
  recordId?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  authMethod: string;
  timestamp: string;
}

export interface ShortcutConfig {
  id: string;
  action: string;
  label: string;
  keyCombo: string;
  description: string;
  category: 'POS' | 'GLOBAL' | 'NAVIGATION';
}
