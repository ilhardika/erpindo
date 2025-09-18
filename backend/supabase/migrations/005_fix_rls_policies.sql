-- Fix RLS policies for demo mode compatibility
-- This migration updates RLS policies to work with both real auth and demo mode

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Company users can manage their customers" ON customers;
DROP POLICY IF EXISTS "Company users can manage their suppliers" ON suppliers;
DROP POLICY IF EXISTS "Company users can manage their employees" ON employees;
DROP POLICY IF EXISTS "Company users can manage their products" ON products;

-- Create more flexible RLS policies that work with both real auth and demo mode
-- These policies check both JWT claims and user metadata

-- Customers RLS policy
CREATE POLICY "Multi-tenant customers access" ON customers
    FOR ALL USING (
        -- Check if company_id matches JWT claim (real auth)
        company_id::text = COALESCE(auth.jwt() ->> 'company_id', '')
        OR
        -- Check if company_id matches user metadata (demo mode fallback)
        company_id::text = COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'tenant_id', '')
        OR
        -- Allow if user is dev role (admin access)
        COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'role', '') = 'dev'
        OR
        -- Fallback: allow if user is authenticated and company_id matches their tenant
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data ->> 'tenant_id' = company_id::text
        ))
    );

-- Suppliers RLS policy
CREATE POLICY "Multi-tenant suppliers access" ON suppliers
    FOR ALL USING (
        company_id::text = COALESCE(auth.jwt() ->> 'company_id', '')
        OR
        company_id::text = COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'tenant_id', '')
        OR
        COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'role', '') = 'dev'
        OR
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data ->> 'tenant_id' = company_id::text
        ))
    );

-- Employees RLS policy
CREATE POLICY "Multi-tenant employees access" ON employees
    FOR ALL USING (
        company_id::text = COALESCE(auth.jwt() ->> 'company_id', '')
        OR
        company_id::text = COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'tenant_id', '')
        OR
        COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'role', '') = 'dev'
        OR
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data ->> 'tenant_id' = company_id::text
        ))
    );

-- Products RLS policy  
CREATE POLICY "Multi-tenant products access" ON products
    FOR ALL USING (
        company_id::text = COALESCE(auth.jwt() ->> 'company_id', '')
        OR
        company_id::text = COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'tenant_id', '')
        OR
        COALESCE((auth.jwt() ->> 'user_metadata')::json ->> 'role', '') = 'dev'
        OR
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data ->> 'tenant_id' = company_id::text
        ))
    );

-- For demo mode, temporarily disable RLS (remove this in production)
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY; 
-- ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;