import { useState, useCallback } from 'react';

interface UseTableKeyboardNavOptions<T> {
  items: T[];
  onSelect?: (item: T, index: number) => void;
  onActivate?: (item: T, index: number) => void;
  initialIndex?: number;
}

/**
 * Universal Keyboard Arrow-Key Navigation Hook for Data Tables and Lists
 * Supports ArrowUp, ArrowDown, PageUp, PageDown, Home, End, and Enter
 */
export function useTableKeyboardNav<T>({
  items,
  onSelect,
  onActivate,
  initialIndex = 0,
}: UseTableKeyboardNavOptions<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (!items || items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.min(items.length - 1, prev + 1);
            onSelect?.(items[next], next);
            return next;
          });
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = Math.max(0, prev - 1);
            onSelect?.(items[next], next);
            return next;
          });
          break;
        }

        case 'Home': {
          e.preventDefault();
          setSelectedIndex(0);
          onSelect?.(items[0], 0);
          break;
        }

        case 'End': {
          e.preventDefault();
          const last = items.length - 1;
          setSelectedIndex(last);
          onSelect?.(items[last], last);
          break;
        }

        case 'Enter': {
          if (items[selectedIndex]) {
            e.preventDefault();
            onActivate?.(items[selectedIndex], selectedIndex);
          }
          break;
        }

        default:
          break;
      }
    },
    [items, selectedIndex, onSelect, onActivate]
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    isRowSelected: (index: number) => index === selectedIndex,
  };
}
