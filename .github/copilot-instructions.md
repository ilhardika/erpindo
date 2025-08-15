# GitHub Copilot Instructions for ERPindo

## Project Overview

ERPindo is a multi-tenant SaaS ERP system built with React 19 + Vite, designed for Indonesian businesses with role-based access (Superadmin → Company Owner → Employee). Currently in frontend-only phase using mock data.

## Architecture & Role Hierarchy

- **3-tier role system**: Superadmin manages companies, Company Owners manage employees, Employees access modules
- **Unified dashboard flow**: All roles login via `/dashboard` with dynamic module loading based on permissions
- **Module-based features**: POS, Sales/Purchasing, Inventory, HR, Finance, Customers/Suppliers, Promotions, Vehicles
- **Mock-first approach**: All data in `src/data/` as JSON files, imported via RTK Query services

## Tech Stack Specifics

- **React 19** with JavaScript (not TypeScript)
- **Vite** for build tooling with Tailwind CSS v4 integration
- **State management**: Redux Toolkit + RTK Query (planned, currently mock data)
- **UI**: shadcn/ui components + Tailwind CSS v4
- **Routing**: React Router v7 with role-based route protection
- **Language**: All UI text in Indonesian via `lang/id.js`

## Key Development Patterns

### Project Structure (from `docs/dev_guidelines.md`)

```
src/
  features/        # ERP modules (POS, Inventory, etc.)
  layouts/         # Dashboard & Auth layouts
  pages/           # Page-level views
  routes/          # Route configs with role protection
  store/           # Redux setup
  services/        # RTK Query endpoints (mock-based)
  data/            # Mock JSON data (temporary)
  components/      # Reusable UI components
```

### Naming Conventions

- **Components**: PascalCase (`InvoiceModal.jsx`)
- **Files**: kebab-case (`sales-report.jsx`)
- **State/API**: camelCase (`salesData`, `fetchOrders`)

### Styling & UI Guidelines

- **Theme**: White primary, black secondary, light gray accents
- **Icons**: Lucide (outlined style only)
- **Responsive**: Mobile-first approach
- **Layout**: Sidebar nav + header (search/profile) + main content

## Critical Workflows

### Development Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build
```

### ESLint Configuration

- Uses flat config format (`eslint.config.js`)
- Custom rule: `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]`
- Extends React hooks and refresh plugins for Vite

### Mock Data Integration

- Import JSON from `src/data/` into RTK Query services
- Keep data structure aligned with planned Supabase backend schema
- Simulate API calls with promise-based mock responses

## Route Protection Pattern

```javascript
// Centralized in routes/index.js
<SuperadminRoute />   // Superadmin dashboard
<OwnerRoute />        // Company owner features
<EmployeeRoute />     // Employee module access
```

## Module Development Guidelines

Each ERP module should follow:

1. **Feature folder** in `src/features/[module-name]/`
2. **Role-based access** checking user permissions
3. **Indonesian UI text** from language files
4. **Mock data** for immediate development
5. **RTK Query service** for data fetching simulation

## Integration Readiness

- Environment variables prepared for Supabase integration
- Mock API structure mirrors planned backend endpoints
- Component props designed for real data replacement
- Redux store ready for actual API integration

## Documentation References

- **Architecture**: `docs/app_blueprint.md` - Complete role hierarchy and module features
- **Development**: `docs/dev_guidelines.md` - Detailed tech stack and patterns
- **Dependencies**: `package.json` - React 19, Tailwind v4, Vite 7+

## Common Pitfalls to Avoid

- Don't add TypeScript (project uses JavaScript only)
- Don't integrate real APIs yet (mock data phase)
- Don't use CSS modules or styled-components (Tailwind only)
- Don't skip role-based access checks in components
- Don't forget Indonesian localization for all UI text
