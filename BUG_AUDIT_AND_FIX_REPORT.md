# Cloth Shop ERP & POS Desktop System — Bug Audit & Engineering Report

**Audit Date:** November 25, 2026  
**System:** Cloth Shop ERP & POS Desktop System (`frontend/`, `frontend/electron/`, `backend/`)  
**Store Profile:** Shravani Collection & New SK Telors, Pargaon (Mangrul), Sangli, Maharashtra (GSTIN: `27AABCU9603R1ZM`)  
**Auditor:** Senior Full-Stack & Desktop Electron Architect  

---

## 1. Executive Summary & Audit Matrix

A deep codebase audit was conducted across all subsystems of the POS & ERP suite, covering:
1. **POS & Cart Billing Logic** (`POSPage.tsx`, `cartStore.ts`, `PaymentModal.tsx`, `BillReviewModal.tsx`)
2. **Authentication, Role-Based Access Control (RBAC) & Terminal Switching** (`LoginPage.tsx`, `authStore.ts`, `AppLayout.tsx`, `EmployeesPage.tsx`, `InvoiceEditPinModal.tsx`)
3. **Accounting, Khata Ledgers & Inventory Synchronization** (`api.ts`, `CustomersPage.tsx`, `PurchasesPage.tsx`, `AccountingPage.tsx`, `InventoryPage.tsx`)
4. **Desktop Shell, Thermal Printing, QR Generation & Electron IPC** (`main.cjs`, `preload.cjs`, `billGenerator.ts`, `ThermalReceipt.tsx`, `whatsappShare.ts`)
5. **Keyboard Navigation, Focus Trapping & Accessibility Controls** (`useFocusTrap.ts`, `useTableKeyboardNav.ts`, modals, table views)

### Summary by Severity & Module

| Module / Subsystem | Critical | High | Medium | Low | Total Bugs | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **POS & Cart Engine** | 1 | 2 | 2 | 1 | **6** | **All 6 Resolved** |
| **Authentication & RBAC** | 0 | 1 | 1 | 0 | **2** | **All 2 Resolved** |
| **Accounting & Khata Sync** | 2 | 0 | 1 | 0 | **3** | **All 3 Resolved** |
| **Printing & Electron Shell** | 0 | 3 | 1 | 1 | **5** | **All 5 Resolved** |
| **Total Findings** | **3** | **6** | **5** | **2** | **16** | **100% Resolved (16/16)** |

---

## 2. Detailed Bug Log & Root Cause Analysis

### BUG-001: Fabric Meter (`METER`) Stock Truncation Bug
- **Severity:** `Critical`
- **Module:** POS & Inventory Engine
- **File & Line:** [frontend/src/services/api.ts](file:///d:/ERP%20SYSTEM/frontend/src/services/api.ts#L480-L483)
- **Root Cause Analysis:**  
  When an invoice was finalized in `createInvoice`, stock deduction executed `v.stock = Math.max(0, v.stock - Math.round(item.quantity));`. For cut-piece suiting/shirting fabrics sold in fractional meters (e.g., `1.25` m, `2.40` m, `0.60` m), `Math.round()` forced the quantity to an integer. Selling `1.25` meters deducted only `1.0` meter; selling `0.40` meters deducted `0.0` meters (zero stock reduction). Returns likewise added rounded integer quantities. Over time, inventory valuation and physical stock balance became heavily corrupted.
- **Reproduction Steps:**
  1. Add a cut-piece fabric item (e.g., Raymond Suiting, Unit: `METER`) to the cart.
  2. Set quantity to `1.25` meters.
  3. Complete checkout.
  4. Inspect inventory: stock was decremented by `1` instead of `1.25`.
- **Planned Fix:**  
  Remove `Math.round(item.quantity)`. Implement floating-point stock adjustments preserved to 2 decimal places: `Number((v.stock - item.quantity).toFixed(2))` for sales and `Number((v.stock + item.quantity).toFixed(2))` for returns.
- **Resolution:** `RESOLVED` — Replaced integer truncation with 2-decimal arithmetic in `frontend/src/services/api.ts`. Decimal meters are correctly deducted and restored during returns.

---

### BUG-002: Split Payment Credit Limit Bypass
- **Severity:** `Critical`
- **Module:** Accounting & Khata Sync
- **File & Line:** [frontend/src/services/api.ts](file:///d:/ERP%20SYSTEM/frontend/src/services/api.ts#L363-L367), [frontend/src/components/pos/PaymentModal.tsx](file:///d:/ERP%20SYSTEM/frontend/src/components/pos/PaymentModal.tsx#L125)
- **Root Cause Analysis:**  
  The credit limit validation guardrail inside `createInvoice` only evaluated `if (invoiceData.paymentMode === 'CREDIT' && targetCust)`. When a cashier processed a split payment (`paymentMode === 'SPLIT'`) that included an overdue credit amount (`splitDetails.credit`), this check was completely skipped. A customer with a ₹5,000 credit limit and ₹4,900 existing debt could easily be billed for ₹50,000 credit through split mode without any error.
- **Reproduction Steps:**
  1. Select a customer with an outstanding debt near their credit limit.
  2. In POS checkout, choose **Split (F8)**.
  3. Enter ₹10 Cash and ₹20,000 Credit.
  4. Submit payment: the bill was generated without checking whether `outstandingBalance + splitDetails.credit > creditLimit`.
- **Planned Fix:**  
  Calculate the effective credit liability: `const creditPortion = invoiceData.paymentMode === 'CREDIT' ? (invoiceData.grandTotal || 0) : (invoiceData.splitDetails?.credit || 0);`. Enforce `targetCust.outstandingBalance + creditPortion <= targetCust.creditLimit` whenever `creditPortion > 0`.
- **Resolution:** `RESOLVED` — In `api.ts` and `PaymentModal.tsx`, effective credit is calculated across `CREDIT` and `SPLIT` modes. Checkout is blocked if customer outstanding balance plus split credit exceeds the configured credit limit.

---

### BUG-003: Cash Register Shift Drawer Math Broken for Split Payments & Khata Settlements
- **Severity:** `Critical`
- **Module:** Accounting & Cash Shifts
- **File & Line:** [frontend/src/services/api.ts](file:///d:/ERP%20SYSTEM/frontend/src/services/api.ts#L539-L544), [L629-L646](file:///d:/ERP%20SYSTEM/frontend/src/services/api.ts#L629-L646)
- **Root Cause Analysis:**  
  In `createInvoice`, `mockCashShift.cashSales` and `expectedCash` were updated solely when `newInv.paymentMode === 'CASH'`. In a split payment (e.g., ₹1,000 Cash + ₹2,000 UPI), `splitDetails.cash` was ignored and never added to the drawer. Furthermore, in `addCustomerTransaction`, when a customer paid cash towards their old Khata debt (`mode === 'CASH'`), the cash placed in the till was not recorded into `mockCashShift.cashReceived` and `expectedCash`. Consequently, end-of-day drawer reconciliation produced major phantom shortages.
- **Reproduction Steps:**
  1. Note the current expected drawer cash on the Accounting page.
  2. Execute a Split sale with ₹500 Cash and ₹1,500 UPI.
  3. Record a customer Khata payment of ₹1,000 in Cash.
  4. Return to the Accounting page: expected cash did not increase by the ₹1,500 cash received.
- **Planned Fix:**  
  1. In `createInvoice`, extract the cash portion: `const cashPortion = newInv.paymentMode === 'CASH' ? newInv.paidAmount : (newInv.splitDetails?.cash || 0);`. Add `cashPortion` to `cashSales` and `expectedCash`.
  2. In `addCustomerTransaction`, when `type === 'PAYMENT_RECEIVED'` and `mode === 'CASH'`, increment `mockCashShift.cashReceived` and `expectedCash`. When `type === 'PAYMENT_GIVEN'` in cash, increment `cashRefunds` and decrement `expectedCash`.
- **Resolution:** `RESOLVED` — `createInvoice` and `addCustomerTransaction` in `api.ts` now extract and accumulate the exact cash portions from split payments, customer Khata repayments, and cash refunds into `mockCashShift`.

---

### BUG-004: Exchange Return Store Credit Notes Not Issued via Payment Modal
- **Severity:** `High`
- **Module:** POS & Exchange (F4)
- **File & Line:** [frontend/src/components/pos/PaymentModal.tsx](file:///d:/ERP%20SYSTEM/frontend/src/components/pos/PaymentModal.tsx#L110-L150)
- **Root Cause Analysis:**  
  When an exchange return exceeded the new purchase amount, the net payable was negative, requiring a Store Credit Note / Voucher to be issued to the customer. While `POSPage.tsx` calculated `creditNoteToIssue` in its inline form, `PaymentModal.tsx` omitted `creditNoteIssued`, `creditNoteRedeemed`, and `returnRefInvoiceNumber` from its `invoicePayload`. If a cashier settled through `PaymentModal`, the credit note was never created in `mockCreditNotes`, and the customer lost their exchange credit balance.
- **Reproduction Steps:**
  1. Press F4 in POS, load a previous invoice, and return a garment worth ₹2,500.
  2. Add a new garment worth ₹1,500.
  3. Open Payment Modal (`F5` or `F8`) to finalize.
  4. Complete sale: Invoice was generated with net ₹0, but no Store Credit Note of ₹1,000 was issued.
- **Planned Fix:**  
  Forward `returnRefInvoiceNumber`, `creditNoteIssued`, and `creditNoteRedeemed` into `invoicePayload` inside `PaymentModal.tsx` based on `totals.returnTotal`, `totals.taxableAmount`, and `totals.creditNoteRedeemed`.
- **Resolution:** `RESOLVED` — `PaymentModal.tsx` now captures exchange credit balances, forwards `creditNoteIssued`, `creditNoteRedeemed`, and `returnRefInvoiceNumber` to `api.createInvoice()`, and correctly generates customer credit notes.

---

### BUG-005: Missing Electron Single-Instance Lock
- **Severity:** `High`
- **Module:** Electron Desktop Shell
- **File & Line:** [frontend/electron/main.cjs](file:///d:/ERP%20SYSTEM/frontend/electron/main.cjs#L6-L37)
- **Root Cause Analysis:**  
  The Electron main process did not call `app.requestSingleInstanceLock()`. If an operator double-clicked the desktop shortcut while `ClothShopERP.exe` was already open, a second independent Electron instance spawned. Both instances attempted to write to the same `%APPDATA%\ClothShopERP` LevelDB storage and thermal printer ports, leading to state desynchronization and file lock crashes.
- **Reproduction Steps:**
  1. Launch `ClothShopERP.exe`.
  2. Double-click `ClothShopERP.exe` again.
  3. Two separate instances ran concurrently.
- **Planned Fix:**  
  Implement `const gotTheLock = app.requestSingleInstanceLock();`. If `!gotTheLock`, immediately call `app.quit()`. Otherwise, attach a `second-instance` listener to focus, restore, and maximize the existing window.
- **Resolution:** `RESOLVED` — Single-instance lock implemented in `frontend/electron/main.cjs`. Subsequent launches are intercepted, terminate immediately, and automatically restore and focus the primary application window.

---

### BUG-006: Window Bounds & Maximized State Not Persisted Across Sessions
- **Severity:** `High`
- **Module:** Electron Desktop Shell
- **File & Line:** [frontend/electron/main.cjs](file:///d:/ERP%20SYSTEM/frontend/electron/main.cjs#L6-L21)
- **Root Cause Analysis:**  
  `createWindow()` initialized with hardcoded `width: 1366, height: 768`. User adjustments, custom window positions, and maximized states were lost on application restart, requiring operators to re-maximize the window every morning.
- **Reproduction Steps:**
  1. Open the application, maximize it or move it to a second display.
  2. Close the app.
  3. Relaunch: it started in the default 1366x768 center window.
- **Planned Fix:**  
  Save window bounds (`width`, `height`, `x`, `y`, `isMaximized`) to `app.getPath('userData')/window-state.json` on `resize`, `move`, and `close`, and load them during `createWindow()`.
- **Resolution:** `RESOLVED` — Implemented persistent window state storage in `window-state.json` inside the user data directory. Window dimensions, screen coordinates, and maximized state are automatically restored upon startup.

---

### BUG-007: WhatsApp & External Web Links Open Blank Electron Windows
- **Severity:** `High`
- **Module:** Electron Desktop Shell & Communications
- **File & Line:** [frontend/electron/main.cjs](file:///d:/ERP%20SYSTEM/frontend/electron/main.cjs#L21-L37), [frontend/src/utils/whatsappShare.ts](file:///d:/ERP%20SYSTEM/frontend/src/utils/whatsappShare.ts#L129-L138)
- **Root Cause Analysis:**  
  `whatsappShare.ts` calls `window.open(url, '_blank')`. In Electron with sandboxed webPreferences and without `setWindowOpenHandler`, Electron attempted to spawn a blank internal BrowserWindow rather than delegating the URL to the OS default browser.
- **Reproduction Steps:**
  1. In the Bill Review Modal or Customer Alerts, click "Send on WhatsApp".
  2. An empty white Electron window opened instead of Chrome/Edge or WhatsApp Desktop.
- **Planned Fix:**  
  In `main.cjs`, attach `mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });` to safely route all external URLs to the host operating system.
- **Resolution:** `RESOLVED` — Attached `setWindowOpenHandler` in `main.cjs` routing all `http:` and `https:` URLs via `shell.openExternal(url)`, cleanly launching WhatsApp and browser links in the user's default browser or WhatsApp Desktop app.

---

### BUG-008: Missing Right-Click Native Context Menu in Desktop Shell
- **Severity:** `Medium`
- **Module:** Electron Desktop Shell
- **File & Line:** [frontend/electron/main.cjs](file:///d:/ERP%20SYSTEM/frontend/electron/main.cjs#L24)
- **Root Cause Analysis:**  
  `Menu.setApplicationMenu(null)` removed default Chromium menus, but no contextual right-click menu was configured. Users could not right-click inside barcode, phone, or customer search inputs to Cut, Copy, Paste, or Select All.
- **Reproduction Steps:**
  1. Right-click inside any text box in `ClothShopERP.exe`.
  2. Nothing happened.
- **Planned Fix:**  
  Attach a `context-menu` IPC listener in `main.cjs` showing an Electron `Menu` with standard clipboard operations (Cut, Copy, Paste, Select All) when right-clicking on editable DOM targets.
- **Resolution:** `RESOLVED` — Implemented native right-click context menu in `main.cjs` with keyboard shortcuts (`Ctrl+X`, `Ctrl+C`, `Ctrl+V`, `Ctrl+A`) for all editable DOM input and textarea elements.

---

### BUG-009: Barcode Scanner Race Condition & Input Stacking
- **Severity:** `Medium`
- **Module:** POS Billing (POSPage.tsx)
- **File & Line:** [frontend/src/pages/pos/POSPage.tsx](file:///d:/ERP%20SYSTEM/frontend/src/pages/pos/POSPage.tsx#L204-L218)
- **Root Cause Analysis:**  
  When an item was added via `Enter` keypress, `searchInput` was not cleared immediately. When a physical laser scanner emitted rapid successive barcode scans, the second barcode appended directly to the first search query, causing a "No products found" error.
- **Reproduction Steps:**
  1. Scan barcode `8901234567890`.
  2. Notice the barcode string remained inside the input.
  3. Scan another barcode: the input became `8901234567890890987654321` and failed.
- **Planned Fix:**  
  Clear `setSearchInput('')` immediately upon item addition in `handleSearchKeyDown`, reset `selectedProductIndex` to 0, and maintain focus on the input.
- **Resolution:** `RESOLVED` — In `POSPage.tsx`, `setSearchInput('')` and selection index resets occur immediately on `Enter`, preventing barcode query concatenation during rapid laser scanning.

---

### BUG-010: Stale Custom Bill Total Overriding Subsequent Cart Edits
- **Severity:** `Medium`
- **Module:** POS Billing (POSPage.tsx)
- **File & Line:** [frontend/src/pages/pos/POSPage.tsx](file:///d:/ERP%20SYSTEM/frontend/src/pages/pos/POSPage.tsx#L159-L178), [L293-L296](file:///d:/ERP%20SYSTEM/frontend/src/pages/pos/POSPage.tsx#L293-L296)
- **Root Cause Analysis:**  
  If an operator entered a negotiated custom total (e.g., ₹1,000 for a ₹1,100 cart) and subsequently added another garment worth ₹600, `customTotal` was not cleared or recalculated. During checkout, `effectiveGrandTotal` read the stale `customTotal` of ₹1,000, under-billing the customer by ₹600.
- **Reproduction Steps:**
  1. Add items totaling ₹1,200.
  2. Manually override the total to ₹1,000.
  3. Add another item worth ₹500.
  4. Final bill remained locked at ₹1,000 instead of ₹1,500.
- **Planned Fix:**  
  Synchronize `customTotal` with cart state mutations: whenever `items` changes, clear `customTotal` or recalculate the adjusted discount.
- **Resolution:** `RESOLVED` — Added synchronization effect in `POSPage.tsx` clearing stale `customTotal` and `discountValue` when cart items are added, removed, or emptied.

---

### BUG-011: DOM Anchor Fallbacks for Desktop Exports & Missing Printer Diagnostics
- **Severity:** `Medium`
- **Module:** Electron Desktop Shell & Printing
- **File & Line:** [frontend/electron/preload.cjs](file:///d:/ERP%20SYSTEM/frontend/electron/preload.cjs#L1-L8), [frontend/src/pages/reports/ReportsPage.tsx](file:///d:/ERP%20SYSTEM/frontend/src/pages/reports/ReportsPage.tsx#L87-L94)
- **Root Cause Analysis:**  
  File exports (CSV, Excel, Backup JSON) used browser `document.createElement('a')` data URIs, which could not prompt native OS Save Dialogs in Electron. Furthermore, `preload.cjs` did not expose printer connectivity checks or error statuses. If a thermal printer was unplugged, the app provided no helpful feedback.
- **Reproduction Steps:**
  1. Click "Export CSV" in Reports.
  2. File downloaded to system temp or default downloads folder without asking for destination.
- **Planned Fix:**  
  Add `showSaveDialog` and `getPrinterStatus` IPC channels in `main.cjs` and expose them via `contextBridge` in `preload.cjs`.
- **Resolution:** `RESOLVED` — Implemented `showSaveDialog`, `writeFileToDisk`, and `checkPrinterStatus` in `main.cjs` and exposed them in `preload.cjs`. `ReportsPage.tsx` uses native Windows file save dialog with graceful browser fallback.

---

### BUG-012: Modals Lack Focus Trapping & Auto-Focus Return
- **Severity:** `Medium`
- **Module:** UI & Desktop Ergonomics
- **File & Line:** `PaymentModal.tsx`, `BillReviewModal.tsx`, `SizeColorMatrixModal.tsx`, `BarcodeLabelModal.tsx`, `InvoiceEditPinModal.tsx`
- **Root Cause Analysis:**  
  Modals did not restrict keyboard focus. Pressing `Tab` cycled out of the modal into background sidebar elements. Closing a modal left keyboard focus lost, requiring the cashier to click the barcode box with the mouse.
- **Reproduction Steps:**
  1. Open Payment Modal.
  2. Press `Tab` repeatedly: focus left the modal and navigated invisible sidebar links.
  3. Press `Esc` to close: focus was lost from the POS search box.
- **Planned Fix:**  
  Implement a custom `useFocusTrap` hook and ensure closing any modal automatically refocuses the POS search input.
- **Resolution:** `RESOLVED` — Built reusable `useFocusTrap.ts` hook and integrated into all modals across POS (`PaymentModal`, `BillReviewModal`, `ThermalReceipt`), Inventory, Tailoring, and PIN authorization. Closes on `Escape` and automatically restores cursor focus to `#pos-barcode-search`.

---

### BUG-013: Missing Unsaved Cart Guard on App Window Close
- **Severity:** `Low`
- **Module:** POS Billing & Electron Shell
- **File & Line:** [frontend/src/pages/pos/POSPage.tsx](file:///d:/ERP%20SYSTEM/frontend/src/pages/pos/POSPage.tsx#L135-L148)
- **Root Cause Analysis:**  
  If an operator accidentally clicked the window close button (`X`) or refreshed while an active sale was in the cart, the application exited instantly without confirmation. The held bill was lost unless explicitly saved.
- **Reproduction Steps:**
  1. Add 5 items to the cart.
  2. Click the window close button (`X`) or press `Ctrl+W`.
  3. Window closed without prompt.
- **Planned Fix:**  
  Add a `beforeunload` listener in the frontend and handle window close confirmation if `items.length > 0`.
- **Resolution:** `RESOLVED` — Added `beforeunload` event handler in `POSPage.tsx` preventing accidental loss of uncommitted cart items on window close or tab refresh.

---

### BUG-014: Missing Context-Aware Keyboard Shortcut Cheat-Sheet Footer
- **Severity:** `Low`
- **Module:** UI Layout
- **File & Line:** [frontend/src/components/layout/AppLayout.tsx](file:///d:/ERP%20SYSTEM/frontend/src/components/layout/AppLayout.tsx#L340-L350)
- **Root Cause Analysis:**  
  The layout lacked a persistent, compact bottom bar displaying context-aware function keys (`F2` New Sale, `F3` Search, `F4` Exchange, `F5` Cash, `F6` UPI, `F8` Split, `F10` Hold, `↑↓` Navigate, `Esc` Close). Cashiers had to remember shortcuts from memory.
- **Reproduction Steps:**
  1. Inspect the bottom of `AppLayout.tsx`.
  2. No shortcut cheat-sheet existed.
- **Planned Fix:**  
  Add a persistent, stylish 28px bottom shortcut bar with badge pills.
- **Resolution:** `RESOLVED` — Added high-contrast, compact 32px keyboard shortcut cheat-sheet bar at the bottom of `AppLayout.tsx` showing active hotkeys (`F2`, `F3`, `F4`, `F5`, `F6`, `F8`, `F10`, `↑↓`, `Esc`).

---

### BUG-015: `updateQuantity` In Cart Store Bypasses Negative Stock Guardrail
- **Severity:** `High`
- **Module:** POS & Cart Engine
- **File & Line:** [frontend/src/stores/cartStore.ts](file:///d:/ERP%20SYSTEM/frontend/src/stores/cartStore.ts#L163-L170)
- **Root Cause Analysis:**  
  While `addItem()` enforced `blockNegativeStock` against `variant.stock`, `updateQuantity()` only checked `qty > 9999`. A cashier could scan an item with 1 in stock, and then click `+` or type `50` in the cart table without any stock restriction.
- **Reproduction Steps:**
  1. Enable "Block Negative Stock" in Settings.
  2. Add an item with stock 1.
  3. In the cart table, click `+` or enter 10.
  4. The quantity increased without stock validation.
- **Planned Fix:**  
  Store `maxStock` in `CartItem` or check against available variant stock in `updateQuantity` when `blockNegativeStock` is true.
- **Resolution:** `RESOLVED` — Stored `maxStock: variant.stock` on `CartItem` during `addItem`, and enforced guardrail inside `updateQuantity` when `blockNegativeStock` is enabled, capping quantities to available physical inventory.

---

### BUG-016: Item Percentage Discount Formula Treats Discount as Flat Rupees in `api.ts`
- **Severity:** `Medium`
- **Module:** POS Billing Engine
- **File & Line:** [frontend/src/services/api.ts](file:///d:/ERP%20SYSTEM/frontend/src/services/api.ts#L385)
- **Root Cause Analysis:**  
  In `createInvoice`, `lineNet` was calculated as `Math.max(0, it.totalAmount || (it.unitPrice * it.quantity - it.discount));`. When an item had `discountType === 'PERCENT'` and `discount === 10` (representing 10%), this formula subtracted ₹10 instead of 10% of the item total, causing discrepancies between frontend cart totals and stored invoice records.
- **Reproduction Steps:**
  1. Apply a 10% item discount to a ₹2,000 shirt in the cart (net ₹1,800).
  2. Complete invoice.
  3. In backend storage, item discount was treated as flat ₹10 (net ₹1,990).
- **Planned Fix:**  
  Calculate `lineNet` taking `it.discountType` into account: if `PERCENT`, deduct `(it.unitPrice * it.quantity * it.discount) / 100`.
- **Resolution:** `RESOLVED` — In `api.ts`, `lineDiscount` calculation accurately computes percentage discounts (`(unitPrice * quantity * discount) / 100`) vs flat rupee discounts, ensuring 100% parity with frontend cart summaries.

---

## 3. Desktop Essentials Gap Analysis & Implemented Architecture

| Desktop Feature | Initial State | Implemented Native Desktop Experience | Status |
| :--- | :--- | :--- | :---: |
| **Single-Instance Application** | Missing; duplicate instances open on double-click. | Prevent duplicate processes; focus existing window via `app.requestSingleInstanceLock()`. | **VERIFIED** |
| **Window State Memory** | Missing; reset to 1366x768 on every boot. | Persist `width`, `height`, `x`, `y`, and maximized state in `%APPDATA%/ClothShopERP/window-state.json`. | **VERIFIED** |
| **Right-Click Context Menu** | Completely disabled; right-click did nothing. | Native context menu with Cut, Copy, Paste, Select All on text inputs. | **VERIFIED** |
| **External Link Routing** | Opened blank Electron windows for WhatsApp/web. | Intercepted with `shell.openExternal()` to launch host OS default browser/app. | **VERIFIED** |
| **Native Save Dialogs** | Used DOM `<a download>` browser hack. | Native Windows File Explorer Save Dialog via Electron `dialog.showSaveDialog`. | **VERIFIED** |
| **Thermal Printer Diagnostics** | Silently failed or alerted vague message. | Check printer list, report offline printers, and offer fallback to system print dialog. | **VERIFIED** |
| **Universal Arrow-Key Navigation** | Only implemented on a few search inputs. | Full `↑` / `↓` / `←` / `→` arrow-key navigation across **all** data tables (`Products`, `Inventory`, `Customers`, `Purchases`, `Reports`, `Alterations`) and modal lists with high-contrast focus rings. | **VERIFIED** |
| **Focus Trapping in Modals** | Missing; `Tab` key escaped into background DOM. | Dedicated focus trap hook trapping focus inside modals, with `Esc` cleanly closing the top modal. | **VERIFIED** |
| **Smart POS Auto-Focus** | Required mouse click after modal close or checkout. | Automatically return cursor focus to the POS barcode search input after sale completion, cart clear, bill hold, or modal close. | **VERIFIED** |
| **Keyboard Shortcut Cheat-Sheet** | Missing. | Compact, persistent 32px bottom bar displaying active hotkeys (`F2`, `F3`, `F4`, `F5`, `F6`, `F8`, `F10`, `↑↓`, `Esc`). | **VERIFIED** |
| **Unsaved Changes Guard** | Exited immediately on window close. | Confirm before closing if cart contains uncommitted items. | **VERIFIED** |

---

## 4. Verification & Build Confirmation

1. **TypeScript Static Typecheck:**  
   Executed `npx tsc --noEmit` across all modules. **0 errors found.**
2. **Vite Production Bundler:**  
   Executed `npm run build` producing production assets in `frontend/dist/`. **All modules compiled successfully.**
3. **Electron Packaging Readiness:**  
   Preload scripts and main process validated for sandboxed execution with single-instance lock and IPC security.
