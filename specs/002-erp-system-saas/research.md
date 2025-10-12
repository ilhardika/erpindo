# Research: ERPindo ERP System Technical Decisions

**Generated**: October 12, 2025  
**Context**: Multi-tenant SaaS ERP system with hierarchical access control

## Authentication & Session Management

**Decision**: Custom email/password authentication with hierarchical account creation

**Rationale**:

- No email verification required as specified - accounts created by higher-level roles
- System Owner accounts are predefined seed accounts
- Company Owner accounts created by System Owner
- Staff accounts created by Company Owner
- Simple email/password login with secure bcrypt hashing
- Session management via Supabase Auth without email verification flow

**Alternatives considered**:

- OAuth/SSO: Rejected due to complexity and requirement for simple login
- Multi-factor authentication: Rejected as not specified in requirements
- Email verification: Explicitly excluded per requirements

## Multi-Tenant Data Architecture

**Decision**: Supabase Row Level Security (RLS) with company_id isolation

**Rationale**:

- Supabase RLS provides database-level tenant isolation
- Each table includes company_id for data segmentation
- Policies ensure users only access their company's data
- Scalable to hundreds of companies without performance degradation
- Built-in security at the database level prevents data leakage

**Alternatives considered**:

- Separate databases per tenant: Too complex for initial scale
- Application-level filtering: Less secure than database-level policies
- Schema-based isolation: Overkill for projected company count

## Role-Based Permission System

**Decision**: Granular module-permission matrix with dynamic dashboard rendering

**Rationale**:

- Three-tier hierarchy: Dev → Owner → Staff clearly defined
- 17 modules organized by categories (System/Company/ERP)
- Permission checking at component and API route level
- Dashboard dynamically renders only accessible modules
- Database-driven permissions for flexible management

**Alternatives considered**:

- Hard-coded role permissions: Too rigid for SaaS flexibility
- Single permission level: Doesn't meet granular access requirements
- File-based permissions: Less scalable than database approach

## State Management

**Decision**: React Context for auth state, server state via Supabase realtime

**Rationale**:

- Authentication state managed globally via React Context
- Permission state derived from user data and cached
- Module data fetched on-demand per user access
- Supabase provides real-time updates for permission changes
- Minimal external dependencies (no Redux/Zustand needed initially)

**Alternatives considered**:

- Redux Toolkit: Overkill for current complexity
- Zustand: Additional dependency when Context suffices
- SWR/React Query: May add later for caching, not needed for MVP

## UI Component Architecture

**Decision**: shadcn/ui with modular page-specific components

**Rationale**:

- shadcn/ui provides consistent, accessible component library
- White primary/black secondary color scheme as specified
- Lucide React icons for visual consistency
- Responsive design with mobile-first approach
- Sidebar navigation layout for dashboard modules

**Alternatives considered**:

- Custom UI library: Too much development overhead
- Material-UI/Chakra: Doesn't match specified design requirements
- Headless UI: Would require more custom styling

## Performance & Scalability

**Decision**: Route-based code splitting with lazy loading for modules

**Rationale**:

- Next.js App Router provides automatic code splitting
- Lazy load ERP modules only when accessed
- Image optimization via Next.js built-in features
- Supabase connection pooling handles database scaling
- Vercel Edge Functions for API routes where needed

**Alternatives considered**:

- Manual code splitting: More complex than Next.js automatic approach
- Client-side routing: Server-side rendering preferred for SEO/performance
- Microservices architecture: Overkill for initial requirements
