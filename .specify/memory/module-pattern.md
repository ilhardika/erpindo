# Module Development Pattern (Standardized from Module 1: Customers)

**Last Updated**: October 18, 2025  
**Based On**: Module 1 (Customers) - 100% Complete  
**Purpose**: Ensure consistency across all 12 ERP modules

---

## Overview

This pattern document standardizes the structure, routing, components, and development workflow established from Module 1 (Customers). All subsequent modules (Suppliers, Products, Inventory, etc.) must follow this exact pattern.

---

## Module Structure Template

```
src/
├── lib/
│   └── {module}/
│       ├── api.ts                    # CRUD functions (create, get, update, delete)
│       ├── types.ts                  # TypeScript interfaces
│       └── validation.ts             # Zod schemas (form + category if needed)
│
├── components/
│   └── {module}/
│       ├── {module}-table.tsx        # List page table component
│       ├── {module}-form.tsx         # Reusable create/edit form
│       └── category-dialog.tsx       # (if module has categories)
│
└── app/(dashboard)/erp/{module}/
    ├── page.tsx                      # List page
    ├── new/
    │   └── page.tsx                  # Create page
    ├── [id]/
    │   ├── page.tsx                  # Detail view (read-only)
    │   └── edit/
    │       └── page.tsx              # Edit page
    └── categories/                   # (if module has categories)
        └── page.tsx                  # Category management
```

---

## Routing Convention (NON-NEGOTIABLE)

| Route                      | Purpose             | Component       | Actions                                                         |
| -------------------------- | ------------------- | --------------- | --------------------------------------------------------------- |
| `/erp/{module}`            | List page           | `{Module}Table` | View all, search, filter, pagination, navigate to detail/create |
| `/erp/{module}/new`        | Create page         | `{Module}Form`  | Create new record                                               |
| `/erp/{module}/[id]`       | Detail view         | Card layout     | **Read-only** display, Edit button → edit page, Delete button   |
| `/erp/{module}/[id]/edit`  | Edit page           | `{Module}Form`  | Update existing record                                          |
| `/erp/{module}/categories` | Category management | Table + Dialog  | CRUD categories (if applicable)                                 |

**Key Rules**:

- Detail view (`[id]/page.tsx`) is **always read-only**
- Edit page is **separate route** at `[id]/edit/page.tsx`
- Header buttons on detail view: **Edit + Delete** (side by side)
- Bottom button on detail view: **Back to List** only (no duplicate actions)

---

## Component Patterns

### 1. Table Component (`{module}-table.tsx`)

**Purpose**: Display list with search, filter, actions  
**Location**: `src/components/{module}/{module}-table.tsx`

**Required Props**:

```typescript
interface {Module}TableProps {
  data: {Module}[];
  isLoading?: boolean;
}
```

**Required Features**:

- Search input (debounced)
- Status filter dropdown
- Category filter (if applicable)
- Sortable columns
- Action menu per row:
  - "View Details" → `/erp/{module}/[id]`
  - "Edit" → `/erp/{module}/[id]/edit`
  - "Delete" with confirmation dialog

**Dependencies**: `shadcn/ui` Table, DropdownMenu, Badge, Input, Select

---

### 2. Form Component (`{module}-form.tsx`)

**Purpose**: Reusable form for create/edit modes  
**Location**: `src/components/{module}/{module}-form.tsx`

**Required Props**:

```typescript
interface {Module}FormProps {
  defaultValues?: Partial<{Module}FormData>;
  onSubmit: (data: {Module}FormData) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}
```

**Required Features**:

- `react-hook-form` with `zodResolver`
- All fields with proper validation
- Category dropdown with "Create New" button (if applicable)
- Submit button with loading state
- Cancel button → back to list
- Error handling with toast notifications

**Validation**: Import from `src/lib/{module}/validation.ts`

**Dependencies**: `react-hook-form`, `zod`, `@hookform/resolvers/zod`, `shadcn/ui` Form components

---

### 3. Category Dialog (`category-dialog.tsx`)

**Purpose**: Inline category creation (if module has categories)  
**Location**: `src/components/{module}/category-dialog.tsx`

**Required Props**:

```typescript
interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCategory: {Module}Category) => void;
}
```

**Required Features**:

- Dialog with form (name + description)
- Validation with zod schema
- API call to create category
- Toast on success/error
- Callback to refresh parent dropdown

**Dependencies**: `shadcn/ui` Dialog, Form components

---

## Page Patterns

### 1. List Page (`page.tsx`)

**Location**: `src/app/(dashboard)/erp/{module}/page.tsx`

**Template**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { {Module}Table } from '@/components/{module}/{module}-table';
import { get{Module}s } from '@/lib/{module}/api';
import type { {Module} } from '@/lib/{module}/types';

export default function {Module}sPage() {
  const [data, setData] = useState<{Module}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await get{Module}s();
    if (result) setData(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{Module}s</h1>
          <p className="text-muted-foreground">Manage your {module}s</p>
        </div>
        <Link href="/erp/{module}/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add {Module}
          </Button>
        </Link>
      </div>

      <{Module}Table data={data} isLoading={isLoading} />
    </div>
  );
}
```

---

### 2. Detail View Page (`[id]/page.tsx`)

**Location**: `src/app/(dashboard)/erp/{module}/[id]/page.tsx`

**Template Structure**:

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function {Module}DetailPage() {
  // 1. Hooks
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<{Module} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Load data
  useEffect(() => {
    loadData();
  }, [params.id]);

  // 3. Delete handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure?')) return;
    const success = await delete{Module}(params.id as string);
    if (success) {
      toast.success('{Module} deleted successfully');
      router.push('/erp/{module}');
    } else {
      toast.error('Failed to delete');
    }
  };

  // 4. Layout
  return (
    <div className="space-y-6">
      {/* Header: Title + Edit + Delete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{data?.name}</h1>
          <p className="text-muted-foreground">View {module} details</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/erp/{module}/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit {Module}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content: 3-4 Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent>
            {/* Fields here */}
          </CardContent>
        </Card>

        {/* More cards... */}
      </div>

      {/* Bottom: Back to List only */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/erp/{module}')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
    </div>
  );
}
```

**Key Requirements**:

- Header: Title + Edit button + Delete button (side by side)
- Content: 3-4 Cards with sections (Basic, Contact, Financial, Record Info)
- Bottom: Back to List button ONLY (no duplicate actions)
- Delete button uses `window.confirm()` and toast notifications
- Status displayed as Badge component
- Dates formatted with `formatDate()` helper
- Currency formatted with `formatCurrency()` helper (if applicable)

---

### 3. Create Page (`new/page.tsx`)

**Location**: `src/app/(dashboard)/erp/{module}/new/page.tsx`

**Template**:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { {Module}Form } from '@/components/{module}/{module}-form';
import { create{Module} } from '@/lib/{module}/api';
import type { {Module}FormData } from '@/lib/{module}/validation';

export default function Create{Module}Page() {
  const router = useRouter();

  const handleSubmit = async (data: {Module}FormData) => {
    const newRecord = await create{Module}(data);
    if (newRecord) {
      toast.success('{Module} created successfully');
      router.push('/erp/{module}');
    } else {
      toast.error('Failed to create {module}');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create {Module}</h1>
        <p className="text-muted-foreground">Add a new {module} to your system</p>
      </div>

      <{Module}Form mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
```

---

### 4. Edit Page (`[id]/edit/page.tsx`)

**Location**: `src/app/(dashboard)/erp/{module}/[id]/edit/page.tsx`

**Template**:

```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { {Module}Form } from '@/components/{module}/{module}-form';
import { get{Module}ById, update{Module} } from '@/lib/{module}/api';
import type { {Module}, {Module}FormData } from '@/lib/{module}/types';

export default function Edit{Module}Page() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<{Module} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    const result = await get{Module}ById(params.id as string);
    if (result) setData(result);
    setIsLoading(false);
  };

  const handleSubmit = async (formData: {Module}FormData) => {
    const success = await update{Module}(params.id as string, formData);
    if (success) {
      toast.success('{Module} updated successfully');
      router.push('/erp/{module}');
    } else {
      toast.error('Failed to update {module}');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit {Module}</h1>
        <p className="text-muted-foreground">Update {module} information</p>
      </div>

      <{Module}Form
        mode="edit"
        defaultValues={data}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

---

### 5. Category Management Page (`categories/page.tsx`)

**Location**: `src/app/(dashboard)/erp/{module}/categories/page.tsx`  
**Only if module has categories**

**Required Features**:

- Table listing all categories
- "Add Category" button with CategoryDialog
- Inline edit functionality
- Delete with usage validation (prevent if in use)
- Refresh button

---

## API Layer Pattern

**Location**: `src/lib/{module}/api.ts`

**Required Functions**:

```typescript
// CRUD operations
export async function get{Module}s(): Promise<{Module}[] | null>
export async function get{Module}ById(id: string): Promise<{Module} | null>
export async function create{Module}(data: {Module}FormData): Promise<{Module} | null>
export async function update{Module}(id: string, data: {Module}FormData): Promise<boolean>
export async function delete{Module}(id: string): Promise<boolean>

// Category operations (if applicable)
export async function get{Module}Categories(): Promise<{Module}Category[] | null>
export async function create{Module}Category(data: CategoryFormData): Promise<{Module}Category | null>
export async function delete{Module}Category(id: string): Promise<boolean>
```

**Standard Pattern**:

```typescript
import { createClient } from '@/lib/supabase/client';

export async function get{Module}s() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('{module}s')
    .select('*, category:categories(id, name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching {module}s:', error);
    return null;
  }
  return data;
}
```

**Error Handling**: Always return `null` on error, log to console

---

## Validation Layer Pattern

**Location**: `src/lib/{module}/validation.ts`

**Required Schemas**:

```typescript
import { z } from 'zod';

// Form schema
export const {module}FormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  // ... other fields
  status: z.enum(['active', 'inactive']).default('active'),
});

export type {Module}FormData = z.infer<typeof {module}FormSchema>;

// Category schema (if applicable)
export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional().or(z.literal('')),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
```

**Validation Rules**:

- Required fields: `.min(1, 'Error message')`
- Optional strings: `.optional().or(z.literal(''))`
- Enums: Use `.enum([...])` with `.default()`
- Emails: `.email('Invalid email')`
- Numbers: `.number().positive().optional()`

---

## Types Pattern

**Location**: `src/lib/{module}/types.ts`

**Required Interfaces**:

```typescript
export interface {Module} {
  id: string;
  company_id: string;
  name: string;
  // ... other fields
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  category?: {Module}Category;
}

export interface {Module}Category {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: string;
}

// Re-export form types
export type { {Module}FormData } from './validation';
```

---

## Development Workflow (Phase-by-Phase)

### Phase 1: Database & Data (Day 1)

1. **Database Schema** (`supabase/migrations/{timestamp}_{module}.sql`)
   - Main table with RLS policies
   - Category table (if applicable)
   - Foreign key constraints
   - Indexes on company_id

2. **Sample Data** (`supabase/seed/{module}.sql`)
   - **CRITICAL**: Insert 5-15 sample records per company
   - Cover all status types
   - Include category variations (if applicable)
   - Use realistic data (Faker.js patterns)

3. **Types** (`src/lib/{module}/types.ts`)
   - Match database schema exactly
   - Include category relationship if applicable

4. **API Utilities** (`src/lib/{module}/api.ts`)
   - All CRUD functions
   - Test each function manually

### Phase 2: UI Pages (Day 2)

5. **Validation Schema** (`src/lib/{module}/validation.ts`)
   - Form schema with zod
   - Category schema (if applicable)

6. **List Page** (`src/app/(dashboard)/erp/{module}/page.tsx`)
   - Table component
   - Search, filter, pagination
   - Navigate to detail/create

7. **Detail View Page** (`src/app/(dashboard)/erp/{module}/[id]/page.tsx`)
   - **Read-only** Card layout
   - Edit + Delete buttons in header
   - Back to List at bottom

8. **Create Page** (`src/app/(dashboard)/erp/{module}/new/page.tsx`)
   - Reusable form component
   - Toast notifications

9. **Edit Page** (`src/app/(dashboard)/erp/{module}/[id]/edit/page.tsx`)
   - Reusable form with defaultValues
   - Toast notifications

10. **Category Management** (`src/app/(dashboard)/erp/{module}/categories/page.tsx`)
    - Only if module has categories
    - Full CRUD table

### Phase 3: Polish (Day 3)

11. **Testing**
    - Create → verify in list
    - Edit → verify changes
    - Delete → verify removal
    - Search/filter → verify results
    - RLS → verify isolation per company

12. **Build Verification**

    ```powershell
    npm run build
    ```

13. **Update Tasks**
    - Mark completed tasks in `specs/002-erp-system-saas/tasks.md`

---

## UI/UX Standards

### Color Scheme

- Primary: White
- Secondary: Black
- Success: Green (badges, toasts)
- Destructive: Red (delete buttons, errors)
- Muted: Gray (descriptions, hints)

### Typography

- Page title: `text-3xl font-bold`
- Page description: `text-muted-foreground`
- Card title: `<CardTitle>`
- Labels: `text-sm font-medium`

### Spacing

- Page container: `space-y-6`
- Card grid: `grid gap-6 md:grid-cols-2`
- Button groups: `flex gap-2`
- Form fields: `space-y-4`

### Components (shadcn/ui only)

- Buttons: `<Button>` with variant prop
- Tables: `<Table>` with sorting
- Forms: `<Form>` with Controller
- Dialogs: `<Dialog>` for modals
- Cards: `<Card>` for sections
- Badges: `<Badge>` for status
- Toasts: `toast()` from sonner

### Icons (Lucide React only)

- Create: `Plus`
- Edit: `Edit`
- Delete: `Trash2`
- View: `Eye`
- Back: `ArrowLeft`
- Search: `Search`
- Filter: `Filter`

---

## Testing Checklist

- [ ] Create new record → appears in list
- [ ] Edit record → changes saved
- [ ] Delete record → removed from list
- [ ] Search → filters correctly
- [ ] Filter by status → shows correct records
- [ ] Filter by category → shows correct records (if applicable)
- [ ] Pagination → navigates correctly
- [ ] Detail view → displays all fields
- [ ] Edit button on detail → navigates to edit page
- [ ] Delete button on detail → removes record with confirmation
- [ ] Form validation → shows errors for invalid inputs
- [ ] RLS → Company A cannot see Company B's records
- [ ] Build → `npm run build` succeeds

---

## Common Pitfalls to Avoid

1. **DO NOT duplicate Edit button** on detail view (header + bottom)
   - ✅ Correct: Edit + Delete in header, Back to List at bottom
   - ❌ Wrong: Edit in header AND bottom

2. **DO NOT make detail view editable**
   - ✅ Correct: Read-only display with Edit button → separate edit page
   - ❌ Wrong: Inline editing on detail view

3. **DO NOT skip sample data**
   - ✅ Correct: Insert 5-15 records during Phase 1
   - ❌ Wrong: Empty database, manual entry later

4. **DO NOT use different routing patterns**
   - ✅ Correct: `[id]/page.tsx` for detail, `[id]/edit/page.tsx` for edit
   - ❌ Wrong: `[id]/detail/page.tsx` or `edit/[id]/page.tsx`

5. **DO NOT hardcode company_id**
   - ✅ Correct: Get from `auth.getUser()` or session
   - ❌ Wrong: `company_id = '123'`

6. **DO NOT use custom UI components**
   - ✅ Correct: shadcn/ui components only
   - ❌ Wrong: Custom CSS, other libraries

7. **DO NOT use non-Lucide icons**
   - ✅ Correct: `import { Plus } from 'lucide-react'`
   - ❌ Wrong: FontAwesome, Material Icons, etc.

---

## Module-Specific Customizations

While the pattern is standardized, each module may have unique fields:

### Customers

- Unique fields: `credit_limit`, `payment_terms`
- Category: Customer categories

### Suppliers

- Unique fields: `payment_terms`, `lead_time_days`
- Category: Supplier categories

### Products

- Unique fields: `sku`, `barcode`, `price`, `cost`, `stock_quantity`
- Category: Product categories

### Inventory

- Unique fields: `warehouse_id`, `quantity`, `reorder_point`
- No categories (uses warehouses)

### Sales Orders

- Unique fields: `customer_id`, `order_items[]`, `total_amount`
- No categories (uses customers)

### Purchase Orders

- Unique fields: `supplier_id`, `order_items[]`, `total_amount`
- No categories (uses suppliers)

---

## Quick Reference Checklist

When starting a new module, copy-paste this checklist:

```markdown
## Module: {Module Name}

### Phase 1: Database & Data

- [ ] Create migration file
- [ ] Add RLS policies
- [ ] Create category table (if applicable)
- [ ] Insert 5-15 sample records per company
- [ ] Create types.ts
- [ ] Create api.ts with CRUD functions
- [ ] Test API functions manually

### Phase 2: UI Pages

- [ ] Create validation.ts with zod schemas
- [ ] Create {module}-table.tsx component
- [ ] Create {module}-form.tsx component
- [ ] Create category-dialog.tsx (if applicable)
- [ ] Create list page (page.tsx)
- [ ] Create detail view ([id]/page.tsx) - READ-ONLY
- [ ] Create create page (new/page.tsx)
- [ ] Create edit page ([id]/edit/page.tsx)
- [ ] Create categories page (if applicable)

### Phase 3: Polish

- [ ] Test create → appears in list
- [ ] Test edit → changes saved
- [ ] Test delete → removed
- [ ] Test search/filter
- [ ] Test RLS isolation
- [ ] Verify detail view has Edit + Delete in header, Back at bottom
- [ ] Run `npm run build` successfully
- [ ] Update tasks.md

### Verification

- [ ] No duplicate Edit buttons on detail view
- [ ] Detail view is read-only (no inline editing)
- [ ] Sample data inserted (5-15 per company)
- [ ] Routing: [id] for detail, [id]/edit for edit
- [ ] Only shadcn/ui components used
- [ ] Only Lucide icons used
```

---

## Version History

- **v1.0** (October 18, 2025): Initial pattern from Module 1 (Customers)
  - Established routing structure ([id] vs [id]/edit)
  - Standardized detail view with Edit + Delete buttons
  - Removed duplicate actions from bottom
  - Sample data insertion as required step

---

## Compliance

This pattern document must be followed for:

- ✅ Module 2: Suppliers (T2.2.1-T2.2.6)
- ✅ Module 3: Products (T2.3.1-T2.3.6)
- ✅ Module 4: Inventory (T2.4.1-T2.4.6)
- ✅ Module 5: Warehouses (T2.5.1-T2.5.6)
- ✅ Module 6: Sales Orders (T2.6.1-T2.6.6)
- ✅ Module 7: Purchase Orders (T2.7.1-T2.7.6)
- ✅ Module 8: Invoices (T2.8.1-T2.8.6)
- ✅ Module 9: Payments (T2.9.1-T2.9.6)
- ✅ Module 10: Expenses (T2.10.1-T2.10.6)
- ✅ Module 11: Reports (T2.11.1-T2.11.6)
- ✅ Module 12: Settings (T2.12.1-T2.12.6)

Any deviation must be documented and justified in module-specific docs.
