-- Migration: 001_initial_system_setup.sql
-- Description: Create core system tables for multi-tenant ERP
-- Date: 2025-09-13

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscription plans table (system-wide)
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    features JSONB NOT NULL DEFAULT '{}',
    max_users INTEGER,
    max_companies INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create companies table (tenants)
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

-- Create users table (extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('dev', 'owner', 'staff')),
    company_id UUID REFERENCES companies(id),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    position TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Devs can manage subscription plans" ON subscription_plans
    FOR ALL USING (auth.jwt() ->> 'role' = 'dev');
CREATE POLICY "All authenticated users can read active plans" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- RLS Policies for companies  
CREATE POLICY "Devs can manage all companies" ON companies
    FOR ALL USING (auth.jwt() ->> 'role' = 'dev');
CREATE POLICY "Users can read their own company" ON companies
    FOR SELECT USING (id::text = auth.jwt() ->> 'company_id');

-- RLS Policies for users
CREATE POLICY "Devs can manage all users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'dev');
CREATE POLICY "Owners can manage company users" ON users
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'owner' AND 
        company_id::text = auth.jwt() ->> 'company_id'
    );
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Create indexes
CREATE INDEX idx_companies_subscription_plan ON companies(subscription_plan_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features) VALUES
('Starter', 'Basic ERP features for small businesses', 99.00, 'monthly', '{"modules": ["pos", "inventory", "customers"], "max_users": 5}'),
('Professional', 'Complete ERP solution for growing businesses', 199.00, 'monthly', '{"modules": ["pos", "inventory", "customers", "sales", "hr", "finance"], "max_users": 25}'),
('Enterprise', 'Advanced ERP with all features', 399.00, 'monthly', '{"modules": ["pos", "inventory", "customers", "sales", "hr", "finance", "vehicles", "promotions"], "max_users": 100}'),
('Developer', 'System management plan', 0.00, 'lifetime', '{"modules": ["admin"], "max_companies": 1000}');