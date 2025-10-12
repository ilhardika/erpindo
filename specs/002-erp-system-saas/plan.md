# Implementation Plan: ERP System (SaaS) - ERPindo

**Branch**: `002-erp-system-saas` | **Date**: October 12, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-erp-system-saas/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

ERPindo is a multi-tenant SaaS ERP system with hierarchical role-based access control (System Owner → Company Owner → Staff), supporting 17 modules across system management, company management, and core ERP functionality. Built with Next.js App Router, TypeScript, Supabase, and shadcn/ui for modern, scalable SaaS architecture.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14+ (App Router)  
**Primary Dependencies**: Next.js, React 18+, Supabase JS Client, shadcn/ui, Tailwind CSS, Lucide React  
**Storage**: Supabase (PostgreSQL) with Row Level Security for multi-tenant data isolation  
**Testing**: Manual testing and development validation only  
**Target Platform**: Web application (desktop + mobile responsive), deployed on Vercel  
**Project Type**: Web application (Next.js full-stack)  
**Performance Goals**: <3s dashboard load, <30s permission updates, support 100 companies with 50 users each  
**Constraints**: 99.9% uptime, <5min subscription changes, complete data isolation between tenants  
**Scale/Scope**: Initial target 20-200 companies, 17 total modules, hierarchical auth without email verification

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Initial Check (Pre-Phase 0):

✅ **Clean Code & DRY**: Plan follows modular component architecture with reusable hooks and services  
✅ **KISS & SOLID**: Single-purpose components, clear separation between UI/logic/data layers  
✅ **Separation of Concerns**: UI components (src/components), business logic (src/lib), data (Supabase layer)  
✅ **Scalability & Reusability**: Modular architecture supports multi-tenant scaling and component reuse  
✅ **YAGNI & Consistency**: Building only specified 17 modules, consistent naming and structure  
✅ **Tech Stack Compliance**: Next.js + TypeScript + Supabase + shadcn/ui + Lucide icons as specified  
✅ **Code Reuse Policy**: Architecture promotes checking existing components before creating new ones  
✅ **Multi-Tenant Architecture**: RLS-based data isolation with hierarchical role management

### Post-Phase 1 Design Check:

✅ **API Design Follows REST Conventions**: Standard HTTP methods, clear resource endpoints, proper status codes  
✅ **Database Design Normalizes Properly**: Entities follow 3NF, relationships clearly defined, RLS policies implemented  
✅ **Component Structure Promotes Reuse**: Modular UI components, shared hooks, utility functions in lib/  
✅ **Authentication Follows Security Best Practices**: Bcrypt hashing, hierarchical account creation, session management  
✅ **Multi-Tenant Isolation Verified**: RLS policies prevent cross-company data access, proper filtering at DB level

**GATE STATUS**: ✅ PASSED - All constitutional requirements met through Phase 1

## Project Structure

### Documentation (this feature)

```
specs/002-erp-system-saas/
├── plan.md              # This file - Complete implementation plan
├── research.md          # Technical research and decisions
├── data-model.md        # Database schema and RLS policies
├── quickstart.md        # Development setup guide
├── tasks.md             # Detailed task breakdown by phase
├── contracts/           # API specifications
│   └── api-spec.yaml    # OpenAPI 3.0 contract
└── checklists/          # Quality validation checklists
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth group routes
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/      # Main dashboard
│   │   ├── system/         # System Owner modules (4)
│   │   ├── company/        # Company Owner modules (3)
│   │   ├── erp/           # Staff ERP modules (10)
│   │   └── layout.tsx     # Dashboard layout with sidebar
│   ├── api/               # API routes for auth & data
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   ├── modules/          # Module-specific components
│   └── layout/           # Layout components (sidebar, header)
├── lib/                  # Utilities and configurations
│   ├── auth/             # Authentication utilities
│   ├── supabase/         # Supabase client & queries
│   ├── permissions/      # Role & permission utilities
│   ├── utils.ts          # General utilities
│   └── constants.ts      # App constants
├── hooks/                # Custom React hooks
│   ├── use-auth.ts      # Authentication hook
│   ├── use-permissions.ts # Permission management hook
│   └── use-modules.ts   # Module access hook
├── types/                # TypeScript type definitions
│   ├── auth.ts          # Auth types
│   ├── database.ts      # Database types
│   └── modules.ts       # Module types
└── assets/              # Static assets
```

**Structure Decision**: Next.js App Router web application structure selected. This supports the multi-tenant SaaS architecture with route-based module organization, clear separation of concerns between UI components, business logic, and data access layers, and follows the specified tech stack requirements.

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

_No constitutional violations requiring justification_

## Phase 0 & 1 Completion Summary

**Phase 0 - Research Completed**: ✅

- Authentication strategy defined (custom email/password, hierarchical creation)
- Multi-tenant architecture researched (Supabase RLS with company_id isolation)
- Role-based permissions designed (granular module-permission matrix)
- State management approach selected (React Context + Supabase realtime)
- UI architecture confirmed (shadcn/ui with responsive sidebar layout)
- Performance strategy outlined (route-based code splitting, lazy loading)

**Phase 1 - Design & Contracts Completed**: ✅

- **Data Model**: 7 core entities with proper relationships, validation rules, and state transitions
- **API Contracts**: RESTful endpoints with OpenAPI specification for all user actions
- **Agent Context**: GitHub Copilot instructions updated with tech stack and project structure
- **Quickstart Guide**: Comprehensive setup and development workflow documentation

**Generated Artifacts**:

- `/research.md` - Technical decisions with rationales
- `/data-model.md` - Complete database schema with RLS policies
- `/contracts/api-spec.yaml` - OpenAPI 3.0 specification
- `/quickstart.md` - Development setup and workflow guide
- `/.github/copilot-instructions.md` - Updated agent context

**Ready for Implementation**: The implementation plan is complete and ready for development execution.

## 🧭 Development Roadmap (Implementation Phases)

### Phase 0 — Pre-Requisites (Setup & Validation)

**Status**: 🎯 **CURRENT FOCUS**  
**Goal**: Pastikan semua environment dan tools siap sebelum development dimulai.

**Tasks**:

- ✅ Verify project setup (Next.js, Tailwind CSS, shadcn/ui, Lucide React)
- 🔄 Connect Supabase (MCP server) dan cek koneksi database
- 🔄 Setup .env.local dengan credentials Supabase
- 🔄 Ensure folder structure clean: /components, /modules, /lib, /hooks, /utils
- ⏳ Setup ESLint, Prettier, dan commit convention (lint-staged + husky)
- ✅ Verify DRY, KISS, SOLID, YAGNI, dan Separation of Concerns principles are enforced
- ⏳ Confirm shadcn/ui component directory dan consistent naming convention

**Prerequisites Met**: Project architecture designed, data model defined, API contracts specified

---

### Phase 1 — Authentication & Role-Based Dashboard

**Goal**: Implementasi sistem login dan dashboard yang berbeda untuk setiap role.

**Roles**:

- **Dev** – akses penuh ke seluruh sistem & modul
- **Owner** – akses terbatas ke modul perusahaan
- **Staff** – akses dasar untuk operasional harian

**Tasks**:

- Setup Supabase Auth (email/password)
- Create Role & Permission tables di Supabase
- Implement server-side role-based route protection
- Generate dashboard layout untuk tiap role:
  - `DashboardDev` (4 system modules)
  - `DashboardOwner` (3 company modules)
  - `DashboardStaff` (10 ERP modules)
- Setup sidebar & topbar navigation yang menyesuaikan role
- Dummy data testing untuk validasi hak akses

**Output**: Bisa login sebagai Dev / Owner / Staff, dan melihat dashboard sesuai hak akses

**Route Structure**:

```
/login                    # Authentication page
/dashboard/system/*       # Dev modules (4)
/dashboard/company/*      # Owner modules (3)
/dashboard/erp/*         # Staff modules (10)
```

---

### Phase 2 — Staff ERP Modules

**Goal**: Bangun semua ERP modules untuk Staff dengan full permission (untuk pengujian awal).

**Modules** (prioritized order):

1. **Dashboard** - Role-based main dashboard
2. **POS (Cashier)** - Point of Sale dengan payment processing
3. **Sales & Purchasing** - Sales Orders, Purchase requests, Invoices
4. **Inventory/Warehouse** - Stock management, transfers, stock opname
5. **Customers & Suppliers** - Customer segmentation, supplier management
6. **HR/Employee Management** - Employee records, attendance, salary
7. **Finance** - Cash transactions, journal entries, financial reports
8. **Vehicles** - Vehicle management, delivery assignments
9. **Salesman** - Commission tracking, top products/customers
10. **Promotions** - Discount management, bundling promotions

**Tasks**:

- CRUD + Supabase integration untuk setiap module
- Implement role-based access (Staff hanya akses module Staff)
- Component reusability following DRY principles
- Mobile-responsive layouts with shadcn/ui

**Route Pattern**: `/dashboard/erp/{module-slug}`

---

### Phase 3 — Owner ERP Modules

**Goal**: Buat module khusus untuk Owner role (management-level).

**Modules**:

1. **Employee Management** - Add/edit/remove employees, assign roles dan module access
2. **Subscription & Billing** - View/manage subscription plan, payments, billing history, change plan
3. **Company Data & Reporting** - View company-wide reports (sales, inventory, finance)

**Tasks**:

- Buat halaman & komponen modular
- Integrasi database Supabase dengan RLS policies
- Role-based access & permission validation
- Owner bisa melihat data Staff, tapi tidak sebaliknya
- Subscription plan integration dengan module access control

**Route Pattern**: `/dashboard/company/{module-slug}`

---

### Phase 4 — Dev ERP Modules

**Goal**: Buat module untuk Dev role (system-level).

**Modules**:

1. **Subscription Plan Management** - Create, update, delete plans dengan pricing dan features
2. **Company Management** - Add/manage registered companies, activate/deactivate accounts
3. **Global User Management** - View all registered users (owners dan staff) across companies
4. **System Monitoring** - View subscription status, usage analytics, system health

**Tasks**:

- CRUD & permission setup untuk tiap module
- Tambahkan Dev-only dashboard metrics
- Integrasi ke Supabase schema system
- Multi-tenant management capabilities
- System-wide analytics and monitoring

**Route Pattern**: `/dashboard/system/{module-slug}`

---

### Implementation Guidelines

**Development Priorities**:

1. **Phase 0** (Current): Environment setup and validation
2. **Phase 1**: Authentication foundation (critical path)
3. **Phase 2**: Core ERP functionality (highest user value)
4. **Phase 3**: Management layer (business value)
5. **Phase 4**: System administration (platform completion)

**Technical Standards**:

- All phases must follow constitutional principles (Clean Code, DRY, SOLID, KISS)
- Component reusability enforced across all modules
- Consistent shadcn/ui patterns and Lucide icons
- Mobile-first responsive design
- Supabase RLS for multi-tenant data isolation

**Quality Gates**:

- Each phase includes manual testing and validation
- Role-based access verification before phase completion
- Performance validation (dashboard load <3s, permission updates <30s)
- Constitution compliance check at each milestone
