# Tasks: ERP System (SaaS) MVP

**Input**: Design documents from `/specs/001-erp-system-saas/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Tech stack: React + TypeScript + Supabase + shadcn/ui
   → Structure: Web app (frontend/ + backend/supabase configuration)
2. Load design documents:
   → data-model.md: 14 entities with multi-tenant architecture
   → contracts/: 4 migration files + RLS policies + test file
   → research.md: PWA, offline-first, role-based routing decisions
3. Generate MVP tasks focusing on core functionality:
   → Setup: Supabase + React project initialization
   → Tests: Authentication, multi-tenancy, basic POS flow
   → Core: Auth system, dashboard, basic POS module
   → Integration: RLS policies, real-time subscriptions
   → Polish: PWA features, Indonesian UI, testing
4. Apply MVP principles:
   → Focus on core user journeys (login → dashboard → basic POS)
   → Defer advanced modules (HR, Finance, Vehicles, etc.)
   → Implement minimal viable features for each role
5. Number tasks sequentially with TDD approach
6. Mark parallel tasks for efficient development
```

## MVP Scope Definition

**Core Features for MVP:**

- ✅ Multi-tenant authentication (Dev/Owner/Staff roles)
- ✅ Role-based dashboard with navigation
- ✅ Basic POS module (add items, calculate total, simple receipt)
- ✅ Basic product management (CRUD operations)
- ✅ Basic customer management
- ✅ Company management (for Dev role)

**Deferred for v2:**

- Advanced ERP modules (HR, Finance, Vehicles, Promotions)
- Offline-first PWA capabilities
- Advanced reporting and analytics
- Real-time collaborative features

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Project Setup & Infrastructure

- [x] T001 Create React TypeScript project with Vite in `frontend/`
- [x] T002 [P] Install and configure dependencies: @supabase/supabase-js, zustand, react-hook-form, zod, shadcn/ui, tailwindcss
- [x] T003 [P] Setup Supabase project and configure environment variables in `frontend/.env.local`
- [x] T004 [P] Configure Tailwind CSS with shadcn/ui components in `frontend/tailwind.config.js`
- [x] T005 [P] Setup ESLint and Prettier configuration in `frontend/.eslintrc.js` and `frontend/prettier.config.js`
- [x] T006 [P] Initialize Supabase CLI and create migration structure in `backend/supabase/`

## Phase 3.2: Database & Multi-Tenancy Setup

- [x] T007 [P] Apply database migration 001_initial_system_setup.sql (subscription_plans, companies, users tables)
- [x] T008 [P] Apply database migration 002_business_entities.sql (customers, suppliers, employees, products tables)
- [x] T009 [P] Apply database migration 003_sales_transactions.sql (sales_orders, invoices tables for MVP)
- [x] T010 [P] Verify Row-Level Security policies with test data using test_rls_policies.sql
- [x] T011 [P] Seed database with default subscription plans and test company data

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Authentication & Multi-Tenancy Tests

- [x] T012 [P] Authentication flow test in `frontend/src/__tests__/auth/login.test.tsx`
- [x] T013 [P] Role-based routing test in `frontend/src/__tests__/auth/protected-routes.test.tsx`
- [x] T014 [P] Multi-tenant data isolation test in `frontend/src/__tests__/tenant/isolation.test.tsx`
- [x] T015 [P] User permissions validation test in `frontend/src/__tests__/permissions/system.test.tsx`

### Core Feature Tests

- [x] T016 [P] Product CRUD operations test in `frontend/src/__tests__/modules/products.test.tsx`
- [x] T017 [P] Customer management test in `frontend/src/__tests__/modules/customers.test.tsx`
- [x] T018 [P] Basic POS flow test in `frontend/src/__tests__/modules/pos.test.tsx`
- [x] T019 [P] Dashboard navigation test in `frontend/src/__tests__/layout/dashboard.test.tsx`

### Integration Tests

- [x] T020 [P] Supabase client integration test in `frontend/src/__tests__/integration/supabase.test.tsx`
- [x] T021 [P] RLS policy enforcement test in `frontend/src/__tests__/integration/rls.test.tsx`
- [x] T022 [P] End-to-end user journey test in `frontend/src/__tests__/e2e/user-journey.test.tsx`

## Phase 3.4: Core Implementation (ONLY after tests are failing)

### Authentication System

- [ ] T023 [P] Supabase client configuration in `frontend/src/lib/supabase.ts`
- [ ] T024 [P] Authentication store with Zustand in `frontend/src/stores/authStore.ts`
- [ ] T025 [P] Login form component in `frontend/src/components/auth/LoginForm.tsx`
- [ ] T026 [P] Protected route wrapper component in `frontend/src/components/auth/ProtectedRoute.tsx`
- [ ] T027 [P] Role-based route components in `frontend/src/components/auth/RoleRoutes.tsx`

### Layout & Navigation

- [ ] T028 [P] Dashboard layout component in `frontend/src/components/layout/DashboardLayout.tsx`
- [ ] T029 [P] Sidebar navigation with role-based menu in `frontend/src/components/layout/Sidebar.tsx`
- [ ] T030 [P] Header component with user profile in `frontend/src/components/layout/Header.tsx`
- [ ] T031 [P] Route configuration with protection in `frontend/src/routes/index.tsx`

### Data Layer & Types

- [ ] T032 [P] TypeScript interfaces for all entities in `frontend/src/types/database.ts`
- [ ] T033 [P] Supabase database hooks in `frontend/src/hooks/useDatabase.ts`
- [ ] T034 [P] Custom hooks for data fetching in `frontend/src/hooks/useSupabaseQuery.ts`
- [ ] T035 [P] Error handling utilities in `frontend/src/lib/errorHandling.ts`

### Core Modules - Products

- [ ] T036 [P] Product data store with Zustand in `frontend/src/stores/productStore.ts`
- [ ] T037 [P] Product list component in `frontend/src/components/modules/products/ProductList.tsx`
- [ ] T038 [P] Product form component in `frontend/src/components/modules/products/ProductForm.tsx`
- [ ] T039 Product CRUD operations service in `frontend/src/services/productService.ts`
- [ ] T040 Product management page in `frontend/src/pages/products/ProductsPage.tsx`

### Core Modules - Customers

- [ ] T041 [P] Customer data store in `frontend/src/stores/customerStore.ts`
- [ ] T042 [P] Customer list component in `frontend/src/components/modules/customers/CustomerList.tsx`
- [ ] T043 [P] Customer form component in `frontend/src/components/modules/customers/CustomerForm.tsx`
- [ ] T044 Customer service operations in `frontend/src/services/customerService.ts`
- [ ] T045 Customer management page in `frontend/src/pages/customers/CustomersPage.tsx`

### Core Modules - Basic POS

- [ ] T046 [P] POS store for cart management in `frontend/src/stores/posStore.ts`
- [ ] T047 [P] Product search component in `frontend/src/components/modules/pos/ProductSearch.tsx`
- [ ] T048 [P] Shopping cart component in `frontend/src/components/modules/pos/ShoppingCart.tsx`
- [ ] T049 [P] Payment interface component in `frontend/src/components/modules/pos/PaymentInterface.tsx`
- [ ] T050 POS transaction service in `frontend/src/services/posService.ts`
- [ ] T051 POS page with complete flow in `frontend/src/pages/pos/POSPage.tsx`

### Dashboard & Analytics

- [ ] T052 [P] Dashboard widgets component in `frontend/src/components/dashboard/DashboardWidgets.tsx`
- [ ] T053 [P] Basic analytics calculations in `frontend/src/services/analyticsService.ts`
- [ ] T054 Role-specific dashboard pages in `frontend/src/pages/dashboard/`

## Phase 3.5: Integration & Polish

### Multi-Tenancy & Security

- [ ] T055 [P] Company management for Dev role in `frontend/src/components/admin/CompanyManagement.tsx`
- [ ] T056 [P] User management for Owner role in `frontend/src/components/admin/UserManagement.tsx`
- [ ] T057 JWT token validation and refresh logic in `frontend/src/lib/auth.ts`
- [ ] T058 Implement proper error boundaries in `frontend/src/components/ErrorBoundary.tsx`

### UI/UX Improvements

- [ ] T059 [P] Indonesian language translations in `frontend/src/lib/i18n.ts`
- [ ] T060 [P] Loading states and skeleton components in `frontend/src/components/ui/LoadingStates.tsx`
- [ ] T061 [P] Toast notifications system in `frontend/src/components/ui/Toast.tsx`
- [ ] T062 [P] Responsive design improvements for mobile in `frontend/src/styles/mobile.css`

### Data Validation & Forms

- [ ] T063 [P] Zod validation schemas in `frontend/src/lib/validationSchemas.ts`
- [ ] T064 [P] Form utilities and hooks in `frontend/src/hooks/useForm.ts`
- [ ] T065 Data synchronization and offline handling in `frontend/src/lib/sync.ts`

### Testing & Quality

- [ ] T066 [P] Unit tests for stores in `frontend/src/stores/__tests__/`
- [ ] T067 [P] Unit tests for services in `frontend/src/services/__tests__/`
- [ ] T068 [P] Component unit tests in `frontend/src/components/__tests__/`
- [ ] T069 [P] Performance optimization and code splitting in `frontend/src/lib/performance.ts`
- [ ] T070 [P] Update documentation in `docs/mvp-guide.md`

## Dependencies & Critical Path

### Sequential Dependencies

1. **Setup (T001-T006)** → **Database (T007-T011)** → **Tests (T012-T022)** → **Implementation (T023+)**
2. **Auth System (T023-T027)** → **Layout (T028-T031)** → **Modules (T036+)**
3. **Data Layer (T032-T035)** → **All module implementations**
4. **Product Module (T036-T040)** → **POS Module (T046-T051)**
5. **Customer Module (T041-T045)** → **POS Module (T046-T051)**

### Parallel Execution Groups

```bash
# Group 1: Setup (can run simultaneously)
T002, T004, T005, T006

# Group 2: Database migrations (independent)
T007, T008, T009, T010, T011

# Group 3: Test writing (different modules)
T012, T013, T016, T017, T018, T019, T020, T021

# Group 4: Component development (different features)
T025, T026, T029, T030, T037, T038, T042, T043, T047, T048

# Group 5: Store and service creation (different domains)
T024, T036, T041, T046, T053, T059, T060, T061
```

## MVP Success Criteria

### Core Functionality

- [ ] Dev user can create companies and manage subscription plans
- [ ] Owner user can login, manage basic company data, add employees
- [ ] Staff user can access POS system and process simple sales
- [ ] All users see role-appropriate navigation and features
- [ ] Data isolation between companies is enforced

### Technical Requirements

- [ ] Multi-tenant architecture with RLS policies working
- [ ] Authentication and authorization system functional
- [ ] Basic POS flow: select products → calculate total → record sale
- [ ] Product and customer CRUD operations working
- [ ] Responsive design working on desktop and mobile
- [ ] Indonesian language interface implemented

### Quality Gates

- [ ] All tests passing (unit, integration, e2e)
- [ ] No console errors in production build
- [ ] Page load times under 3 seconds
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive on common screen sizes
- [ ] Basic error handling and user feed

## Notes for Development

- **Follow TDD strictly**: Write failing tests before any implementation
- **One task per commit**: Each completed task should be a separate commit
- **Review RLS policies**: Ensure every database query respects multi-tenancy
- **Indonesian UI**: All user-facing text should be in Bahasa Indonesia
- **Mobile-first**: Design components mobile-first, then enhance for desktop
- **shadcn/ui first**: Use shadcn/ui components as base, customize as needed

## Post-MVP Roadmap

After MVP completion, consider these features for v2:

- Real-time synchronization across users
- Advanced ERP modules (HR, Finance, Vehicles)
- Offline-first PWA capabilities
- Advanced reporting and dashboards
- Bulk operations and data import/export
- Mobile apps (React Native)
- Advanced permission system
- Multi-language support beyond Indonesian
