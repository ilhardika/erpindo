# ERPindo Quickstart Guide

**Project**: Multi-tenant SaaS ERP System  
**Stack**: Next.js 14+ App Router, TypeScript, Supabase, shadcn/ui  
**Generated**: October 12, 2025

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Git for version control
- VS Code with TypeScript and React extensions

## Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd erpindo
npm install
```

### 2. Environment Configuration

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=ERPindo
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Database Setup

Run Supabase migrations to create tables and RLS policies:

```sql
-- Run these in Supabase SQL Editor or via CLI

-- Create tables (see data-model.md for complete schema)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('dev', 'owner', 'staff')),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view based on role" ON users
FOR SELECT USING (
  CASE
    WHEN role = 'dev' THEN true
    WHEN role = 'owner' THEN company_id = auth.jwt() ->> 'company_id'::text
    WHEN role = 'staff' THEN id = auth.uid()
  END
);

-- Continue with other tables...
```

### 4. Seed Initial Data

Create system administrator and default modules:

```sql
-- Insert dev user (system owner)
INSERT INTO users (email, password_hash, role, name, company_id, is_active)
VALUES (
  'admin@erpindo.com',
  crypt('admin123', gen_salt('bf')),
  'dev',
  'System Administrator',
  NULL,
  true
);

-- Insert default modules
INSERT INTO modules (name, slug, category, description, icon, route_path, sort_order) VALUES
-- System modules (dev only)
('Subscription Plan Management', 'subscription-plans', 'system', 'Manage subscription plans', 'CreditCard', '/system/plans', 1),
('Company Management', 'companies', 'system', 'Manage companies', 'Building2', '/system/companies', 2),
('Global User Management', 'global-users', 'system', 'View all users', 'Users', '/system/users', 3),
('System Monitoring', 'monitoring', 'system', 'System health', 'Activity', '/system/monitoring', 4),

-- Company modules (owner only)
('Subscription & Billing', 'billing', 'company', 'Manage billing', 'Receipt', '/company/billing', 1),
('Employee Management', 'employees', 'company', 'Manage employees', 'UserPlus', '/company/employees', 2),
('Company Data & Reporting', 'reports', 'company', 'Company reports', 'BarChart3', '/company/reports', 3),

-- ERP modules (staff)
('Dashboard', 'dashboard', 'erp', 'Main dashboard', 'LayoutDashboard', '/erp/dashboard', 1),
('POS (Cashier)', 'pos', 'erp', 'Point of Sale', 'ShoppingCart', '/erp/pos', 2),
('Sales & Purchasing', 'sales', 'erp', 'Sales management', 'TrendingUp', '/erp/sales', 3),
('Inventory/Warehouse', 'inventory', 'erp', 'Stock management', 'Package', '/erp/inventory', 4),
('Customers & Suppliers', 'contacts', 'erp', 'Contact management', 'Users2', '/erp/contacts', 5),
('Promotions', 'promotions', 'erp', 'Promotion management', 'Tag', '/erp/promotions', 6),
('HR/Employee Management', 'hr', 'erp', 'HR management', 'UserCheck', '/erp/hr', 7),
('Finance', 'finance', 'erp', 'Financial management', 'DollarSign', '/erp/finance', 8),
('Vehicles', 'vehicles', 'erp', 'Vehicle management', 'Truck', '/erp/vehicles', 9),
('Salesman', 'salesman', 'erp', 'Sales tracking', 'UserCog', '/erp/salesman', 10);
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Project Structure Overview

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/login/       # Login page
│   ├── (dashboard)/        # Protected routes
│   │   ├── system/         # Dev modules
│   │   ├── company/        # Owner modules
│   │   └── erp/           # Staff modules
│   └── api/               # API routes
├── components/             # Reusable components
│   ├── ui/                # shadcn/ui components
│   └── modules/           # Module-specific components
├── lib/                   # Utilities
│   ├── supabase/          # DB client & queries
│   └── permissions/       # Access control
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript definitions
```

### 3. Key Development Patterns

**Authentication Check**:

```typescript
// In page components
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function ProtectedPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Component content
}
```

**Permission Checking**:

```typescript
// Custom hook usage
import { usePermissions } from "@/hooks/use-permissions";

export function ModuleComponent() {
  const { hasModuleAccess, canCreate, canUpdate } = usePermissions();

  if (!hasModuleAccess("inventory")) {
    return <AccessDenied />;
  }

  return (
    <div>
      {canCreate("inventory") && <CreateButton />}
      {canUpdate("inventory") && <EditButton />}
    </div>
  );
}
```

**Database Queries**:

```typescript
// Using Supabase client with RLS
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Automatically filtered by RLS policies
const { data: users } = await supabase
  .from('users')
  .select('*')
  .eq('company_id', companyId)
```

### 4. Building for Production

```bash
npm run build
npm run start
```

## Key Features Implementation

### 1. Multi-Tenant Data Isolation

- All database queries automatically filtered by RLS policies
- Company-specific data access enforced at database level
- No cross-tenant data leakage possible

### 2. Role-Based Access Control

- Three-tier hierarchy: Dev → Owner → Staff
- Dynamic module rendering based on role and permissions
- Granular action permissions (read/create/update/delete)

### 3. Subscription Management

- Plan-based module access control
- Automatic permission updates when plans change
- Billing integration ready for payment gateways

### 4. Responsive UI

- shadcn/ui components with consistent design system
- Sidebar navigation with collapsible modules
- Mobile-optimized layouts

## Next Steps

1. **Complete Database Schema**: Implement all tables from `data-model.md`
2. **Authentication Flow**: Build login/logout with session management
3. **Dashboard Layout**: Create sidebar with role-based module display
4. **Module Implementation**: Start with highest priority user stories
5. **Permission System**: Implement granular access control
6. **Deployment**: Set up Vercel deployment with environment variables

## Troubleshooting

**Common Issues**:

- Supabase connection: Check environment variables and network access
- RLS policies: Ensure user context is properly set in auth
- Module access: Verify user role and company associations
- Type errors: Check TypeScript errors in VS Code or during build

**Support Resources**:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- Project specifications in `/specs/002-erp-system-saas/`
