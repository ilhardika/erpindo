# Implementation Plan: ERP System (SaaS) with Multi-Tenant Architecture

**Branch**: `001-erp-system-saas` | **Date**: September 13, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-erp-system-saas/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → Feature spec loaded: ERP System (SaaS) with comprehensive business modules
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: Web application (React frontend + Supabase backend)
   → Structure Decision: Option 2 (Web application with frontend/backend separation)
3. Evaluate Constitution Check section below
   → Constitution violations documented in Complexity Tracking
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → All technical decisions resolved through user-provided tech stack
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, copilot-instructions.md
6. Re-evaluate Constitution Check section
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Primary requirement: Multi-tenant SaaS ERP platform with role-based access (Dev/Owner/Staff) providing subscription-based access to business modules (POS, Sales, Inventory, HR, Finance, etc.). Technical approach: React Progressive Web App frontend with Supabase backend, Indonesian language UI, mobile-first responsive design using shadcn/ui and Tailwind CSS.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 18+), TypeScript  
**Primary Dependencies**: React, Supabase Client, shadcn/ui, Tailwind CSS, Zustand, react-hook-form, zod, Lucide icons  
**Storage**: Supabase (PostgreSQL with real-time capabilities, Row-Level Security for multi-tenancy)  
**Testing**: Vitest, React Testing Library, Playwright for E2E  
**Target Platform**: Progressive Web App (PWA) - cross-platform, offline-first capability  
**Project Type**: Web application (frontend + backend separation via Supabase)  
**Performance Goals**: <200ms page load, real-time data sync, offline functionality for critical operations  
**Constraints**: Multi-tenant data isolation, subscription-based feature access, Indonesian language UI  
**Scale/Scope**: Support for multiple companies, unlimited users per company, comprehensive ERP modules

**Additional Context from User**:

- **Frontend**: React with shadcn/ui (Tailwind-based, minimalist)
- **Backend & Database**: Supabase with MCP server integration
- **UI Language**: Indonesian
- **Theme**: White primary, Black secondary, Gray accents
- **Goals**: Responsive, Scalable, DRY, Maintainable
- **Routing**: Role-based protection (DevRoute, OwnerRoute, StaffRoute)
- **Dashboard Layout**: Sidebar navigation, Header (search/profile/notifications), Main content area

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Simplicity**:

- Projects: 2 (frontend React app, Supabase configuration) - Within limit of 3
- Using framework directly? Yes (React, Supabase, shadcn/ui without unnecessary wrappers)
- Single data model? Yes (unified ERP entities with proper relationships)
- Avoiding patterns? Yes (direct Supabase client usage, minimal abstractions)

**Architecture**:

- EVERY feature as library? Partial violation - ERP modules as React feature modules, not standalone libraries
- Libraries listed: Auth module, Dashboard module, POS module, Inventory module, etc.
- CLI per library: Not applicable for React web application
- Library docs: Component documentation in Storybook format

**Testing (NON-NEGOTIABLE)**:

- RED-GREEN-Refactor cycle enforced? Yes - tests written before implementation
- Git commits show tests before implementation? Will be enforced
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual Supabase instance, not mocks)
- Integration tests for: React components, Supabase queries, role-based routing
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:

- Structured logging included? Yes (Supabase logging + custom frontend logging)
- Frontend logs → backend? Yes (via Supabase functions if needed)
- Error context sufficient? Yes (error boundaries, user-friendly messages)

**Versioning**:

- Version number assigned? 1.0.0 (initial release)
- BUILD increments on every change? Yes
- Breaking changes handled? Migration scripts for database schema changes

## Project Structure

### Documentation (this feature)

```
specs/001-erp-system-saas/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 2: Web application (React + Supabase)
frontend/
├── src/
│   ├── components/        # shadcn/ui + custom components
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── layout/       # Dashboard, Sidebar, Header
│   │   └── modules/      # ERP module components
│   ├── pages/            # Route pages
│   │   ├── auth/         # Login, register
│   │   ├── dashboard/    # Role-specific dashboards
│   │   └── modules/      # POS, Sales, Inventory, etc.
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand state management
│   ├── lib/              # Utilities, Supabase client
│   ├── types/            # TypeScript definitions
│   └── routes/           # Route configuration & protection
├── public/               # PWA manifest, icons
├── tests/                # Vitest, React Testing Library
└── docs/                 # Component documentation

backend/ (Supabase Configuration)
├── supabase/
│   ├── migrations/       # Database schema migrations
│   ├── functions/        # Edge functions if needed
│   ├── seed.sql         # Initial data seeding
│   └── config.toml      # Supabase configuration
└── mcp-server/          # MCP server configuration
```

**Structure Decision**: Option 2 - Web application with React frontend and Supabase backend separation

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - Supabase MCP server integration patterns
   - Multi-tenant Row-Level Security implementation
   - PWA offline-first architecture with Supabase
   - Role-based routing patterns in React
   - shadcn/ui component integration patterns

2. **Generate and dispatch research agents**:

   ```
   Task: "Research Supabase Row-Level Security for multi-tenant SaaS applications"
   Task: "Find best practices for React PWA with offline-first Supabase integration"
   Task: "Research shadcn/ui component patterns for ERP applications"
   Task: "Find patterns for role-based routing in React applications"
   Task: "Research Supabase real-time subscriptions for ERP modules"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical decisions and patterns

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Subscription Plans, Companies, Users, Products, Transactions
   - Customer, Supplier, Employee, Vehicle, Invoice, Promotion, Report entities
   - Supabase table schema with Row-Level Security policies
   - Relationships and foreign key constraints

2. **Generate API contracts** from functional requirements:

   - Supabase table schemas (CREATE TABLE statements)
   - Row-Level Security policies for multi-tenancy
   - Real-time subscription patterns
   - Edge function contracts (if needed)
   - Output Supabase migration files to `/contracts/`

3. **Generate contract tests** from contracts:

   - Supabase schema validation tests
   - RLS policy tests for each role
   - Real-time subscription tests
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Dev role: Company management, subscription oversight
   - Owner role: Employee management, business operations
   - Staff role: Module-specific operations
   - Quickstart test = complete user journey validation

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
   - Add React, Supabase, shadcn/ui patterns
   - Include ERP domain knowledge
   - Keep under 150 lines for token efficiency
   - Output to `.github/copilot-instructions.md`

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each Supabase table → schema creation task [P]
- Each RLS policy → security test task [P]
- Each React component → component creation task
- Each ERP module → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Database schema → Auth → Routing → Components → Features
- Mark [P] for parallel execution (independent files)
- Critical path: Auth system → Role routing → Dashboard → ERP modules

**Estimated Output**: 40-50 numbered, ordered tasks in tasks.md covering:

- Supabase setup and schema (10 tasks)
- Authentication and authorization (8 tasks)
- React application structure (10 tasks)
- ERP module implementation (20+ tasks)
- Testing and deployment (5 tasks)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                                | Why Needed                                                                       | Simpler Alternative Rejected Because                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Feature modules not standalone libraries | ERP modules are tightly integrated React components sharing state and navigation | Standalone libraries would require complex inter-module communication and duplicate React/Supabase setup |
| No CLI per module                        | Web application with GUI interface                                               | CLI interface inappropriate for business users who need visual dashboards and forms                      |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS (violations justified)
- [x] Post-Design Constitution Check: PASS (violations remain justified)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
