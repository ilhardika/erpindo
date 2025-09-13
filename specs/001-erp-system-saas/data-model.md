# Data Model & Database Schema

**Date**: September 13, 2025  
**Feature**: ERP System (SaaS) with Multi-Tenant Architecture  
**Phase**: 1 - Data Model Design

## Overview

This document defines the complete data model for the multi-tenant ERP system, including Supabase table schemas, relationships, and Row-Level Security policies for proper tenant isolation.

## Core Principles

1. **Multi-Tenancy**: Every business entity includes `company_id` for tenant isolation
2. **Role-Based Access**: Data access controlled by user roles (dev, owner, staff)
3. **Audit Trail**: Created/updated timestamps and user tracking for all entities
4. **Data Integrity**: Foreign key constraints and check constraints for business rules
5. **Scalability**: Indexed columns for performance, normalized design

## Entity Relationship Diagram

```
System Level:
subscription_plans → companies → users
                         ↓
Business Level:
companies → customers, suppliers, employees, vehicles
     ↓
Operational Level:
products, transactions, invoices, promotions, reports
```

## Core System Entities

### 1. Subscription Plans (System-wide)

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    features JSONB NOT NULL DEFAULT '{}', -- Available modules/features
    max_users INTEGER,
    max_companies INTEGER, -- For dev plans
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only devs can manage subscription plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Devs can manage subscription plans" ON subscription_plans
    FOR ALL USING (auth.jwt() ->> 'role' = 'dev');
CREATE POLICY "All authenticated users can read active plans" ON subscription_plans
    FOR SELECT USING (is_active = true);
```

### 2. Companies (Tenants)

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    business_type TEXT,
    logo_url TEXT,
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'trial')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS: Devs see all, users see only their company
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Devs can manage all companies" ON companies
    FOR ALL USING (auth.jwt() ->> 'role' = 'dev');
CREATE POLICY "Users can read their own company" ON companies
    FOR SELECT USING (id::text = auth.jwt() ->> 'company_id');
```

### 3. Users (Authentication & Roles)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('dev', 'owner', 'staff')),
    company_id UUID REFERENCES companies(id),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    position TEXT,
    permissions JSONB DEFAULT '{}', -- Module permissions for staff
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS: Role-based access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Devs can manage all users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'dev');
CREATE POLICY "Owners can manage company users" ON users
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'owner' AND
        company_id::text = auth.jwt() ->> 'company_id'
    );
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (id = auth.uid());
```

## Business Entities

### 4. Customers

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    customer_type TEXT DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale')),
    tax_number TEXT,
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 0, -- Days
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS: Company-level isolation
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their customers" ON customers
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

### 5. Suppliers

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    contact_person TEXT,
    tax_number TEXT,
    payment_terms INTEGER DEFAULT 30, -- Days
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS: Company-level isolation
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their suppliers" ON suppliers
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

### 6. Employees

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    user_id UUID REFERENCES auth.users(id), -- Link to user account if has access
    employee_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    position TEXT,
    department TEXT,
    hire_date DATE,
    salary DECIMAL(12,2),
    employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, employee_number)
);

-- RLS: Company-level isolation
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their employees" ON employees
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

## Product & Inventory Entities

### 7. Products

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    sku TEXT NOT NULL,
    barcode TEXT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    brand TEXT,
    unit_of_measure TEXT DEFAULT 'pcs',
    cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    location TEXT, -- Warehouse location
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, sku)
);

-- RLS: Company-level isolation
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their products" ON products
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

### 8. Stock Movements

```sql
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    product_id UUID NOT NULL REFERENCES products(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    reference_type TEXT, -- 'sale', 'purchase', 'adjustment', 'transfer'
    reference_id UUID, -- Reference to sale/purchase/etc
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS: Company-level isolation
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can view their stock movements" ON stock_movements
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

## Sales & Transaction Entities

### 9. Sales Orders

```sql
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    order_number TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    salesperson_id UUID REFERENCES employees(id),
    order_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, order_number)
);

-- RLS: Company-level isolation
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their sales orders" ON sales_orders
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

### 10. Sales Order Items

```sql
CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Company-level isolation
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their sales order items" ON sales_order_items
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

### 11. Invoices

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    invoice_number TEXT NOT NULL,
    sales_order_id UUID REFERENCES sales_orders(id),
    customer_id UUID REFERENCES customers(id),
    invoice_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, invoice_number)
);

-- RLS: Company-level isolation
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their invoices" ON invoices
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

## Finance Entities

### 12. Transactions

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    transaction_number TEXT NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    category TEXT,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check')),
    reference_type TEXT, -- 'invoice', 'purchase', 'salary', 'manual'
    reference_id UUID,
    account_from TEXT,
    account_to TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, transaction_number)
);

-- RLS: Company-level isolation
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their transactions" ON transactions
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

## Additional Entities

### 13. Vehicles

```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    license_plate TEXT NOT NULL,
    vehicle_type TEXT,
    brand TEXT,
    model TEXT,
    year INTEGER,
    capacity TEXT,
    driver_id UUID REFERENCES employees(id),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'inactive')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id, license_plate)
);

-- RLS: Company-level isolation
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their vehicles" ON vehicles
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

### 14. Promotions

```sql
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    promotion_type TEXT NOT NULL CHECK (promotion_type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
    discount_value DECIMAL(10,2),
    min_purchase_amount DECIMAL(12,2),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    applicable_products JSONB, -- Product IDs or categories
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS: Company-level isolation
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their promotions" ON promotions
    FOR ALL USING (company_id::text = auth.jwt() ->> 'company_id');
```

## Indexes for Performance

```sql
-- Company-based queries (most common)
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_sales_orders_company_id ON sales_orders(company_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_transactions_company_id ON transactions(company_id);

-- Lookup performance
CREATE INDEX idx_products_sku ON products(company_id, sku);
CREATE INDEX idx_products_barcode ON products(company_id, barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_sales_orders_number ON sales_orders(company_id, order_number);
CREATE INDEX idx_invoices_number ON invoices(company_id, invoice_number);

-- Date-based queries
CREATE INDEX idx_sales_orders_date ON sales_orders(company_id, order_date);
CREATE INDEX idx_transactions_date ON transactions(company_id, transaction_date);
CREATE INDEX idx_stock_movements_date ON stock_movements(company_id, created_at);

-- Status queries
CREATE INDEX idx_sales_orders_status ON sales_orders(company_id, status);
CREATE INDEX idx_invoices_payment_status ON invoices(company_id, payment_status);
```

## Data Validation Rules

### Business Rules

1. **Stock cannot go negative**: Implemented via triggers
2. **Invoice total must match line items**: Calculated fields with validation
3. **Subscription features restrict access**: Enforced at application level
4. **Company isolation**: Enforced via RLS policies

### Triggers

```sql
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (Repeat for other tables)
```

## Migration Strategy

1. **Phase 1**: Core system tables (subscription_plans, companies, users)
2. **Phase 2**: Master data tables (customers, suppliers, employees, products)
3. **Phase 3**: Transactional tables (sales_orders, invoices, transactions)
4. **Phase 4**: Additional features (vehicles, promotions, stock_movements)

Each migration includes:

- Table creation
- RLS policies
- Indexes
- Sample data for testing
- Rollback procedures
