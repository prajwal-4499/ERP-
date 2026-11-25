import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocusSelector?: string;
}

/**
 * Universal Focus Trapping & Auto-Focus Restoration Hook for Modals
 * - Traps Tab & Shift+Tab within modal bounds
 * - Listens for Escape key to close modal
 * - Automatically returns cursor focus to returnFocusRef or returnFocusSelector upon close
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  optionsOrIsOpen: UseFocusTrapOptions | boolean,
  onCloseParam?: () => void
) {
  const options: UseFocusTrapOptions =
    typeof optionsOrIsOpen === 'boolean'
      ? { isOpen: optionsOrIsOpen, onClose: onCloseParam }
      : optionsOrIsOpen;

  const {
    isOpen,
    onClose,
    returnFocusRef,
    returnFocusSelector = '#pos-barcode-search',
  } = options;

  const containerRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Remember previously focused element
    if (document.activeElement instanceof HTMLElement) {
      previouslyFocusedElement.current = document.activeElement;
    }

    const container = containerRef.current;
    if (!container) return;

    // Focus first focusable element inside modal
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => el.offsetParent !== null); // only visible elements

    if (focusables.length > 0) {
      // Find element with autoFocus if present, else first element
      const autoFocusEl = focusables.find((el) => el.hasAttribute('autofocus')) || focusables[0];
      autoFocusEl.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const visibleFocusables = Array.from(
          container.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter((el) => el.offsetParent !== null);

        if (visibleFocusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = visibleFocusables[0];
        const last = visibleFocusables[visibleFocusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !container.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);

      // Return focus to target element
      setTimeout(() => {
        if (returnFocusRef?.current) {
          returnFocusRef.current.focus();
        } else if (returnFocusSelector) {
          const el = document.querySelector<HTMLElement>(returnFocusSelector);
          if (el) el.focus();
          else if (previouslyFocusedElement.current) {
            previouslyFocusedElement.current.focus();
          }
        } else if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      }, 50);
    };
  }, [isOpen, onClose, returnFocusRef, returnFocusSelector]);

  return containerRef;
}
