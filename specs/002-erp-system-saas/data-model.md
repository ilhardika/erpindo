# Data Model: ERPindo ERP System

**Generated**: October 12, 2025  
**Context**: Multi-tenant SaaS ERP with hierarchical role system

## Core Entities

### Users

Represents all system users across the three role levels.

**Fields**:

- `id` (UUID, Primary Key)
- `email` (String, Unique) - Login credential
- `password_hash` (String) - bcrypt hashed password
- `role` (Enum: 'dev', 'owner', 'staff') - User role level
- `company_id` (UUID, Foreign Key) - Links to Company (NULL for dev role)
- `name` (String) - Full name
- `is_active` (Boolean) - Account status
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `created_by` (UUID, Foreign Key) - References Users.id (hierarchical creation tracking)

**Relationships**:

- Belongs to Company (except dev role)
- Has many ModulePermissions
- Creates other Users (hierarchical)

**Validation Rules**:

- Email must be unique across all companies
- Dev role users must have company_id = NULL
- Owner/Staff role users must have valid company_id
- Only higher-level roles can create lower-level accounts

**State Transitions**:

- Created → Active (when account is activated)
- Active → Inactive (when deactivated by higher role)
- Inactive → Active (when reactivated)

---

### Companies

Represents tenant organizations in the multi-tenant system.

**Fields**:

- `id` (UUID, Primary Key)
- `name` (String) - Company name
- `subscription_plan_id` (UUID, Foreign Key) - Current subscription
- `is_active` (Boolean) - Company activation status
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `created_by` (UUID, Foreign Key) - Dev user who created company

**Relationships**:

- Has many Users
- Belongs to SubscriptionPlan
- Has many Subscriptions (history)

**Validation Rules**:

- Must have exactly one Owner role user
- Must have active subscription to be operational
- Company name must be unique

**State Transitions**:

- Created → Active (when subscription is confirmed)
- Active → Suspended (when payment fails or manually suspended)
- Suspended → Active (when issues resolved)

---

### SubscriptionPlans

Defines available subscription tiers with module access.

**Fields**:

- `id` (UUID, Primary Key)
- `name` (String) - Plan name (Basic, Professional, Enterprise)
- `description` (Text) - Plan description
- `price_monthly` (Decimal) - Monthly price in Rupiah
- `price_yearly` (Decimal) - Yearly price with discount
- `max_users` (Integer) - Maximum staff users allowed
- `is_active` (Boolean) - Plan availability
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**:

- Has many Companies
- Has many PlanModuleAccess

**Validation Rules**:

- Price must be positive
- Max users must be greater than 0
- Plan name must be unique among active plans

---

### Modules

Defines all system modules across categories.

**Fields**:

- `id` (UUID, Primary Key)
- `name` (String) - Module name
- `slug` (String, Unique) - URL-safe identifier
- `category` (Enum: 'system', 'company', 'erp') - Module category
- `description` (Text) - Module description
- `icon` (String) - Lucide icon name
- `route_path` (String) - Next.js route path
- `is_active` (Boolean)
- `sort_order` (Integer) - Display order

**Relationships**:

- Has many PlanModuleAccess
- Has many ModulePermissions

**Validation Rules**:

- Slug must be unique and URL-safe
- Category determines which roles can access
- System modules only for dev role
- Company modules only for owner role
- ERP modules only for staff role (as assigned)

---

### ModulePermissions

Links users to specific modules with action-level permissions.

**Fields**:

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key) - References Users.id
- `module_id` (UUID, Foreign Key) - References Modules.id
- `can_read` (Boolean) - View access
- `can_create` (Boolean) - Create access
- `can_update` (Boolean) - Edit access
- `can_delete` (Boolean) - Delete access
- `granted_at` (Timestamp)
- `granted_by` (UUID, Foreign Key) - User who granted permission

**Relationships**:

- Belongs to User
- Belongs to Module

**Validation Rules**:

- User must exist and be active
- Module must be available for user's role category
- Permissions can only be granted by higher-level roles
- Staff users can only receive ERP module permissions
- Owner users automatically get company module permissions

---

### PlanModuleAccess

Defines which modules are included in each subscription plan.

**Fields**:

- `id` (UUID, Primary Key)
- `subscription_plan_id` (UUID, Foreign Key)
- `module_id` (UUID, Foreign Key)
- `is_included` (Boolean) - Module included in plan

**Relationships**:

- Belongs to SubscriptionPlan
- Belongs to Module

**Validation Rules**:

- Each plan-module combination must be unique
- Only ERP and Company modules can be plan-restricted
- System modules are always available to appropriate roles

---

### Subscriptions

Tracks subscription history and billing for companies.

**Fields**:

- `id` (UUID, Primary Key)
- `company_id` (UUID, Foreign Key)
- `subscription_plan_id` (UUID, Foreign Key)
- `status` (Enum: 'active', 'suspended', 'cancelled', 'expired')
- `start_date` (Date)
- `end_date` (Date)
- `billing_cycle` (Enum: 'monthly', 'yearly')
- `amount` (Decimal) - Amount paid
- `currency` (String) - 'IDR'
- `created_at` (Timestamp)

**Relationships**:

- Belongs to Company
- Belongs to SubscriptionPlan

**Validation Rules**:

- Start date must be before end date
- Amount must match subscription plan pricing
- Only one active subscription per company at a time

**State Transitions**:

- Created → Active (when payment confirmed)
- Active → Suspended (when payment fails)
- Active → Cancelled (when manually cancelled)
- Suspended → Active (when payment resolved)
- Any → Expired (when end_date reached)

## Data Isolation Strategy

### Row Level Security (RLS) Policies

**Users Table**:

- Dev role: Can access all users across companies
- Owner role: Can access only users within their company
- Staff role: Can view only their own user record

**Companies Table**:

- Dev role: Full access to all companies
- Owner role: Can access only their own company
- Staff role: Can view only their own company (read-only)

**Module Permissions**:

- Users can only see permissions related to their company
- Higher roles can manage permissions for lower roles within their company

### Multi-Tenant Query Patterns

All queries automatically filtered by:

1. User role level (dev/owner/staff)
2. Company association (where applicable)
3. Module access permissions (for ERP functionality)

This ensures complete data isolation between tenant companies while maintaining the hierarchical access model.
