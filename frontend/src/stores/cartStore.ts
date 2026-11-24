import { create } from 'zustand';
import { CartItem, Customer, HeldBill, ProductVariant, StoreCreditNote } from '../types';

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  heldBills: HeldBill[];
  billDiscount: number;
  discountType: 'FLAT' | 'PERCENT';
  notes: string;
  salesmanName: string;
  activeCreditNote: StoreCreditNote | null;
  creditNoteRedeemed: number;
  blockNegativeStock: boolean;
  storeStateCode: string; // Default: '27' (Maharashtra)

  // Actions
  addItem: (
    variant: ProductVariant,
    qty?: number,
    isReturnOrUnit?: boolean | 'PCS' | 'METER',
    isReturnOrSalesman?: boolean | string,
    salesman?: string
  ) => { success: boolean; error?: string };
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, qty: number) => { success: boolean; error?: string };
  updateItemDiscount: (variantId: number, discount: number, type: 'FLAT' | 'PERCENT') => void;
  updateItemSalesman: (variantId: number, salesman: string) => void;
  setBillDiscount: (discount: number, type: 'FLAT' | 'PERCENT') => void;
  setCustomer: (customer: Customer | null) => void;
  setSalesmanName: (salesman: string) => void;
  setNotes: (notes: string) => void;
  setBlockNegativeStock: (block: boolean) => void;
  applyCreditNote: (creditNote: StoreCreditNote | null) => void;
  holdBill: () => boolean;
  resumeBill: (heldBillId: string) => void;
  removeHeldBill: (heldBillId: string) => void;
  clearCart: () => void;
  getTotals: () => {
    subtotal: number;
    itemDiscountTotal: number;
    billDiscountAmount: number;
    taxableAmount: number;
    taxAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    isInterState: boolean;
    returnTotal: number;
    creditNoteRedeemed: number;
    grandTotal: number;
    totalItems: number;
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  heldBills: [],
  billDiscount: 0,
  discountType: 'FLAT',
  notes: '',
  salesmanName: '',
  activeCreditNote: null,
  creditNoteRedeemed: 0,
  blockNegativeStock: false,
  storeStateCode: '27',

  setBlockNegativeStock: (block) => set({ blockNegativeStock: block }),

  addItem: (variant, qty = 1, param3, param4, param5) => {
    const { blockNegativeStock, items } = get();

    let effectiveUnitType: 'PCS' | 'METER' = variant.unitType || 'PCS';
    let isReturn = false;
    let salesman: string | undefined = undefined;

    if (typeof param3 === 'boolean') {
      isReturn = param3;
      salesman = typeof param4 === 'string' ? param4 : undefined;
    } else if (param3 === 'PCS' || param3 === 'METER') {
      effectiveUnitType = param3;
      if (typeof param4 === 'boolean') {
        isReturn = param4;
        salesman = typeof param5 === 'string' ? param5 : undefined;
      } else if (typeof param4 === 'string') {
        salesman = param4;
      }
    } else if (typeof param4 === 'string') {
      salesman = param4;
    }

    // Guardrail: Block negative stock if setting is active and not a return item
    if (blockNegativeStock && !isReturn) {
      const existingInCart = items.find((i) => i.variantId === variant.id && !i.isReturn);
      const requestedQty = (existingInCart ? existingInCart.quantity : 0) + qty;
      if (variant.stock < requestedQty) {
        return {
          success: false,
          error: `Insufficient stock for ${variant.articleName}. In stock: ${variant.stock}, requested: ${requestedQty}`,
        };
      }
    }

    const current = get().items;
    const existingIndex = current.findIndex((i) => i.variantId === variant.id && i.isReturn === isReturn);

    if (existingIndex > -1) {
      const updated = [...current];
      const item = updated[existingIndex];
      const newQty = item.quantity + qty;
      const basePrice = item.unitPrice * newQty;
      const discountVal =
        item.discountType === 'PERCENT'
          ? (basePrice * item.discount) / 100
          : item.discount * newQty;
      item.quantity = Number(newQty.toFixed(2));
      item.total = Math.max(0, basePrice - discountVal);
      if (salesman) item.salesmanName = salesman;
      set({ items: updated });
    } else {
      const basePrice = variant.sellingPrice * qty;
      // Dynamic Indian Apparel GST Slab: < 1000 => 5%, >= 1000 => 12%
      const effectiveRate = variant.sellingPrice < 1000 ? 5.0 : 12.0;

      const newItem: CartItem = {
        variantId: variant.id,
        articleName: variant.articleName,
        brand: variant.brand,
        sku: variant.sku,
        barcode: variant.barcode,
        color: variant.color,
        size: variant.size,
        unitPrice: variant.sellingPrice,
        quantity: Number(qty.toFixed(2)),
        discount: 0,
        discountType: 'FLAT',
        taxRate: effectiveRate,
        total: basePrice,
        unitType: effectiveUnitType,
        hsnCode: variant.hsnCode || '6205',
        salesmanName: salesman || get().salesmanName || '',
        isReturn,
      };
      set({ items: [newItem, ...current] });
    }
    return { success: true };
  },

  removeItem: (variantId) => {
    set({ items: get().items.filter((i) => i.variantId !== variantId) });
  },

  updateQuantity: (variantId, qty) => {
    if (qty <= 0) {
      get().removeItem(variantId);
      return { success: true };
    }
    const { blockNegativeStock, items } = get();
    const item = items.find((i) => i.variantId === variantId);
    if (!item) return { success: false, error: 'Item not found in cart' };

    // Stock check
    if (blockNegativeStock && !item.isReturn) {
      // Look up variant stock if stored
      const maxAllowed = 9999;
      if (qty > maxAllowed) {
        return { success: false, error: 'Exceeded maximum allowable quantity' };
      }
    }

    const updated = items.map((it) => {
      if (it.variantId === variantId) {
        const cleanQty = Number(qty.toFixed(2));
        const basePrice = it.unitPrice * cleanQty;
        const discountVal =
          it.discountType === 'PERCENT'
            ? (basePrice * it.discount) / 100
            : it.discount * cleanQty;
        return {
          ...it,
          quantity: cleanQty,
          total: Math.max(0, basePrice - discountVal),
        };
      }
      return it;
    });
    set({ items: updated });
    return { success: true };
  },

  updateItemDiscount: (variantId, discount, type) => {
    const updated = get().items.map((item) => {
      if (item.variantId === variantId) {
        const basePrice = item.unitPrice * item.quantity;
        const discountVal =
          type === 'PERCENT'
            ? (basePrice * discount) / 100
            : discount * item.quantity;
        return {
          ...item,
          discount,
          discountType: type,
          total: Math.max(0, basePrice - discountVal),
        };
      }
      return item;
    });
    set({ items: updated });
  },

  updateItemSalesman: (variantId, salesman) => {
    const updated = get().items.map((item) =>
      item.variantId === variantId ? { ...item, salesmanName: salesman } : item
    );
    set({ items: updated });
  },

  setBillDiscount: (discount, type) => set({ billDiscount: discount, discountType: type }),

  setCustomer: (customer) => set({ customer }),
  setSalesmanName: (salesman) => set({ salesmanName: salesman }),
  setNotes: (notes) => set({ notes }),

  applyCreditNote: (creditNote) => {
    set({
      activeCreditNote: creditNote,
      creditNoteRedeemed: creditNote ? creditNote.balance : 0,
    });
  },

  holdBill: () => {
    const { items, customer, notes, heldBills } = get();
    if (items.length === 0) return false;

    const newHeld: HeldBill = {
      id: 'HELD-' + Date.now().toString().slice(-6),
      customerName: customer ? customer.name : 'Walk-in Customer',
      customerPhone: customer?.phone,
      items: [...items],
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes,
    };

    set({
      heldBills: [newHeld, ...heldBills],
      items: [],
      customer: null,
      billDiscount: 0,
      notes: '',
      salesmanName: '',
      activeCreditNote: null,
      creditNoteRedeemed: 0,
    });
    return true;
  },

  resumeBill: (heldBillId) => {
    const target = get().heldBills.find((b) => b.id === heldBillId);
    if (!target) return;
    set({
      items: [...target.items],
      heldBills: get().heldBills.filter((b) => b.id !== heldBillId),
      notes: target.notes || '',
    });
  },

  removeHeldBill: (heldBillId) => {
    set({ heldBills: get().heldBills.filter((b) => b.id !== heldBillId) });
  },

  clearCart: () =>
    set({
      items: [],
      customer: null,
      billDiscount: 0,
      discountType: 'FLAT',
      notes: '',
      salesmanName: '',
      activeCreditNote: null,
      creditNoteRedeemed: 0,
    }),

  getTotals: () => {
    const { items, billDiscount, discountType, customer, storeStateCode, creditNoteRedeemed } = get();
    let subtotal = 0;
    let itemDiscountTotal = 0;
    let totalItems = 0;
    let returnTotal = 0;

    // Check Inter-state GST condition: Customer GSTIN state code vs Store State Code (27 Maharashtra)
    let isInterState = false;
    if (customer && customer.email && customer.email.length === 15) {
      const custStateCode = customer.email.slice(0, 2);
      if (/^\d{2}$/.test(custStateCode) && custStateCode !== storeStateCode) {
        isInterState = true;
      }
    }

    let calculatedTaxTotal = 0;
    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;

    items.forEach((item) => {
      const gross = item.unitPrice * item.quantity;
      const disc =
        item.discountType === 'PERCENT'
          ? (gross * item.discount) / 100
          : item.discount * item.quantity;

      if (item.isReturn) {
        returnTotal += Math.max(0, gross - disc);
      } else {
        subtotal += gross;
        itemDiscountTotal += disc;
        totalItems += item.quantity;

        const lineNet = Math.max(0, gross - disc);
        const perPiecePrice = item.quantity > 0 ? lineNet / item.quantity : lineNet;

        // Dynamic Indian Apparel GST Slab Engine:
        // Below ₹1,000 => 5% GST; ₹1,000 and above => 12% GST
        const slabRate = perPiecePrice < 1000 ? 5.0 : 12.0;
        const lineTax = (lineNet * slabRate) / 100;
        calculatedTaxTotal += lineTax;

        if (isInterState) {
          igstSum += lineTax;
        } else {
          cgstSum += lineTax / 2;
          sgstSum += lineTax / 2;
        }
      }
    });

    const netSales = Math.max(0, subtotal - itemDiscountTotal);
    const billDiscountAmount =
      discountType === 'PERCENT'
        ? (netSales * billDiscount) / 100
        : Math.min(netSales, billDiscount);

    const taxableAmount = Math.max(0, netSales - billDiscountAmount);
    const taxAmount = Number(calculatedTaxTotal.toFixed(2));
    const cgstAmount = Number(cgstSum.toFixed(2));
    const sgstAmount = Number(sgstSum.toFixed(2));
    const igstAmount = Number(igstSum.toFixed(2));

    // Net Payable = (Taxable Amount + Tax) - Returns Offset - Store Credit Redeemed
    const rawGrandTotal = taxableAmount + taxAmount - returnTotal - (creditNoteRedeemed || 0);
    const grandTotal = Math.max(0, Math.round(rawGrandTotal));

    return {
      subtotal,
      itemDiscountTotal,
      billDiscountAmount,
      taxableAmount,
      taxAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      isInterState,
      returnTotal,
      creditNoteRedeemed: creditNoteRedeemed || 0,
      grandTotal,
      totalItems,
    };
  },
}));
