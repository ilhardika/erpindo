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
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
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

**Ready for Phase 2**: The implementation plan is complete and ready for task breakdown via `/speckit.tasks`
