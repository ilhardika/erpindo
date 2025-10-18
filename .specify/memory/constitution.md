# ERPindo Development Constitution

## Core Principles

### I. Clean Code & DRY Principle

Follow **Clean Code** principles and **DRY (Don't Repeat Yourself)** principle. Code must be readable, maintainable, and avoid duplication. Every component, function, and module should have a single, clear purpose.

### II. KISS & SOLID Principles

Follow **KISS (Keep It Simple, Stupid)** and **SOLID** principles. Solutions should be simple, classes should have single responsibilities, and code should be open for extension but closed for modification.

### III. Separation of Concerns (NON-NEGOTIABLE)

UI, logic, and data must be completely separated. Business logic stays in services/hooks, UI components are purely presentational, and data access is isolated in dedicated layers.

### IV. Scalability & Reusability

Code must be **scalable**, **maintainable**, and **reusable**. Components should be modular, hooks should be composable, and utilities should be framework-agnostic where possible.

### V. YAGNI & Consistency

Follow **YAGNI (You Aren't Gonna Need It)** — only build what's necessary. Ensure **Consistency** in naming, structure, and formatting across the entire codebase.

## Technology Standards

### Tech Stack Requirements

- **Frontend Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components only
- **Icons:** Lucide React exclusively
- **Database:** Supabase (PostgreSQL) via MCP Server
- **Authentication:** Custom email/password (no verification), hierarchical management
- **Deployment:** Vercel production-ready configuration

### UI/UX Standards

- shadcn/ui components with white primary and black secondary color scheme
- Lucide icons for all visual elements
- Modern, minimalist, and responsive design
- Mobile-friendly layouts with sidebar dashboard navigation
- Consistent component patterns and naming conventions

## Development Workflow

### Code Reuse Policy (CRITICAL)

**Before creating any new file, component, or page, always check if it already exists**:

- If it exists → reuse or extend it following established patterns
- If not → create following the project structure and naming conventions
- No duplicate components or utilities allowed

### Multi-Tenant Architecture

- All data must be isolated per company using Row Level Security (RLS)
- Role-based permissions: System Owner (Dev) → Company Owner → Staff
- Hierarchical account creation without email verification
- Category-based module organization (system/company/erp)

### Module Development Pattern (MANDATORY)

**All ERP modules MUST follow the standardized pattern established from Module 1 (Customers)**:

- **Routing Structure**:
  - `/erp/{module}` → List page
  - `/erp/{module}/new` → Create page
  - `/erp/{module}/[id]` → Detail view (READ-ONLY)
  - `/erp/{module}/[id]/edit` → Edit page
  - `/erp/{module}/categories` → Category management (if applicable)

- **Detail View Requirements**:
  - Header: Edit + Delete buttons (side by side)
  - Content: 3-4 Cards layout (Basic, Contact, Financial, Record Info)
  - Bottom: Back to List button ONLY (no duplicate actions)
  - NEVER inline editing (always redirect to /edit page)

- **Development Phases**:
  1. Database schema + RLS policies + **Sample data (5-15 records/company)**
  2. Types + API + Validation schemas
  3. List → Detail → Create → Edit pages
  4. Testing + Build verification

**Reference**: See `.specify/memory/module-pattern.md` for complete pattern documentation

## Governance

Development must follow these principles without exception. All code reviews must verify compliance with Clean Code, SOLID, and separation of concerns. Any complexity must be justified and documented.

**Module pattern compliance is mandatory for all 12 ERP modules.**

**Version**: 1.1.0 | **Ratified**: October 12, 2025 | **Last Amended**: October 18, 2025
