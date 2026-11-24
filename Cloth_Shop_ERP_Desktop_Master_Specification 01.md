# CLOTH SHOP ERP SYSTEM --- MASTER IMPLEMENTATION SPECIFICATION

**Project Type:** Garment / Clothing Shop ERP + POS Windows Desktop Application\
**Desktop UI:** React + TypeScript packaged with Tauri\
**Primary Backend:** Java + Spring Boot REST API\
**Database:** MySQL\
**Cloud Target:** Oracle Cloud for backup, synchronization and optional remote services\
**Desktop Distribution:** Windows `.exe` / installer — PRIMARY DELIVERY MODE\
**Containerization:** Docker + Docker Compose\
**UI Direction:** Executive Dashboard + High-Speed Keyboard-First POS\
**Document Status:** Master specification for implementation in
Antigravity IDE

------------------------------------------------------------------------

# 1. PROJECT OBJECTIVE

Build a complete, production-style Cloth Shop ERP system for
garment/clothing retail operations.

The application must combine:

-   Executive business dashboard
-   High-speed POS billing
-   Garment style/color/size matrix inventory
-   SKU and barcode management
-   Barcode label generation and thermal printing
-   Purchases and supplier management
-   Supplier bills and supplier ledger
-   Customer management and customer Khata/ledger
-   Customer and supplier payments
-   Invoices and invoice management
-   Returns and exchanges
-   Expenses and cash management
-   Employee and role management
-   Alteration/tailoring management
-   Loyalty and promotions
-   WhatsApp/email communication
-   Reports and analytics
-   GST/tax configuration
-   Backup and restore
-   Google Drive backup
-   Email backup/notifications
-   Audit logs
-   Configurable keyboard shortcuts
-   Global arrow-key navigation
-   Docker deployment
-   Oracle Cloud deployment
-   Windows executable/installer distribution

The implementation must preserve all requirements in this document. Do
not remove or silently omit modules or features.

------------------------------------------------------------------------

# 2. CORE DESIGN PRINCIPLES

1.  The ERP must be easy for a clothing-shop cashier to operate.
2.  POS must be keyboard-first and barcode-scanner friendly.
3.  All important operations must be traceable.
4.  MySQL is the source of truth for transactional data.
5.  React must never connect directly to MySQL.
6.  React communicates with Spring Boot through REST APIs.
7.  Security-sensitive operations require authorization.
8.  Completed invoice editing requires a security PIN/authorized
    permission.
9.  Supplier bills and other documents must remain linked to their
    source records.
10. Local and Oracle Cloud deployments must use the same application
    codebase.
11. The system must support both local Windows deployment and cloud
    deployment.
12. Configuration must not be hard-coded.
13. All major settings must be manageable from the Settings section.
14. UI must be responsive, professional, clean and fast.
15. The dashboard must use an Executive Dashboard visual language.
16. The application must support arrow-key navigation wherever
    practical.
17. Keyboard shortcuts must be configurable from Settings.
18. All privileged actions must create audit records.
19. Backup and restore must be treated as first-class ERP functionality.
20. Do not build fake buttons or non-functional UI placeholders for core
    features.

------------------------------------------------------------------------

# 3. TECHNOLOGY STACK

## 3.1 Desktop application

- Tauri
- React
- TypeScript
- Vite

Tauri is the Windows desktop shell. React is the desktop UI.

## 3.2 UI

- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Router
- React Hook Form
- Zod
- Recharts
- Lucide icons

## 3.3 Backend

- Java
- Spring Boot
- Spring Web
- Spring Security
- JWT where applicable
- Spring Data JPA
- Hibernate
- Jakarta Bean Validation
- Flyway
- REST API over localhost
- OpenAPI / Swagger for development and maintenance

## 3.4 Database

- MySQL 8.x

MySQL is the primary local transactional database.

## 3.5 Optional infrastructure

- Redis for caching/background coordination where useful
- Spring Scheduler
- Quartz if complex scheduling is required

Redis must never replace MySQL as the source of truth.

## 3.6 Desktop/device integrations

- Windows printing
- ESC/POS thermal printers
- Cash drawer
- Barcode scanners
- File system
- PDF generation
- Excel/CSV
- Native Windows dialogs where useful

## 3.7 Cloud/integrations

- Oracle Cloud
- Google Drive
- Email/SMTP
- WhatsApp
- Optional cloud storage

These integrations must not make internet access mandatory for local POS operations.

## 3.8 Packaging

- Tauri Windows bundle
- Windows `.exe`
- Windows installer
- Docker for development/server/cloud environments
- Optional `.bat` developer/startup scripts

# 4. HIGH-LEVEL DESKTOP ARCHITECTURE

The ERP is a **pure Windows desktop application from the user's point of view**.

The shop owner/cashier launches:

```text
ClothShopERP.exe
```

No Chrome, Edge or other browser is required for normal operation.

Recommended desktop architecture:

```text
                    CLOTH SHOP ERP
                          |
                    Windows Desktop
                          |
                    Tauri Desktop Shell
                          |
                 React + TypeScript UI
                          |
                  Local Spring Boot API
                          |
                JPA / Hibernate / JDBC
                          |
                       MySQL
                          |
                Local File / Document Store
                          |
             +------------+-------------+
             |                          |
       Google Drive                Oracle Cloud
          Backup              Optional Sync/Backup
```

## 4.1 Desktop shell

Use **Tauri** as the Windows desktop shell.

Responsibilities:

- Package the React frontend as a Windows desktop application
- Launch/manage the local ERP backend where configured
- Provide Windows application integration
- Support desktop printing and device access
- Support native dialogs where useful
- Package the application into an installable Windows `.exe`

Do not require the user to open a browser.

## 4.2 Frontend

React + TypeScript runs inside the Tauri desktop application.

It communicates with the local Spring Boot API over localhost/internal application communication.

React must never connect directly to MySQL.

## 4.3 Backend

Spring Boot is the main business-logic layer. It handles authentication, authorization, POS, inventory, customers, suppliers, supplier bills, purchases, invoices, payments, accounting, reports, backup orchestration, audit logging and integrations.

## 4.4 Local database

MySQL is the primary local transactional database.

The desktop application must be able to operate locally without internet for core shop operations, including product search, barcode scanning, POS billing, cash sales, credit sales, customer/supplier ledgers, inventory, invoice generation, printing, local reports, cash management and shift closing.

Internet-dependent services such as Google Drive, WhatsApp API, email and cloud synchronization must fail gracefully without stopping local billing.

# 5. DEPLOYMENT MODES

The **desktop application is the primary deployment mode**.

## 5.1 PRIMARY — Local Windows Desktop

```text
Windows PC
    |
ClothShopERP.exe
    |
Tauri
    |
React UI
    |
Spring Boot
    |
MySQL
```

The shop can operate the ERP locally.

## 5.2 OPTIONAL — Oracle Cloud

Oracle Cloud is NOT the primary user interface. It is used for optional:

- Cloud backup
- Disaster recovery
- Data synchronization
- Multi-branch synchronization
- Centralized reporting
- Remote owner services
- Future remote access

The Windows desktop application remains the primary ERP interface.

## 5.3 OPTIONAL — Demo/Test mode

Provide a local demo environment with sample store, products, customers, suppliers, invoices, inventory and reports. Demo data must remain separate from real shop data.

## 5.4 Internet failure behavior

```text
Internet OFF
    |
    +--> POS continues
    +--> MySQL continues
    +--> Local invoices continue
    +--> Local printing continues
    +--> Local reports continue
    |
    +--> Google Drive backup waits/retries
    +--> WhatsApp waits/fails gracefully
    +--> Email waits/retries
    +--> Cloud synchronization waits/retries
```

Do not block the cashier because a cloud service is unavailable.

# 6. WINDOWS DESKTOP EXE / INSTALLER

The end-user application must be distributed as a Windows installer.

Target:

```text
ClothShopERP-Setup.exe
```

The installed application launches `ClothShopERP.exe`.

Installer requirements:

- Install the desktop application
- Install/configure required local runtime components
- Configure local MySQL where selected
- Configure Spring Boot local service
- Configure application directories
- Create desktop shortcut
- Create Start Menu shortcut
- Provide uninstaller
- Preserve business data during upgrades
- Provide clear installation errors

When the user opens the ERP, it should check required services, start/check the local backend, verify MySQL, load configuration and open the login screen. The user must not need to manually start Java, React, Vite, MySQL or a browser.

Development/support scripts may include:

```text
start-erp.bat
stop-erp.bat
restart-erp.bat
```

These are admin/developer conveniences, not the primary user workflow.

# 7. EXECUTIVE DASHBOARD UI

The dashboard must use an **Executive Dashboard** visual style.

## 7.1 Visual language

Use:

-   KPI cards
-   Large typography
-   Trend arrow icons
-   Positive/negative trend indicators
-   Donut charts
-   Gauge/progress charts
-   Line charts
-   Bar charts
-   Sales trends
-   Inventory insights
-   Status badges
-   Ranking cards
-   Fast/slow-moving indicators
-   Clear spacing
-   Professional business UI
-   Responsive cards
-   Dark/light theme compatibility where implemented

Avoid an overly decorative consumer-app design.

## 7.2 KPI cards

Include:

-   Today's Revenue
-   Today's Profit
-   Total Invoices
-   Items Sold
-   Average Invoice Value
-   Customer Outstanding
-   Supplier Payables
-   Stock Value
-   Low Stock Items
-   Pending Alterations

Example:

``` text
TODAY'S REVENUE
₹1,24,580
↑ 12.4% vs yesterday
```

## 7.3 Dashboard charts

Include:

-   Sales trend
-   Sales vs stock
-   Payment-method breakdown
-   Category sales
-   Top products
-   Fast-moving products
-   Slow-moving products
-   Dead stock
-   Peak sales hours
-   Weekly comparison
-   Monthly comparison

## 7.4 Dashboard filters

Allow:

-   Today
-   Yesterday
-   This week
-   This month
-   This year
-   Custom date range
-   Branch
-   Cashier
-   Category
-   Brand

------------------------------------------------------------------------

# 8. AUTHENTICATION AND STORE ONBOARDING

## 8.1 Login

Support:

-   Shop/tenant code
-   Username
-   Mobile number where configured
-   Password
-   PIN login for fast cashier access

## 8.2 Store identity

Display:

-   Store logo
-   Store name
-   Active branch
-   Branch selector

## 8.3 Multi-tenant design

All store-owned data must be isolated by tenant/store ID.

A user must never be able to access another tenant's data.

## 8.4 Roles

Initial roles:

-   OWNER
-   MANAGER
-   CASHIER
-   ACCOUNTANT
-   TAILOR
-   INVENTORY_MANAGER

The permission system must remain configurable.

------------------------------------------------------------------------

# 9. EMPLOYEE AND PERMISSION MANAGEMENT

Employee management:

-   Employee profile
-   Employee ID
-   Name
-   Mobile
-   Email
-   Role
-   Branch
-   Joining date
-   Status

Permission management:

-   View
-   Create
-   Edit
-   Delete
-   Approve
-   Export
-   Print
-   Pay
-   Cancel
-   Return
-   Discount
-   Price edit
-   Invoice edit
-   Backup
-   Restore
-   Settings

Permissions must be checked on the backend, not only hidden in React.

------------------------------------------------------------------------

# 10. SHIFT MANAGEMENT

Cashier shift functionality:

-   Open shift
-   Opening cash
-   Cashier
-   Branch
-   Start time
-   Sales during shift
-   Cash received
-   Cash refunds
-   Cash expenses
-   Cash withdrawals
-   Expected cash
-   Actual cash
-   Difference
-   Shortage
-   Excess
-   Shift closing
-   Manager approval where required

------------------------------------------------------------------------

# 11. PRODUCT / STYLE MASTER

The garment product system must support parent styles and variants.

Parent item fields:

-   Brand
-   Article/style name
-   Category
-   HSN code
-   Fabric type
-   Washing/care instructions
-   Product description
-   Product image
-   Supplier
-   Reorder level

------------------------------------------------------------------------

# 12. SIZE-COLOR MATRIX

This is one of the most important garment-specific modules.

Allow:

-   Multiple colors
-   Multiple sizes
-   Size groups by category

Examples:

``` text
Shirts:
S M L XL XXL

Jeans:
28 30 32 34 36
```

Automatically generate combinations.

Example:

``` text
CHINO-NAV-30
CHINO-NAV-32
CHINO-RED-30
CHINO-RED-32
```

Each variant must support:

-   SKU
-   Barcode
-   Color
-   Size
-   Cost price
-   MRP
-   Selling price
-   Opening stock
-   Reorder level

Bulk fill controls:

-   Apply cost to all
-   Apply selling price to all
-   Apply MRP to all
-   Apply stock to all where appropriate

Support Excel/CSV import.

------------------------------------------------------------------------

# 13. BARCODE AND LABEL MANAGEMENT

Features:

-   Generate barcode
-   Generate SKU
-   Barcode search
-   Barcode regeneration
-   Bulk barcode generation
-   Barcode import
-   QR code support
-   Label templates
-   Multiple label sizes
-   Reprint labels
-   Missing barcode report

## Thermal label printing

Support ESC/POS/raw printing where compatible.

Label can include:

-   Store logo
-   Store name
-   Style
-   Size
-   Color
-   Barcode
-   SKU
-   MRP
-   Selling price
-   Washing instructions
-   Discount savings percentage

Allow field toggles from settings.

------------------------------------------------------------------------

# 14. HIGH-SPEED POS / BILLING

The POS is the main operational screen.

## 14.1 Search

-   Auto-focused barcode input
-   USB barcode scanner
-   Manual product search
-   Search by style
-   Search by SKU
-   Search by size
-   Search by color
-   Search by brand

## 14.2 Customer section

Fields:

-   Customer name optional
-   Phone optional
-   Existing customer search
-   Create customer
-   Load customer ledger

## 14.3 Cart columns

-   Item
-   SKU
-   Size
-   Color
-   Quantity
-   Price
-   Discount
-   Final amount

## 14.4 Cart operations

-   Add item
-   Remove item
-   Change quantity
-   Change permitted price
-   Apply item discount
-   Apply bill discount
-   Barcode scan
-   Product search
-   Hold bill
-   Resume bill
-   Clear cart

------------------------------------------------------------------------

# 15. CASH / CREDIT SYSTEM

The POS must clearly support:

-   Cash
-   Credit
-   UPI
-   Card
-   Cheque
-   Bank transfer
-   Split payment

## Cash

Show:

-   Total
-   Cash received
-   Change

## Credit

When Credit is selected:

-   Customer is mandatory
-   Credit limit is checked
-   Amount goes to customer ledger
-   Invoice becomes unpaid/credit
-   Authorized approval required if credit limit is exceeded

## Split payment

Example:

``` text
Total: ₹5,000

Cash: ₹2,000
UPI: ₹2,000
Card: ₹1,000
```

------------------------------------------------------------------------

# 16. DISCOUNT SYSTEM

Discounts must support both:

-   Fixed rupee amount
-   Percentage

UI:

``` text
Discount Type:
[ ₹ ] [ % ]
```

Support:

-   Item discount
-   Bill discount
-   Promotional discount
-   Authorized discount
-   Customer-specific discount

Display clearly:

-   Subtotal
-   Item discounts
-   Bill discount
-   Tax/GST
-   Grand total

Discount permissions must be configurable.

------------------------------------------------------------------------

# 17. INVOICE MANAGEMENT

Create a dedicated Invoice module.

Invoice statuses:

-   Draft
-   Completed
-   Paid
-   Partially Paid
-   Credit
-   Cancelled
-   Returned
-   Partially Returned
-   Edited

Features:

-   Invoice list
-   Invoice search
-   Invoice number
-   Invoice series
-   Tax invoice
-   Retail invoice
-   Proforma invoice
-   Credit note
-   Debit note
-   Return invoice
-   Duplicate/reprint
-   PDF
-   Print
-   Email
-   WhatsApp
-   Payment history
-   GST breakdown
-   Discount breakdown
-   Customer ledger link
-   Inventory transaction link

Search/filter by:

-   Invoice number
-   Customer
-   Phone
-   Date
-   Payment mode
-   Amount
-   Status

------------------------------------------------------------------------

# 18. INVOICE EDIT SECURITY

Completed invoices must not be freely editable.

Selecting Edit Invoice must require:

-   Security PIN and/or
-   Authorized permission

PIN must never be stored as plain text.

Admin settings:

-   Invoice edit PIN
-   Allowed roles
-   Manager approval
-   Maximum edit period
-   Whether paid invoices can be edited
-   Whether cancelled invoices can be edited

Every edit must create an audit record.

Audit record:

-   Invoice ID
-   User
-   Date/time
-   Authorization method
-   Reason
-   Old value
-   New value

Example:

``` text
Before:
Qty = 2
Discount = 5%

After:
Qty = 3
Discount = 10%
```

------------------------------------------------------------------------

# 19. RETURNS AND EXCHANGES

Support:

-   Full return
-   Partial return
-   Size exchange
-   Color exchange
-   Product exchange
-   Return with invoice
-   Return without invoice with permission
-   Refund
-   Store credit
-   Exchange difference
-   Return reason
-   Damaged item
-   Automatic stock adjustment
-   Customer ledger adjustment

Example:

``` text
Size M returned
Size L issued
```

------------------------------------------------------------------------

# 20. CUSTOMER MANAGEMENT / KHATA

Customer profile:

-   Name
-   Phone
-   Address
-   Customer group
-   Credit limit
-   Outstanding balance
-   Loyalty points
-   Birthday
-   Anniversary
-   Purchase history
-   Last purchase

Customer ledger:

  Date   Invoice/Voucher   Type   Debit   Credit   Balance   Mode
  ------ ----------------- ------ ------- -------- --------- ------

Transaction types:

-   Sale
-   Payment received
-   Return
-   Advance
-   Refund
-   Store credit

------------------------------------------------------------------------

# 21. CUSTOMER PAYMENT MODES

When recording customer payment, support:

### Cash

-   Amount
-   Date
-   Remarks

### UPI

-   Amount
-   Date
-   UPI/UTR number
-   Remarks

### Card

-   Amount
-   Date
-   Card/reference details
-   Remarks

### Cheque

-   Amount
-   Date
-   Cheque number
-   Cheque date
-   Bank
-   Remarks

### Bank transfer

-   Amount
-   Date
-   UTR/reference
-   Bank
-   Remarks

The form must dynamically show only relevant fields.

------------------------------------------------------------------------

# 22. SUPPLIER MANAGEMENT

Supplier profile:

-   Supplier name
-   Phone
-   Email
-   Address
-   GSTIN
-   Contact person
-   Payment terms
-   Credit terms
-   Opening balance
-   Status

Supplier sections:

-   Overview
-   Bills
-   Purchase orders
-   GRNs
-   Payments
-   Ledger
-   Returns
-   Documents

------------------------------------------------------------------------

# 23. SUPPLIER LEDGER

Supplier ledger must follow the required UI pattern:

``` text
Supplier Name
Phone Number

Outstanding Payable Balance
₹15000.00

Record Supplier Transaction

[ + Purchase Credit (Owe) ]
[ - Payment Made ]

Transaction Amount
Supplier Invoice No
Date
Payment Mode
Remarks / Details
```

## Purchase Credit

Fields:

-   Transaction amount
-   Supplier invoice number
-   Purchase date
-   Due date
-   Remarks/details
-   Supplier bill attachment

This increases supplier payable.

## Payment Made

Fields:

-   Transaction amount
-   Payment date
-   Payment mode
-   Supplier invoice/reference
-   Remarks
-   Attachment where applicable

This decreases supplier payable.

------------------------------------------------------------------------

# 24. SUPPLIER PAYMENT MODES

## Cash

-   Amount
-   Date
-   Remarks

## UPI

-   Amount
-   Date
-   UPI/UTR number
-   Remarks

## Cheque

-   Amount
-   Date
-   Cheque number
-   Cheque date
-   Bank
-   Remarks

## Bank Transfer

-   Amount
-   Date
-   UTR/reference
-   Bank
-   Remarks

------------------------------------------------------------------------

# 25. SUPPLIER STATEMENT LEDGER

Example:

  Date       Type       Invoice    Debit     Credit    Balance   Mode   Actions
  ---------- ---------- ---------- --------- --------- --------- ------ ---------
  01/10/26   Purchase   INV-1001   ₹50,000   ---       ₹50,000   ---    View
  03/10/26   Payment    ---        ---       ₹20,000   ₹30,000   UPI    View
  06/10/26   Purchase   INV-1025   ₹40,000   ---       ₹70,000   ---    View

Rules:

-   Purchase Credit increases payable.
-   Payment Made decreases payable.
-   Running balance is calculated automatically.

------------------------------------------------------------------------

# 26. SUPPLIER BILLS / DOCUMENT STORAGE

Every supplier bill must be stored in:

``` text
Supplier
 ├── Purchase Orders
 ├── Supplier Bills
 ├── GRNs
 ├── Payments
 ├── Returns
 └── Documents
```

Supplier bill fields:

-   Supplier invoice number
-   Purchase date
-   Due date
-   PO number
-   GRN number
-   Amount
-   Taxable amount
-   GST
-   Discount
-   Paid amount
-   Outstanding amount
-   Payment status
-   Payment terms
-   Attached bill
-   Notes

Support:

-   PDF
-   JPG
-   JPEG
-   PNG
-   Excel/CSV where appropriate

Supplier bill must be linked to:

``` text
Supplier Bill
   ↓
Purchase
   ↓
GRN
   ↓
Inventory
   ↓
Supplier Ledger
   ↓
Payment
```

------------------------------------------------------------------------

# 27. PURCHASE ORDERS

Supplier purchase order module:

-   Create PO
-   Supplier selection
-   Items
-   Quantities
-   Prices
-   Expected delivery
-   Payment terms
-   Status
-   Print
-   PDF
-   WhatsApp order message

Statuses:

-   Draft
-   Sent
-   Partially Received
-   Received
-   Cancelled

------------------------------------------------------------------------

# 28. GRN / GOODS RECEIVED NOTE

GRN must support:

-   Received cartons/boxes
-   Ordered quantity
-   Actual quantity
-   Damaged quantity
-   Wrong-size quantity
-   Short quantity
-   Excess quantity
-   Supplier return flag

GRN must update stock only according to actual accepted received
quantities.

------------------------------------------------------------------------

# 29. AUTOMATIC PURCHASE ORDER GENERATION

When stock reaches reorder point:

``` text
Stock <= Reorder Point
        ↓
Group variants by supplier
        ↓
Calculate required quantity
        ↓
Generate PO
        ↓
PDF / WhatsApp
```

Allow one-click PO generation.

------------------------------------------------------------------------

# 30. INVENTORY MANAGEMENT

Features:

-   Current stock
-   Stock movement
-   Opening stock
-   Stock adjustment
-   Damaged stock
-   Lost stock
-   Found stock
-   Stock count
-   Stock valuation
-   Reorder point
-   Low-stock alert
-   Dead stock
-   Fast-moving
-   Slow-moving

Every stock change must create an inventory movement.

------------------------------------------------------------------------

# 31. MULTI-BRANCH STOCK TRANSFER

Workflow:

``` text
Branch A
  ↓
Transfer Request
  ↓
Approval
  ↓
Dispatch
  ↓
Receive
  ↓
Branch B Stock Updated
```

Track:

-   Requested quantity
-   Sent quantity
-   Received quantity
-   Damaged quantity
-   Status
-   User
-   Date/time
-   Transfer history

------------------------------------------------------------------------

# 32. PRICING AND PROMOTIONS

Support:

-   Cost price
-   MRP
-   Selling price
-   Wholesale price
-   Customer-specific price
-   Seasonal price
-   Festival price
-   Percentage discount
-   Fixed discount
-   Buy X Get Y
-   Coupons
-   Promotional campaigns

Maintain price history:

-   Old price
-   New price
-   User
-   Date/time
-   Reason

------------------------------------------------------------------------

# 33. EXPENSE MANAGEMENT

Expense categories:

-   Rent
-   Electricity
-   Salary
-   Transport
-   Packaging
-   Maintenance
-   Internet
-   Marketing
-   Miscellaneous

Features:

-   Expense entry
-   Category
-   Amount
-   Payment mode
-   Date
-   Description
-   Receipt attachment
-   Recurring expenses
-   Expense reports

------------------------------------------------------------------------

# 34. CASH MANAGEMENT

Track:

-   Opening cash
-   Cash sales
-   Cash received
-   Cash refunds
-   Cash expenses
-   Cash withdrawals
-   Expected cash
-   Actual cash
-   Difference
-   Shortage
-   Excess
-   Cash closing

------------------------------------------------------------------------

# 35. ALTERATION / TAILORING MODULE

Features:

-   Alteration order
-   Customer
-   Invoice
-   Measurements
-   Tailor assignment
-   Tailor notes
-   Delivery due date
-   Alteration charge
-   Status
-   Ready for pickup
-   Completed
-   WhatsApp notification

Statuses:

-   Pending
-   Assigned
-   In Progress
-   Ready
-   Delivered
-   Cancelled

------------------------------------------------------------------------

# 36. CUSTOMER LOYALTY

Support:

-   Loyalty points
-   Points per amount spent
-   Redeem points
-   Bonus points
-   Expiry
-   Membership levels
-   Coupons
-   Referral rewards

Capture:

-   Birthday
-   Anniversary

Allow configurable birthday/anniversary promotional notifications.

------------------------------------------------------------------------

# 37. WHATSAPP / COMMUNICATION ENGINE

Support:

-   Digital invoice
-   Payment reminder
-   Overdue reminder
-   Bulk overdue reminder
-   Promotional broadcast
-   Alteration-ready message
-   Purchase order message
-   Customer greetings

Integration options:

-   Official WhatsApp Business API / Meta Cloud API
-   Provider such as Twilio/WATI where configured
-   Zero-cost WhatsApp deep link for manual sending

Never expose API credentials in frontend code.

------------------------------------------------------------------------

# 38. EMAIL

Email features:

-   Invoice email
-   Payment receipt
-   Purchase order
-   Reports
-   Backup notification
-   Backup failure notification
-   System notifications

SMTP/provider configuration must be stored securely.

------------------------------------------------------------------------

# 39. GST / TAX MANAGEMENT

Configurable tax system:

-   GST
-   HSN
-   CGST
-   SGST
-   IGST
-   Tax inclusive/exclusive
-   Tax invoice
-   Tax summary
-   GST reports
-   Invoice tax breakdown

Tax rates must be configurable and must not be hard-coded.

------------------------------------------------------------------------

# 40. REPORTS CENTER

## Sales reports

-   Daily
-   Weekly
-   Monthly
-   Yearly
-   Custom range
-   Item-wise
-   Category-wise
-   Brand-wise
-   Size-wise
-   Color-wise
-   Cashier-wise
-   Branch-wise

## Inventory reports

-   Current stock
-   Low stock
-   Dead stock
-   Fast-moving
-   Slow-moving
-   Stock valuation
-   Stock movement
-   Stock adjustment

## Financial reports

-   Revenue
-   Profit
-   Expenses
-   GST
-   Payment method
-   Customer outstanding
-   Supplier payable

## Customer reports

-   Top customers
-   Customer purchase history
-   Outstanding customers
-   Loyalty

## Supplier reports

-   Purchases
-   Payables
-   Payments
-   Supplier performance

Exports:

-   PDF
-   Excel
-   CSV
-   Print

------------------------------------------------------------------------

# 41. REPORT FILTERS

Every relevant report should support:

-   Date range
-   Branch
-   User/cashier
-   Customer
-   Supplier
-   Category
-   Brand
-   Payment mode
-   Status

------------------------------------------------------------------------

# 42. NOTIFICATION CENTER

Notifications:

-   Low stock
-   Dead stock
-   Customer overdue
-   Supplier payment due
-   PO pending
-   Stock transfer pending
-   Alteration ready
-   Backup successful
-   Backup failed
-   Google Drive disconnected
-   Shift closing pending
-   System errors

------------------------------------------------------------------------

# 43. BACKUP AND RESTORE

Backup is a mandatory module.

## Backup destinations

-   Local storage
-   Google Drive
-   Email notification / backup delivery where practical
-   Future cloud storage

## Backup types

-   Full database backup
-   Incremental strategy where implemented
-   Document/file backup
-   Configuration backup

## Scheduling

-   Daily
-   Weekly
-   Manual
-   Configurable time

## Backup before important actions

Optionally create a backup before:

-   Major updates
-   Restore
-   Database migrations

## Google Drive

Settings:

-   Connect Google Drive
-   Select folder
-   Schedule
-   Manual Backup Now
-   Last successful backup
-   Backup size
-   Backup history
-   Retention
-   Delete old backups
-   Connection status

## Email

Support:

-   Backup success notification
-   Backup failure notification
-   Google Drive connection failure
-   Backup verification failure
-   Restore completion

Large backup files should not be blindly attached to email. Use a secure
link/location or configured storage notification when the attachment is
too large.

## Restore

-   List backups
-   Verify backup
-   Restore selected backup
-   Confirmation before restore
-   Automatic pre-restore backup
-   Restore log
-   Restore status

Only authorized admin users can restore.

------------------------------------------------------------------------

# 44. DOCUMENT MANAGEMENT

Central attachment system.

Document categories:

-   Supplier bills
-   Supplier documents
-   Customer documents
-   Expense receipts
-   Product images
-   Alteration photos
-   Payment receipts
-   Purchase documents

Metadata:

-   File ID
-   Filename
-   Type
-   MIME type
-   Size
-   Uploaded by
-   Date
-   Related module
-   Related record

Actions:

-   View
-   Download
-   Replace where permitted
-   Delete with permission

Do not store large binary files unnecessarily inside transactional
tables.

------------------------------------------------------------------------

# 45. AUDIT LOG

Track all sensitive operations.

Examples:

-   Invoice edit
-   Invoice cancellation
-   Invoice return
-   Stock adjustment
-   Price change
-   Discount change
-   Customer credit
-   Supplier payment
-   Supplier bill change
-   Backup
-   Restore
-   Permission change
-   User creation
-   User deletion
-   Settings change

Audit fields:

-   User
-   Role
-   Action
-   Module
-   Record ID
-   Timestamp
-   Old value
-   New value
-   Reason
-   Device/IP where appropriate

Audit logs must not be editable by normal users.

------------------------------------------------------------------------

# 46. GLOBAL KEYBOARD-FIRST SYSTEM

The entire ERP must be designed to work with keyboard navigation
wherever practical.

Default behavior:

``` text
Arrow Up       Previous row/item
Arrow Down     Next row/item
Arrow Left     Previous field/tab
Arrow Right    Next field/tab
Enter          Select/Open/Confirm
Esc            Cancel/Close/Clear where context permits
Tab            Next field
Shift + Tab    Previous field
```

Context-sensitive behavior is required.

For example, arrow keys inside a date picker or dropdown must operate
that control rather than trigger unrelated global actions.

------------------------------------------------------------------------

# 47. KEYBOARD SHORTCUT SETTINGS

Create:

**Settings → Keyboard & Shortcuts**

Show:

  Action             Default Shortcut   Customizable
  ------------------ ------------------ --------------
  New Sale           F2                 Yes
  Product Search     F3                 Yes
  Cash Payment       F5                 Yes
  Card/UPI Payment   F6                 Yes
  Split Bill         F8                 Yes
  Hold Invoice       F10                Yes
  Clear Cart         Esc                Yes
  Save               Ctrl+S             Yes
  Search             Ctrl+F             Yes
  New Customer       Ctrl+N             Yes
  Print Invoice      Ctrl+P             Yes

The original POS workflow uses F5 cash, F6 card/UPI, F8 split bill, F10
hold invoice and Esc clear cart as default concepts.

## Shortcut editor

Requirements:

-   Press desired key combination
-   Detect conflicts
-   Prevent duplicate assignment
-   Reset to defaults
-   Function keys
-   Ctrl combinations
-   Alt combinations
-   Shift combinations
-   Display shortcuts next to buttons
-   User/role configuration where appropriate
-   Admin default configuration

------------------------------------------------------------------------

# 48. SYSTEM SETTINGS

Settings must contain:

## Store

-   Store name
-   Logo
-   Address
-   GSTIN
-   Contact
-   Branches

## Invoice

-   Numbering
-   Prefix
-   Template
-   Footer
-   Terms

## POS

-   Default payment mode
-   Scanner behavior
-   Shortcut configuration
-   Discount permissions
-   Price-edit permissions

## Inventory

-   Reorder level
-   Negative-stock policy
-   Stock valuation

## Tax

-   GST configuration
-   HSN
-   Tax behavior

## Security

-   Password policy
-   PIN
-   Session timeout
-   Roles
-   Permissions
-   Invoice edit authorization

## Communication

-   WhatsApp
-   Email
-   SMS if configured

## Backup

-   Local backup
-   Google Drive
-   Email notifications
-   Schedule
-   Retention

------------------------------------------------------------------------

# 49. SYSTEM HEALTH / ADMINISTRATION

Admin section:

-   Database status
-   API status
-   Redis status
-   Storage usage
-   Backup status
-   Printer status
-   Background jobs
-   Failed notifications
-   Connected devices
-   Error logs
-   Application version
-   Environment information

------------------------------------------------------------------------

# 50. API ARCHITECTURE

REST API base:

``` text
/api
```

## Authentication

``` text
POST /api/auth/login
POST /api/auth/pin-login
POST /api/auth/refresh
POST /api/auth/logout
```

## Products

``` text
GET    /api/products
POST   /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}
```

## Sales

``` text
POST /api/sales
GET  /api/sales
GET  /api/sales/{id}
PUT  /api/sales/{id}
POST /api/sales/{id}/return
POST /api/sales/{id}/edit-authorize
```

## Customers

``` text
GET  /api/customers
POST /api/customers
GET  /api/customers/{id}
GET  /api/customers/{id}/ledger
POST /api/customers/{id}/payments
```

## Suppliers

``` text
GET  /api/suppliers
POST /api/suppliers
GET  /api/suppliers/{id}
GET  /api/suppliers/{id}/ledger
GET  /api/suppliers/{id}/bills
POST /api/suppliers/{id}/bills
POST /api/suppliers/{id}/payments
```

## Purchases

``` text
GET  /api/purchases
POST /api/purchases
GET  /api/purchases/{id}
POST /api/purchases/{id}/grn
```

## Invoices

``` text
GET  /api/invoices
GET  /api/invoices/{id}
POST /api/invoices/{id}/print
POST /api/invoices/{id}/pdf
POST /api/invoices/{id}/whatsapp
POST /api/invoices/{id}/email
```

## Inventory

``` text
GET  /api/inventory
POST /api/inventory/adjust
GET  /api/inventory/movements
POST /api/inventory/transfers
```

## Dashboard

``` text
GET /api/dashboard/summary
GET /api/dashboard/sales-trend
GET /api/dashboard/top-products
GET /api/dashboard/stock-status
GET /api/dashboard/payment-breakdown
```

## Reports

``` text
GET /api/reports/sales
GET /api/reports/inventory
GET /api/reports/customers
GET /api/reports/suppliers
GET /api/reports/gst
GET /api/reports/profit
GET /api/reports/expenses
```

## Backups

``` text
POST /api/backups/create
GET  /api/backups
POST /api/backups/{id}/restore
POST /api/backups/google-drive
POST /api/backups/email
```

All APIs must enforce authorization.

------------------------------------------------------------------------

# 51. DATABASE HIGH-LEVEL MODEL

Core tables/entities:

``` text
users
roles
permissions
user_roles
role_permissions

stores
branches

products
product_variants
brands
categories
sizes
colors
barcodes

customers
customer_ledger
customer_payments

suppliers
supplier_bills
supplier_payments
supplier_ledger
supplier_documents

purchase_orders
purchase_order_items
purchases
purchase_items
grn
grn_items

sales
sale_items
invoices
invoice_payments
returns
return_items

inventory
inventory_movements
stock_adjustments
stock_transfers
stock_transfer_items

expenses
expense_categories

cash_shifts
cash_transactions

alterations
alteration_measurements
tailors

discounts
promotions
loyalty_accounts
loyalty_transactions

notifications
whatsapp_messages
email_logs

attachments
audit_logs
backup_logs

system_settings
shortcut_settings
```

Use proper foreign keys, indexes, constraints and transaction
boundaries.

------------------------------------------------------------------------

# 52. DATA INTEGRITY RULES

Important transactions must be atomic.

For a completed sale:

``` text
Sale
 ↓
Invoice
 ↓
Invoice items
 ↓
Stock reduction
 ↓
Customer ledger where applicable
 ↓
Payment record
 ↓
Audit record
```

If a critical transaction fails, it must not leave half-updated stock or
ledger data.

Supplier purchase flow:

``` text
Supplier Bill
 ↓
Purchase
 ↓
GRN
 ↓
Accepted stock
 ↓
Supplier payable
 ↓
Payment
 ↓
Ledger
```

------------------------------------------------------------------------

# 53. FRONTEND STATE MANAGEMENT

Use:

**TanStack Query**

For server state:

-   Products
-   Customers
-   Suppliers
-   Invoices
-   Inventory
-   Reports
-   Dashboard
-   Purchases

Use:

**Zustand**

For client/UI state:

-   POS cart
-   Current branch
-   Current user
-   Shortcut configuration
-   UI preferences
-   Temporary POS state

------------------------------------------------------------------------

# 54. BACKGROUND JOBS

Use Spring Scheduler initially.

Scheduled jobs:

-   Database backup
-   Google Drive backup
-   Backup notifications
-   Payment reminders
-   Low-stock alerts
-   Dead-stock checks
-   Birthday/anniversary messages
-   Scheduled reports
-   Notification retries

For complex job orchestration, Quartz may be added later.

------------------------------------------------------------------------

# 55. FILE STORAGE ARCHITECTURE

Do not store large files directly in normal transactional tables.

Example:

``` text
supplier_bill
 ├── id
 ├── supplier_id
 ├── invoice_number
 ├── amount
 └── attachment_id

attachment
 ├── id
 ├── filename
 ├── storage_key
 ├── mime_type
 ├── size
 └── uploaded_by
```

Storage can be:

-   Local filesystem
-   Oracle-compatible/cloud storage where configured

------------------------------------------------------------------------

# 56. SECURITY REQUIREMENTS

Use:

-   Spring Security
-   JWT
-   Password hashing
-   Role-based access control
-   Permission checks
-   Secure HTTP
-   Input validation
-   API authorization
-   Secure file access
-   Rate limiting where appropriate
-   Audit logging

Never:

-   Store passwords in plain text
-   Store PIN in plain text
-   Put database credentials in React
-   Put WhatsApp/API secrets in frontend
-   Trust frontend-only permission checks

------------------------------------------------------------------------

# 57. DOCKER

Docker is for development, testing and cloud/server deployment. It is NOT required for normal end-user operation if the Windows installer provides the required local services directly.

Provide `docker-compose.yml` for development/cloud support with possible services:

```text
backend
mysql
redis
nginx
```

The Tauri desktop application is packaged separately.

Use environment variables for all credentials and secrets. Never commit real secrets to Git.

# 58. WINDOWS DESKTOP STARTUP

The end-user must NOT need to run a browser, npm, Vite or a Java command manually.

```text
Double-click ClothShopERP.exe
        |
        v
Tauri starts
        |
        v
Local Spring Boot service starts/checks
        |
        v
MySQL connection checked
        |
        v
React desktop UI opens
        |
        v
ERP Login
```

# 59. ORACLE CLOUD

Oracle Cloud is an **optional cloud infrastructure layer**, not the primary application interface.

It may host:

- Cloud backup
- Central synchronization service
- Disaster recovery data
- Optional centralized database
- Optional remote reporting API
- Optional multi-branch services
- Optional document storage

Desktop-to-cloud model:

```text
Windows Desktop
      |
Local MySQL
      |
Sync/Backup Engine
      |
HTTPS/TLS
      |
Oracle Cloud
      |
Cloud Backup / Sync / Reports
```

If synchronization is implemented, use a reliable queue, transaction IDs, sync status, retry logic, conflict detection and audit logs. Cloud failure must never silently delete or corrupt local financial transactions.

# 60. TESTING

## Backend

-   JUnit
-   Mockito
-   Integration tests
-   API tests
-   Security tests
-   Database transaction tests

## Frontend

-   React Testing Library
-   Component tests
-   POS workflow tests
-   Keyboard shortcut tests

## End-to-end

Test:

-   Login
-   Product creation
-   Matrix generation
-   Barcode
-   POS sale
-   Cash payment
-   Credit sale
-   Split payment
-   Invoice generation
-   Invoice edit authorization
-   Return
-   Customer payment
-   Supplier bill
-   Supplier payment
-   Stock update
-   Backup
-   Restore

------------------------------------------------------------------------

# 61. POS PERFORMANCE REQUIREMENTS

POS must be optimized for fast cashier operation.

Requirements:

-   Auto-focused barcode input
-   Minimal mouse dependency
-   Keyboard-first workflow
-   Fast product search
-   Fast cart updates
-   No unnecessary page reload
-   Clear feedback
-   Scanner-compatible input
-   Fast invoice completion
-   Safe offline/local handling where implemented

------------------------------------------------------------------------

# 62. RESPONSIVE UI

Support:

-   Desktop
-   Laptop
-   Large POS monitor
-   Tablet where practical

Desktop/POS is the primary target.

Mobile layout can prioritize management/reporting views rather than
full-speed cashier operation.

------------------------------------------------------------------------

# 63. UI COMPONENT SYSTEM

Build reusable components:

-   KPI Card
-   Trend Indicator
-   Data Table
-   Search Bar
-   Filter Bar
-   Modal
-   Drawer
-   Form
-   Dropdown
-   Date Picker
-   Currency Input
-   Percentage Input
-   Payment Modal
-   Invoice Preview
-   Ledger Table
-   Status Badge
-   Confirmation Dialog
-   PIN Unlock Dialog
-   File Upload
-   Document Viewer
-   Chart Card
-   Empty State
-   Loading State
-   Error State

------------------------------------------------------------------------

# 64. ERROR HANDLING

Frontend:

-   User-friendly error messages
-   Retry
-   Validation messages
-   Network error state
-   Unauthorized state
-   Session expiration

Backend:

-   Global exception handler
-   Standard API error format
-   Logging
-   Validation errors
-   Authentication errors
-   Database errors

Do not expose stack traces to end users.

------------------------------------------------------------------------

# 65. SEARCH AND FILTERING

Major modules must support:

-   Text search
-   Date filtering
-   Status filtering
-   Amount filtering
-   Customer
-   Supplier
-   Branch
-   User
-   Product
-   Category
-   Brand
-   Payment mode

Large lists should use pagination/server-side querying.

------------------------------------------------------------------------

# 66. IMPORT / EXPORT

Import:

-   Products
-   Product variants
-   Opening stock
-   Suppliers
-   Customers
-   Purchases where structured import is supported

Formats:

-   CSV
-   Excel

Export:

-   Reports
-   Products
-   Customers
-   Suppliers
-   Ledgers
-   Invoices
-   Stock
-   Sales

Formats:

-   PDF
-   Excel
-   CSV

------------------------------------------------------------------------

# 67. NOTABLE BUSINESS RULES

1.  Credit sale requires a customer.
2.  Credit limit must be checked.
3.  Excess credit requires authorized approval.
4.  Completed invoice editing requires PIN/permission.
5.  Invoice edits create audit records.
6.  Returns adjust stock.
7.  Customer returns adjust the customer ledger when applicable.
8.  Supplier payments reduce supplier payable.
9.  Supplier purchases increase supplier payable.
10. Cash shifts reconcile expected vs actual cash.
11. Discount type can be ₹ or %.
12. Payment fields depend on payment mode.
13. Supplier bills remain linked to supplier/purchase/GRN.
14. Tax configuration must be configurable.
15. Stock changes must create movement records.
16. Sensitive settings require appropriate permissions.
17. Backup/restore requires administrator authorization.
18. MySQL remains the primary source of truth.

------------------------------------------------------------------------

# 68. FINAL NAVIGATION STRUCTURE

``` text
DASHBOARD

POS / BILLING
├── New Sale
├── Hold Bills
├── Invoices
├── Returns
└── Exchanges

PRODUCTS
├── Style Master
├── Size / Color Matrix
├── Categories
├── Brands
├── Pricing
└── Barcode / Labels

INVENTORY
├── Stock
├── Stock Adjustment
├── Stock Transfer
├── Stock Count
└── Reorder Management

PURCHASES
├── Suppliers
├── Purchase Orders
├── GRN
├── Purchase Bills
└── Supplier Payments

CUSTOMERS
├── Customer Directory
├── Khata / Ledger
├── Payments
├── Returns
└── Loyalty

ACCOUNTING
├── Payments
├── Expenses
├── Cash Management
├── Supplier Payables
└── Day Closing

ALTERATIONS
├── New Alteration
├── Measurements
├── Tailors
└── Ready for Pickup

COMMUNICATIONS
├── WhatsApp
├── Email
├── Notifications
└── Marketing

REPORTS
├── Sales
├── Inventory
├── Customers
├── Suppliers
├── GST
├── Expenses
└── Profit

EMPLOYEES
├── Users
├── Roles
├── Permissions
└── Activity Logs

BACKUP & RESTORE

SETTINGS
├── Store
├── Branches
├── Invoice
├── POS
├── Inventory
├── Tax
├── Security
├── Keyboard & Shortcuts
├── WhatsApp
├── Email
└── Backup

SYSTEM ADMIN
├── Audit Logs
├── System Health
├── Error Logs
├── Background Jobs
└── Version
```

------------------------------------------------------------------------

# 69. ANTIGRAVITY IMPLEMENTATION RULES

When implementing this project in Antigravity:

1.  Treat this file as the master specification.
2.  Do not skip listed modules.
3.  Do not replace Spring Boot with another backend.
4.  Do not replace MySQL with MongoDB.
5.  React must be the primary frontend.
6.  Use REST APIs between frontend and backend.
7.  Keep business logic in Spring Boot.
8.  Keep database access in backend services/repositories.
9.  Keep secrets outside source code.
10. Use migrations for database changes.
11. Use reusable React components.
12. Use reusable Spring services.
13. Do not duplicate business logic in multiple places.
14. Implement real CRUD/API behavior.
15. Avoid placeholder-only pages for required functionality.
16. Implement role and permission checks server-side.
17. Implement audit logs for sensitive operations.
18. Implement PIN protection for invoice editing.
19. Implement supplier bill/document linking.
20. Implement configurable keyboard shortcuts.
21. Implement arrow-key navigation.
22. Implement backup and restore.
23. Implement Google Drive backup integration.
24. Implement email notifications/backup handling.
25. Keep local and Oracle Cloud configuration separate from business
    logic.
26. Provide Docker configuration.
27. Provide Windows startup/installer configuration.
28. Provide API documentation.
29. Add tests for critical transaction flows.
30. Preserve data integrity using database transactions.

------------------------------------------------------------------------

# 69.1 DESKTOP-ONLY IMPLEMENTATION RULE

The application MUST be implemented as a Windows desktop application.

Do NOT make the normal user workflow depend on:

- Chrome
- Edge
- Browser tabs
- Browser print dialogs
- Public web hosting

React is still used, but React is packaged inside Tauri. Spring Boot runs locally for the desktop application. The final end-user product is `ClothShopERP.exe`.

# 70. ACCEPTANCE CRITERIA

The ERP is considered functionally complete only when the following are
working:

-   User login
-   Role permissions
-   Store/branch
-   Product master
-   Size/color matrix
-   SKU generation
-   Barcode generation
-   Label printing
-   POS
-   Barcode scanning
-   Cash payment
-   Credit payment
-   UPI/card/cheque/bank payment
-   Split payment
-   ₹ and % discounts
-   Hold/resume bill
-   Invoice generation
-   Invoice PDF
-   Invoice printing
-   Invoice WhatsApp/email
-   Invoice edit PIN
-   Invoice audit log
-   Sales returns
-   Exchanges
-   Customer ledger
-   Customer payments
-   Supplier management
-   Supplier purchase
-   Supplier bills
-   Supplier bill attachments
-   Supplier ledger
-   Supplier payments
-   Payment-mode-specific fields
-   Purchase orders
-   GRN
-   Stock management
-   Stock adjustment
-   Stock transfer
-   Reorder system
-   Automatic PO generation
-   Expense management
-   Cash management
-   Shift closing
-   Alteration tracking
-   Loyalty
-   WhatsApp
-   Email
-   GST/tax
-   Executive dashboard
-   Reports
-   Employee management
-   Audit logs
-   Keyboard navigation
-   Configurable shortcuts
-   Backup
-   Google Drive backup
-   Email backup notifications
-   Restore
-   Docker
-   Oracle Cloud deployment configuration
-   Windows `.exe` / installer packaging

------------------------------------------------------------------------

# 71. FINAL PROJECT DEFINITION

This project is a **complete Windows desktop garment retail ERP and POS platform**, not a website.

The primary user experience MUST be a Windows desktop application.

## Final architecture

```text
Tauri Desktop Application
        |
React + TypeScript
        |
Local REST communication
        |
Spring Boot
        |
JPA / Hibernate
        |
Local MySQL
```

## Optional infrastructure

```text
Redis
Google Drive
Email
WhatsApp
Oracle Cloud
Docker
```

## Distribution

```text
PRIMARY:
Windows .exe / Installer

OPTIONAL:
Docker for development/cloud
Oracle Cloud for backup/sync/remote services
```

There must be **no browser dependency for normal shop operation**. The shop user installs `ClothShopERP`, opens `ClothShopERP.exe`, logs in and uses POS, Inventory, Customers, Suppliers, Reports and all other modules directly from the desktop application.

The application must continue core local operations when the internet is unavailable.

The UI must combine:

```text
Executive Dashboard
+
High-Speed POS
+
Keyboard-First Navigation
+
Arrow-Key Navigation
+
Configurable Shortcuts
+
Professional ERP Tables
+
KPI Cards
+
Trend Indicators
+
Charts
+
Supplier / Customer Ledgers
+
Secure Invoice Editing
+
Backup & Restore
```

The system must be secure, auditable, configurable, offline-capable for core operations, backup-capable, portable and suitable for future multi-store/cloud synchronization.
