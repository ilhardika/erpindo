# ERP System (SaaS) - ERPindo

## Overview

ERPindo adalah ERP System (SaaS) yang memungkinkan dashboard hanya menampilkan modul/fitur sesuai dengan role dan hak akses yang diatur oleh owner perusahaan.

## Updated Role Structure

### 1. Dev (System Owner/App Provider)

- **Akses**: System Owner - mengelola seluruh aplikasi dan semua perusahaan, dan memberikan hak akses login dan module ke owner perusahan sesuai dengan plan yang dipilih
- **Kategori Modul**: System Management (4 modul)
- **module**:
  - **Subscription Plan Management**: Create, update, delete plans dengan pricing dan features, period payment
  - **Company Management**: Add/manage registered companies, activate/deactivate accounts, create/edit owner company account
  - **Global User Management**: View all registered users (owners dan staff) across companies
  - **System Monitoring**: View subscription status, usage analytics, system health

### 2. Owner (Company Owner)

- **Akses**: Company Owner - akses modul yang diberikan oleh dev, sesuai dengan plan yg dipiliuh
- **Kategori Modul**: Company Management (3 modul)
- **module**:
  - **Subscription & Billing**: View/manage subscription plan, payments, billing history, change plan,
  - **Employee Management**: Add/edit/remove employees, create/edit staff account, assign roles dan module access
  - **Company Data & Reporting**: View company-wide reports (sales, inventory, finance)

### 3. Staff (Employee)

- **Akses**: Employee - akses terbatas sesuai permissions dari Owner
- **Kategori Modul**: ERP Modules only (10 modul total)
- **module**: ERP Module dengan akses yg diberikan oleh owner

### ERP Modules (Staff - 10 Modules)

1. **Dashboard** - Role-based main dashboard
2. **POS (Cashier)** - Point of Sale dengan payment processing
3. **Sales & Purchasing** - Sales Orders, Purchase requests, Invoices
4. **Inventory/Warehouse** - Stock management, transfers, stock opname
5. **Customers & Suppliers** - Customer segmentation, supplier management
6. **Promotions** - Discount management, bundling promotions
7. **HR/Employee Management** - Employee records, attendance, salary
8. **Finance** - Cash transactions, journal entries, financial reports
9. **Vehicles** - Vehicle management, delivery assignments
10. **Salesman** - Commission tracking, top products/customers

## Key Features Implemented

### Detailed Permission System

- **Role-based action permissions** yang sangat spesifik
- **Category-based module organization** (system/company/erp)

### UI/UX Improvements

- shadcn ui white primary and black secondary
- icons use lucide icons
- modern and minimalist ui
- Responsive dan mobile-friendly
- sidebar dashboard navigation layout
