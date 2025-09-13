-- Test file: test_rls_policies.sql
-- Description: Test Row Level Security policies for multi-tenancy
-- Run these tests to verify data isolation between companies

-- Test setup: Create test companies and users
INSERT INTO companies (id, name, email, subscription_plan_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Test Company A', 'companya@test.com', (SELECT id FROM subscription_plans WHERE name = 'Professional')),
('22222222-2222-2222-2222-222222222222', 'Test Company B', 'companyb@test.com', (SELECT id FROM subscription_plans WHERE name = 'Professional'));

-- Test data isolation
INSERT INTO customers (company_id, name, email) VALUES
('11111111-1111-1111-1111-111111111111', 'Customer A1', 'customer.a1@test.com'),
('22222222-2222-2222-2222-222222222222', 'Customer B1', 'customer.b1@test.com');

-- These queries should be run with different JWT contexts to verify isolation:
-- 1. User from Company A should only see Customer A1
-- 2. User from Company B should only see Customer B1
-- 3. Dev user should see both customers

-- Test query (should return different results based on JWT company_id):
-- SELECT * FROM customers;