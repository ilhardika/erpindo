# ERP System Blueprint (SaaS)

## Role Hierarchy & Access Flow

### 1. Superadmin (Project Owner)

- Has a dedicated dashboard to manage:
  - All registered companies (owners) in the system.
  - Payment status of each company (paid/unpaid).
  - Activation or deactivation of company accounts.
- Can grant login access to new company owners.
- Can view high-level usage and subscription data.
- Cannot directly manage employee-level data within companies.

### 2. Company Owner

- Functions similarly to a superadmin but restricted to their own company.
- Can:
  - View company-wide reports.
  - Manage employees, including:
    - Adding, updating, and removing employee accounts.
    - Assigning module access rights.
    - Granting login access to employees.
- Cannot view or manage other companies.

### 3. Employee

- Access to ERP modules is determined by permissions set by the company owner.
- Can perform tasks within assigned modules.
- Cannot manage employee accounts or change module permissions.

---

## Unified Dashboard Flow

- All roles log in via `/dashboard`.
- Displayed modules and features are dynamically loaded based on:
  - Role (Superadmin, Company Owner, Employee).
  - Permissions granted by the higher role.
- No third-party API integrations except for database API.
- All data entry and processing are handled manually in the system.

---

## ERP Modules & Features (Employee-Level Access)

### POS (Cashier)

- Add items to cart (manual barcode input).
- Apply discounts and calculate totals.
- Manual payment options: cash, bank transfer, simulated QR.
- Generate and download invoices (PDF).
- Process refunds.
- Open and close cashier shifts daily.

### Sales & Purchasing

- Create sales orders (SO).
- Require admin approval for purchases.
- Receive goods into inventory.
- Generate invoices and receipts.
- View sales analysis by period or salesperson.

### Inventory / Warehouse

- Manage products and stock levels.
- Buffer stock zones and inter-location transfers.
- Perform manual stock opname.
- View stock mutation and adjustment history.

### Customers & Suppliers

- Manage customer segmentation.
- Add or edit customer and supplier information.
- View purchase and payment history.

### Promotions

- Create and manage tiered or nominal discounts.
- Set bundling promotions (e.g., buy X get Y).
- Define promo duration and terms.

### HR / Employee Management

- Create and update employee records.
- Submit manual attendance.
- Generate static/manual salary slips.

### Finance

- Record cash in/out transactions.
- Create manual journal entries.
- View general ledger.
- Generate financial reports (balance sheet, profit & loss).

### Vehicles

- Manage vehicles and license plates.
- Assign vehicles to delivery or field sales tasks.

### Salesman

- Track commissions.
- View top products sold.
- View top recurring customers.
