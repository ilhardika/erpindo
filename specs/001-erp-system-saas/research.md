# Research & Technical Decisions

**Date**: September 13, 2025  
**Feature**: ERP System (SaaS) with Multi-Tenant Architecture  
**Phase**: 0 - Research & Technical Foundation

## Research Areas

### 1. Supabase Row-Level Security for Multi-Tenant SaaS

**Decision**: Implement tenant isolation using Row-Level Security (RLS) policies with company_id as the tenant identifier

**Rationale**:

- Supabase RLS provides database-level security that cannot be bypassed
- Automatically enforces data isolation without application-level checks
- Scales efficiently with PostgreSQL's built-in security features
- Reduces risk of data leaks between companies

**Implementation Pattern**:

```sql
-- Example RLS policy for multi-tenancy
CREATE POLICY "Company users can only see their own data" ON products
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id');
```

**Alternatives Considered**:

- Application-level filtering: Rejected due to higher risk of data leaks
- Separate databases per tenant: Rejected due to complexity and cost

### 2. Progressive Web App (PWA) with Offline-First Supabase Integration

**Decision**: Implement PWA with selective offline capabilities using Supabase real-time subscriptions and local storage

**Rationale**:

- Critical ERP operations (POS, inventory checks) need offline capability
- Supabase real-time ensures data consistency when online
- PWA provides native app-like experience across devices
- Service worker enables background sync

**Implementation Pattern**:

```javascript
// Offline-first data strategy
const useOfflineFirst = (table, query) => {
  // 1. Return cached data immediately
  // 2. Fetch from Supabase in background
  // 3. Update cache and re-render
  // 4. Handle conflicts on reconnection
};
```

**Alternatives Considered**:

- Fully offline app: Rejected due to real-time collaboration needs
- Online-only: Rejected due to unreliable internet in some business environments

### 3. shadcn/ui Component Architecture for ERP Applications

**Decision**: Use shadcn/ui as the foundation with custom ERP-specific component composition

**Rationale**:

- Copy-paste approach allows customization without version conflicts
- Tailwind CSS provides consistent design system
- Accessible components out of the box
- Easy to extend for ERP-specific needs (data tables, forms, dashboards)

**Component Strategy**:

```
ui/ (shadcn/ui base components)
├── button.tsx
├── form.tsx
├── table.tsx
└── dialog.tsx

erp/ (composed ERP components)
├── data-table.tsx      # Enhanced table with filters, pagination
├── pos-interface.tsx   # POS-specific UI components
├── inventory-grid.tsx  # Inventory management interface
└── dashboard-card.tsx  # Dashboard metrics display
```

**Alternatives Considered**:

- Material-UI: Rejected due to heavier bundle size and less customization
- Ant Design: Rejected due to design language mismatch with minimalist goals

### 4. Role-Based Routing Patterns in React

**Decision**: Implement hierarchical route protection with component-level permission checks

**Rationale**:

- Clear separation of concerns between authentication and authorization
- Flexible permission system that can evolve with business needs
- Type-safe route definitions with TypeScript
- Seamless user experience with proper redirects

**Implementation Pattern**:

```typescript
// Route protection hierarchy
<DevRoute>
  {" "}
  // System owner access
  <OwnerRoute>
    {" "}
    // Company owner access
    <StaffRoute>
      {" "}
      // Employee access
      <Component />
    </StaffRoute>
  </OwnerRoute>
</DevRoute>;

// Permission-based component rendering
const { hasPermission } = usePermissions();
return hasPermission("inventory.create") ? <CreateButton /> : null;
```

**Alternatives Considered**:

- Route-level permissions only: Rejected due to lack of component-level control
- Complex permission middleware: Rejected due to over-engineering for initial version

### 5. Supabase Real-Time Subscriptions for ERP Modules

**Decision**: Implement selective real-time subscriptions based on user role and active modules

**Rationale**:

- ERP systems benefit from real-time updates (inventory changes, new orders)
- Selective subscriptions prevent unnecessary bandwidth usage
- Role-based subscriptions ensure users only get relevant updates
- Automatic cleanup prevents memory leaks

**Implementation Pattern**:

```javascript
// Role-based real-time subscriptions
const useRealtimeSubscription = (table, userRole, filters) => {
  useEffect(() => {
    if (!shouldSubscribe(table, userRole)) return;

    const subscription = supabase
      .channel(`${table}_${userRole}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: buildRoleFilter(userRole, filters),
        },
        handleChange
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [table, userRole, filters]);
};
```

**Alternatives Considered**:

- Subscribe to all tables: Rejected due to performance concerns
- Polling-based updates: Rejected due to lack of real-time experience

## Technology Stack Validation

### Frontend Stack

- **React 18+**: ✅ Mature, excellent ecosystem, great TypeScript support
- **TypeScript**: ✅ Type safety crucial for complex ERP domain logic
- **Tailwind CSS**: ✅ Utility-first approach fits well with component composition
- **shadcn/ui**: ✅ Modern, accessible, customizable components
- **Zustand**: ✅ Lightweight state management, good TypeScript integration
- **react-hook-form + zod**: ✅ Excellent form handling with type-safe validation

### Backend Stack

- **Supabase**: ✅ PostgreSQL provides ACID compliance needed for financial data
- **Row-Level Security**: ✅ Database-level multi-tenancy security
- **Real-time subscriptions**: ✅ Essential for collaborative ERP operations
- **Edge Functions**: ✅ Available for complex business logic if needed

### Development Stack

- **Vite**: ✅ Fast development server, excellent React integration
- **Vitest**: ✅ Fast testing with Vite integration
- **Playwright**: ✅ Reliable E2E testing for complex workflows
- **ESLint + Prettier**: ✅ Code quality and consistency

## Architecture Decisions

### Data Flow

```
User Action → React Component → Supabase Client → RLS Check → Database
                     ↓                              ↓
              Local State Update ← Real-time Subscription ← Database Change
```

### Security Model

1. **Authentication**: Supabase Auth with email/password
2. **Authorization**: JWT claims + RLS policies
3. **Multi-tenancy**: company_id in JWT + RLS enforcement
4. **Role permissions**: Stored in user metadata, cached in Zustand

### Performance Strategy

1. **Code splitting**: Lazy load ERP modules
2. **Data fetching**: React Query patterns with Supabase
3. **Caching**: Zustand for application state, browser storage for offline data
4. **Bundle optimization**: Tree shaking, dynamic imports

## Risk Mitigation

### Technical Risks

- **Supabase vendor lock-in**: Mitigated by using standard PostgreSQL features
- **Real-time scalability**: Mitigated by selective subscriptions
- **Offline data conflicts**: Mitigated by last-write-wins with user notification

### Business Risks

- **Data isolation failure**: Mitigated by RLS + comprehensive testing
- **Performance degradation**: Mitigated by monitoring + optimization strategy
- **Feature complexity**: Mitigated by iterative development approach

## Next Steps

1. Create detailed data model based on ERP entities
2. Design Supabase schema with RLS policies
3. Define API contracts for all ERP operations
4. Create quickstart guide for development setup
