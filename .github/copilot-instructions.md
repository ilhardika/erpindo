# ERPindo Copilot Instructions

This is a **Next.js 15** multi-tenant ERP SaaS application with role-based access control and a mock backend for frontend development.

## 🏗️ Architecture Overview

**Role Hierarchy (3-tier):**

- **Superadmin**: Manages all companies, subscriptions, and system-wide settings
- **Company Owner**: Manages employees and modules within their company
- **Employee**: Accesses assigned ERP modules (POS, Inventory, HR, Fleet, etc.)

**Tech Stack Deviation from Docs:**

- Using **Next.js 15 App Router** (not React Router v7 as mentioned in docs)
- **shadcn/ui** components with Radix UI primitives
- **Mock backend** in `src/backend/` simulates full API layer
- **localStorage-based auth** (no Redux/RTK Query currently implemented)

## 🗂️ Key Directory Patterns

**Mock Backend Structure:**

```
src/backend/
├── data/           # JSON-like mock data exports
├── services/       # Domain-based services (auth, hr, business, fleet)
├── tables/         # TypeScript type definitions
└── utils/          # Formatters and utilities
```

**Component Organization:**

```
src/components/
├── auth/           # Login components
├── dashboard/      # Role-specific dashboard components
│   ├── superadmin/
│   ├── owner/
│   └── employee/
├── layout/         # Reusable layouts (Dashboard, Form, View, Module)
└── ui/             # shadcn/ui components
```

## 🔐 Authentication & Routing

**Auth Pattern:**

- `AuthContext` provides global auth state via localStorage
- `ProtectedRoute` wrapper handles role-based redirects
- All users login via `/` then redirect to `/dashboard`

**Route Protection Example:**

```tsx
<ProtectedRoute allowedRoles={["superadmin"]}>
  <SuperadminDashboard />
</ProtectedRoute>
```

## 🏢 Multi-Tenancy & Data Access

**Company Isolation:**

- Company Owners can only access their `companyId` data
- Employees inherit company restrictions + module permissions
- Superadmins have cross-company access

**Mock Service Pattern:**

```typescript
// Services return filtered data based on user context
export class CompanyService {
  static async getCompanies(userId: string): Promise<Company[]> {
    // Filtering logic based on user role/companyId
  }
}
```

## 🎛️ Dashboard Architecture

**Dynamic Module Loading:**

- `DashboardLayout` renders different sidebars based on `user.role`
- Employee modules are filtered by permissions from HR service
- Navigation state managed via React state, not routing

**Component Switching Pattern:**

```tsx
// Dashboard components handle internal navigation
const [currentPage, setCurrentPage] = useState("dashboard");
if (currentPage === "companies") return <ManageCompanies />;
```

## 🚀 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (note: minification disabled)
npm run start        # Start production server
npm run lint         # ESLint check
```

## 🔧 Common Patterns

**Form Layouts:** Use `FormLayout` for consistent create/edit pages
**Data Tables:** Use `DataTable` with `createColumns` helper from `src/components/ui/table.tsx`
**Type Safety:** Import types from `src/backend/tables/` for consistent data shapes
**Service Calls:** Mock services in `src/backend/services/` simulate async operations

## ⚠️ Important Notes

- **No real database** - all data is mocked in TypeScript files
- **Indonesian UI** - Keep all user-facing text in Bahasa Indonesia
- **Role-based components** - Always check user role before rendering features
- **Company context** - Filter data by `companyId` for non-superadmin users
- **Module permissions** - Employee access controlled via HR service module assignments

When adding features, follow the domain-based service organization and maintain the 3-tier role hierarchy throughout the application.
