import React, { useEffect } from 'react';
import { useShortcutStore } from '../../stores/shortcutStore';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';

interface GlobalShortcutListenerProps {
  onOpenPaymentModal?: (mode: 'CASH' | 'DIGITAL' | 'SPLIT') => void;
  onFocusSearch?: () => void;
  onOpenHoldBills?: () => void;
  onOpenExchange?: () => void;
  onNavigate?: (tab: string) => void;
}

export const GlobalShortcutListener: React.FC<GlobalShortcutListenerProps> = ({
  onOpenPaymentModal,
  onFocusSearch,
  onOpenHoldBills,
  onOpenExchange,
  onNavigate,
}) => {
  const { shortcuts } = useShortcutStore();
  const { clearCart, holdBill, items } = useCartStore();
  const { isAuthenticated, user, hasPermission } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Never intercept shortcuts if user is not authenticated or logged out
      if (!isAuthenticated || !user) return;

      // 2. Check if user is typing in standard textarea/input or if a modal dialog is currently active
      const isInput =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      const isModalOpen = Boolean(document.querySelector('.fixed.inset-0'));

      // If a modal is open, avoid hijacking function keys or payments
      if (isModalOpen && e.key !== 'Escape') {
        return;
      }

      // Find matching shortcut
      const keyStr = e.key;
      const isCtrl = e.ctrlKey;
      const isAlt = e.altKey;

      const matched = shortcuts.find((s) => {
        if (s.keyCombo === 'Escape' && keyStr === 'Escape') return true;
        if (s.keyCombo === 'F2' && keyStr === 'F2') return true;
        if (s.keyCombo === 'F3' && keyStr === 'F3') return true;
        if (s.keyCombo === 'F4' && keyStr === 'F4') return true;
        if (s.keyCombo === 'F5' && keyStr === 'F5') return true;
        if (s.keyCombo === 'F6' && keyStr === 'F6') return true;
        if (s.keyCombo === 'F8' && keyStr === 'F8') return true;
        if (s.keyCombo === 'F10' && keyStr === 'F10') return true;
        if (s.keyCombo === 'Alt+C' && isAlt && keyStr.toLowerCase() === 'c') return true;
        if (s.keyCombo === 'Alt+D' && isAlt && keyStr.toLowerCase() === 'd') return true;
        if (s.keyCombo === 'Ctrl+P' && isCtrl && keyStr.toLowerCase() === 'p') return true;
        return false;
      });

      if (!matched) return;

      // 3. RBAC Enforcement on POS actions
      const isPosAction = [
        'NEW_SALE',
        'SEARCH_PRODUCT',
        'EXCHANGE_MODE',
        'CASH_PAYMENT',
        'DIGITAL_PAYMENT',
        'SPLIT_PAYMENT',
        'HOLD_BILL',
        'CLEAR_CART',
      ].includes(matched.action);

      if (isPosAction && !hasPermission('pos')) {
        return; // Deny POS shortcuts for unauthorized roles (e.g. Tailor, Accountant)
      }

      // 4. Execute Action safely
      switch (matched.action) {
        case 'NEW_SALE':
          e.preventDefault();
          clearCart();
          onNavigate?.('pos');
          break;

        case 'SEARCH_PRODUCT':
          e.preventDefault();
          onNavigate?.('pos');
          onFocusSearch?.();
          break;

        case 'EXCHANGE_MODE':
          e.preventDefault();
          onNavigate?.('pos');
          onOpenExchange?.();
          break;

        case 'CASH_PAYMENT':
          e.preventDefault();
          if (items.length > 0) onOpenPaymentModal?.('CASH');
          break;

        case 'DIGITAL_PAYMENT':
          e.preventDefault();
          if (items.length > 0) onOpenPaymentModal?.('DIGITAL');
          break;

        case 'SPLIT_PAYMENT':
          e.preventDefault();
          if (items.length > 0) onOpenPaymentModal?.('SPLIT');
          break;

        case 'HOLD_BILL':
          e.preventDefault();
          if (items.length > 0) {
            holdBill();
          } else {
            onOpenHoldBills?.();
          }
          break;

        case 'CLEAR_CART':
          if (!isInput) {
            e.preventDefault();
            clearCart();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    shortcuts,
    items,
    clearCart,
    holdBill,
    isAuthenticated,
    user,
    hasPermission,
    onOpenPaymentModal,
    onFocusSearch,
    onOpenExchange,
    onOpenHoldBills,
    onNavigate,
  ]);

  return null;
};
