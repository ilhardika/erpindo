# Module Pattern - Visual Guide

**Standardized from Module 1 (Customers)**

---

## 🗺️ Routing Architecture

```
/erp/{module}
│
├── /                           → List Page (CustomerTable)
│   ├── Search input
│   ├── Filter dropdowns
│   ├── "Add Customer" button → /new
│   └── Table with actions:
│       ├── "View Details" → /[id]
│       ├── "Edit" → /[id]/edit
│       └── "Delete" (with confirm)
│
├── /new                        → Create Page (CustomerForm)
│   ├── Form with validation
│   ├── "Create" button
│   └── "Cancel" → back to /
│
├── /[id]                       → Detail View (READ-ONLY) ⭐
│   ├── Header:
│   │   ├── [Edit] button → /[id]/edit
│   │   └── [Delete] button (confirm + toast)
│   ├── Content:
│   │   ├── Card 1: Basic Information
│   │   ├── Card 2: Contact Details
│   │   ├── Card 3: Financial Info
│   │   └── Card 4: Record Information
│   └── Bottom:
│       └── [Back to List] button → /
│
├── /[id]/edit                  → Edit Page (CustomerForm)
│   ├── Form with defaultValues
│   ├── "Update" button
│   └── "Cancel" → back to /[id]
│
└── /categories                 → Category Management
    ├── Category table
    ├── "Add Category" dialog
    └── Edit/Delete actions
```

---

## 📊 Component Hierarchy

```
Page Components (src/app/(dashboard)/erp/{module}/)
│
├── page.tsx (List)
│   └── Uses: {Module}Table
│       ├── Table (shadcn/ui)
│       ├── Input (search)
│       ├── Select (filters)
│       └── DropdownMenu (actions)
│
├── new/page.tsx (Create)
│   └── Uses: {Module}Form
│       ├── Form (react-hook-form)
│       ├── Input fields
│       ├── Select (category)
│       ├── CategoryDialog
│       └── Button (submit)
│
├── [id]/page.tsx (Detail) ⭐
│   └── Uses:
│       ├── Card (sections)
│       ├── Badge (status)
│       ├── Separator
│       └── Button (Edit, Delete, Back)
│
├── [id]/edit/page.tsx (Edit)
│   └── Uses: {Module}Form
│       └── (same as Create)
│
└── categories/page.tsx
    └── Uses:
        ├── Table (categories)
        ├── CategoryDialog
        └── Button (actions)
```

---

## 🔄 Data Flow Diagram

```
User Action → Component → API → Supabase → RLS Check → Response
│                                                          │
└──────────── Toast Notification ← Success/Error ─────────┘

Example: Create Customer
1. User fills form in CustomerForm component
2. react-hook-form validates with zod schema
3. onSubmit calls createCustomer(data) from api.ts
4. API calls supabase.from('customers').insert()
5. RLS policy checks company_id matches user's company
6. If success: toast.success() + router.push('/erp/customers')
7. If error: toast.error() + stay on form
```

---

## 🎨 Detail View Layout (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│  Customer Name                    [Edit] [Delete]            │
│  View customer details                                       │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────┬────────────────────────┐
│  📋 Basic Information  │  📞 Contact Details    │
│  ────────────────────  │  ─────────────────     │
│  Name: John Doe        │  Email: john@...       │
│  Code: CUST-001        │  Phone: +62...         │
│  Category: [Retail]    │  Address: Jl. ...      │
│  Status: [Active]      │                        │
└────────────────────────┴────────────────────────┘

┌────────────────────────┬────────────────────────┐
│  💰 Financial Info     │  📅 Record Info        │
│  ─────────────────     │  ──────────────        │
│  Credit Limit: 10M     │  Created: Oct 12       │
│  Payment Terms: 30     │  Updated: Oct 18       │
└────────────────────────┴────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [← Back to List]                                           │
└─────────────────────────────────────────────────────────────┘
```

**Key Points**:

- ✅ Edit + Delete in header (side by side)
- ✅ 4 Cards in 2x2 grid (responsive: 1 column on mobile)
- ✅ Back to List at bottom (NO duplicate Edit)
- ✅ Read-only display (no input fields)

---

## 🧩 Form Component Pattern

```typescript
// src/components/{module}/{module}-form.tsx

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>

    {/* Field Groups */}
    <div className="grid gap-4 md:grid-cols-2">

      {/* Basic Fields */}
      <FormField name="name" control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dropdown with Create New */}
      <FormField name="category_id" control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <div className="flex gap-2">
              <Select onValueChange={field.onChange} value={field.value}>
                {/* Options */}
              </Select>
              <Button onClick={() => setShowDialog(true)}>
                Create New
              </Button>
            </div>
          </FormItem>
        )}
      />

    </div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <Button type="submit" disabled={isLoading}>
        {mode === 'create' ? 'Create' : 'Update'}
      </Button>
      <Button variant="outline" onClick={() => router.back()}>
        Cancel
      </Button>
    </div>

  </form>
</Form>

{/* Category Dialog */}
<CategoryDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  onSuccess={handleNewCategory}
/>
```

---

## 🔐 RLS Policy Pattern

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their company's data
CREATE POLICY "company_isolation_select" ON customers
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM auth.users
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can only insert for their company
CREATE POLICY "company_isolation_insert" ON customers
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM auth.users
      WHERE id = auth.uid()
    )
  );

-- Repeat for UPDATE, DELETE
```

---

## 📦 Sample Data Pattern

```sql
-- Insert sample customers for Company 1
INSERT INTO customers (company_id, name, code, category_id, status) VALUES
  ('company-1-id', 'PT Maju Jaya', 'CUST-001', 'cat-1', 'active'),
  ('company-1-id', 'CV Sukses Abadi', 'CUST-002', 'cat-1', 'active'),
  ('company-1-id', 'Toko Berkah', 'CUST-003', 'cat-2', 'inactive'),
  -- ... 12 more
  ('company-1-id', 'UD Sejahtera', 'CUST-015', 'cat-3', 'active');

-- Repeat for Company 2, Company 3
-- Total: 15 customers × 3 companies = 45 records
```

**Rules**:

- 5-15 records per company
- Mix of active/inactive status
- Cover all category types
- Realistic names (Indonesian business names)

---

## 🧪 Testing Flow

```
1. Manual Testing Checklist
   ├── Create: Form validation → Submit → Appears in list
   ├── View: Click row → Detail page → All fields display
   ├── Edit: Click Edit → Form loads → Update → Changes saved
   ├── Delete: Click Delete → Confirm → Removed from list
   ├── Search: Type query → Results filter
   ├── Filter: Select status/category → Results filter
   └── RLS: Login as Company A → Cannot see Company B data

2. Build Verification
   └── npm run build → ✓ Compiled successfully

3. Documentation Update
   └── Mark tasks complete in tasks.md
```

---

## 🚀 Quick Start Checklist

```markdown
Starting Module: [Name]

Day 1 - Database & Data
├── [ ] Create migration file
├── [ ] Add RLS policies
├── [ ] Insert sample data (5-15/company) ⭐
├── [ ] Create types.ts
├── [ ] Create api.ts
└── [ ] Test API functions

Day 2 - UI Pages
├── [ ] Create validation.ts
├── [ ] Create {module}-table.tsx
├── [ ] Create {module}-form.tsx
├── [ ] Create list page
├── [ ] Create detail page (READ-ONLY) ⭐
├── [ ] Create create page
├── [ ] Create edit page
└── [ ] Create categories page (if needed)

Day 3 - Polish
├── [ ] Test all CRUD operations
├── [ ] Test RLS isolation
├── [ ] Verify detail view (Edit+Delete header, Back bottom)
├── [ ] npm run build succeeds
└── [ ] Update tasks.md
```

---

## 📖 Pattern Compliance Matrix

| Module    | List | Detail | Create | Edit | Categories | Sample Data     | Status |
| --------- | ---- | ------ | ------ | ---- | ---------- | --------------- | ------ |
| Customers | ✅   | ✅     | ✅     | ✅   | ✅         | ✅ (36 records) | 100%   |
| Suppliers | ⏳   | ⏳     | ⏳     | ⏳   | ⏳         | ⏳              | 0%     |
| Products  | ⏳   | ⏳     | ⏳     | ⏳   | ⏳         | ⏳              | 0%     |
| Inventory | ⏳   | ⏳     | ⏳     | ⏳   | N/A        | ⏳              | 0%     |
| ...       | ...  | ...    | ...    | ...  | ...        | ...             | ...    |

**Legend**: ✅ Complete | ⏳ Pending | N/A Not Applicable

---

## 🎯 Success Criteria

A module is considered **100% complete** when:

1. ✅ All 5 routes working (list, detail, create, edit, categories)
2. ✅ Detail view is READ-ONLY with correct button layout
3. ✅ Sample data inserted (5-15 records per company)
4. ✅ RLS policies tested (company isolation verified)
5. ✅ All CRUD operations functional
6. ✅ Search and filters working
7. ✅ Build succeeds without errors
8. ✅ Tasks marked complete in tasks.md

---

**Next**: Apply this pattern to Module 2 (Suppliers) → T2.2.1-T2.2.6
