import { create } from 'zustand';
import { ShortcutConfig } from '../types';

interface ShortcutState {
  shortcuts: ShortcutConfig[];
  updateShortcut: (id: string, newKeyCombo: string) => void;
  resetDefaults: () => void;
  getCombo: (id: string) => string;
}

export const defaultShortcuts: ShortcutConfig[] = [
  { id: 'new_sale', action: 'NEW_SALE', label: 'New Sale', keyCombo: 'F2', description: 'Clear active cart and start new transaction', category: 'POS' },
  { id: 'search_product', action: 'SEARCH_PRODUCT', label: 'Product Search', keyCombo: 'F3', description: 'Focus product & barcode search box', category: 'POS' },
  { id: 'exchange_mode', action: 'EXCHANGE_MODE', label: 'Exchange / Return', keyCombo: 'F4', description: 'Lookup past invoice for garment exchange & credit notes', category: 'POS' },
  { id: 'cash_payment', action: 'CASH_PAYMENT', label: 'Cash Payment', keyCombo: 'F5', description: 'Open Cash payment tender modal', category: 'POS' },
  { id: 'digital_payment', action: 'DIGITAL_PAYMENT', label: 'Card / UPI Payment', keyCombo: 'F6', description: 'Open UPI / Card settlement modal', category: 'POS' },
  { id: 'split_payment', action: 'SPLIT_PAYMENT', label: 'Split Bill', keyCombo: 'F8', description: 'Open multi-tender split payment modal', category: 'POS' },
  { id: 'hold_bill', action: 'HOLD_BILL', label: 'Hold Bill', keyCombo: 'F10', description: 'Park current cart in hold queue', category: 'POS' },
  { id: 'clear_cart', action: 'CLEAR_CART', label: 'Clear Cart', keyCombo: 'Escape', description: 'Clear all items or dismiss active dialog', category: 'POS' },
  { id: 'customer_search', action: 'CUSTOMER_SEARCH', label: 'Customer Lookup', keyCombo: 'Alt+C', description: 'Focus customer search / Khata link', category: 'POS' },
  { id: 'apply_bill_discount', action: 'APPLY_DISCOUNT', label: 'Bill Discount', keyCombo: 'Alt+D', description: 'Apply bill level ₹ or % discount', category: 'POS' },
  { id: 'quick_print', action: 'PRINT_INVOICE', label: 'Print Last Invoice', keyCombo: 'Ctrl+P', description: 'Reprint previous receipt on thermal printer', category: 'GLOBAL' },
];

export const useShortcutStore = create<ShortcutState>((set, get) => ({
  shortcuts: defaultShortcuts,
  updateShortcut: (id, newKeyCombo) =>
    set((state) => ({
      shortcuts: state.shortcuts.map((s) => (s.id === id ? { ...s, keyCombo: newKeyCombo } : s)),
    })),
  resetDefaults: () => set({ shortcuts: defaultShortcuts }),
  getCombo: (id) => get().shortcuts.find((s) => s.id === id)?.keyCombo || '',
}));
