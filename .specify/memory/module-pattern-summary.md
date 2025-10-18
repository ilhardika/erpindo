# Module Pattern - Quick Reference

**Based on Module 1 (Customers) - Completed October 18, 2025**

---

## 🎯 Core Pattern (NON-NEGOTIABLE)

### Routing Structure

```
/erp/{module}              → List page (table, search, filter)
/erp/{module}/new          → Create page (form)
/erp/{module}/[id]         → Detail view (READ-ONLY, Edit + Delete buttons)
/erp/{module}/[id]/edit    → Edit page (form with defaultValues)
/erp/{module}/categories   → Category management (if applicable)
```

### Detail View Rules

- ✅ **Header**: Edit button + Delete button (side by side)
- ✅ **Content**: 3-4 Cards (Basic Info, Contact, Financial, Record Info)
- ✅ **Bottom**: Back to List button ONLY
- ❌ **NEVER**: Duplicate Edit button at bottom
- ❌ **NEVER**: Inline editing (always redirect to /edit page)

---

## 📁 File Structure Template

```
src/lib/{module}/
  ├── api.ts           # CRUD: get, getById, create, update, delete
  ├── types.ts         # Interfaces + re-export FormData
  └── validation.ts    # Zod schemas (form + category)

src/components/{module}/
  ├── {module}-table.tsx      # List table with actions
  ├── {module}-form.tsx       # Reusable create/edit form
  └── category-dialog.tsx     # (if module has categories)

src/app/(dashboard)/erp/{module}/
  ├── page.tsx                # List
  ├── new/page.tsx            # Create
  ├── [id]/page.tsx           # Detail (READ-ONLY)
  ├── [id]/edit/page.tsx      # Edit
  └── categories/page.tsx     # (if applicable)
```

---

## 🔧 Development Workflow

### Phase 1: Database & Data (Day 1)

1. Migration file + RLS policies
2. **INSERT 5-15 SAMPLE RECORDS** per company (CRITICAL!)
3. Create types.ts
4. Create api.ts (test each function)

### Phase 2: UI Pages (Day 2)

5. validation.ts (zod schemas)
6. List page + Table component
7. **Detail view (READ-ONLY)** with Edit + Delete
8. Create page + Form component
9. Edit page (reuse Form)
10. Categories page (if applicable)

### Phase 3: Polish (Day 3)

11. Test all CRUD operations
12. Test RLS isolation
13. `npm run build` → verify success
14. Update tasks.md

---

## 🎨 UI Standards (shadcn/ui + Lucide)

### Components

- Buttons: `<Button>` with variants
- Tables: `<Table>` with sorting
- Forms: `<Form>` + react-hook-form + zod
- Cards: `<Card>` for sections
- Badges: `<Badge>` for status
- Toasts: `toast()` from sonner

### Icons (Lucide React)

- Create: `Plus`
- Edit: `Edit`
- Delete: `Trash2`
- View: `Eye`
- Back: `ArrowLeft`

### Colors

- Primary: White
- Secondary: Black
- Success: Green
- Destructive: Red
- Muted: Gray

---

## ✅ Pre-Flight Checklist

```markdown
- [ ] Sample data inserted (5-15 records per company)
- [ ] Detail view is READ-ONLY (no inline editing)
- [ ] Detail header has Edit + Delete buttons
- [ ] Detail bottom has Back to List ONLY (no duplicate Edit)
- [ ] Routing: [id] for detail, [id]/edit for edit
- [ ] Only shadcn/ui components used
- [ ] Only Lucide icons used
- [ ] RLS policies tested (company isolation)
- [ ] npm run build succeeds
```

---

## 🚫 Common Mistakes to Avoid

| ❌ Wrong                                | ✅ Correct                              |
| --------------------------------------- | --------------------------------------- |
| Duplicate Edit button (header + bottom) | Edit + Delete in header, Back at bottom |
| Inline editing on detail view           | Separate /edit page                     |
| Skip sample data                        | Insert 5-15 records in Phase 1          |
| [id]/detail/page.tsx                    | [id]/page.tsx                           |
| Custom CSS components                   | shadcn/ui only                          |
| FontAwesome icons                       | Lucide React only                       |

---

## 📋 Copy-Paste Checklist for New Module

```markdown
## Module: [Name]

### Phase 1: Database & Data

- [ ] Migration + RLS
- [ ] Sample data (5-15/company)
- [ ] types.ts
- [ ] api.ts + test

### Phase 2: UI

- [ ] validation.ts
- [ ] {module}-table.tsx
- [ ] {module}-form.tsx
- [ ] List page
- [ ] Detail page (READ-ONLY)
- [ ] Create page
- [ ] Edit page

### Phase 3: Polish

- [ ] Test CRUD
- [ ] Test RLS
- [ ] Build succeeds
- [ ] Update tasks.md
```

---

## 📚 Reference Files

- **Full Pattern**: `.specify/memory/module-pattern.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Tasks**: `specs/002-erp-system-saas/tasks.md`

---

## 🎓 Example: Module 1 (Customers)

**Routes**:

- `/erp/customers` → List (36 customers)
- `/erp/customers/new` → Create form
- `/erp/customers/[id]` → Detail (4 Cards, Edit + Delete)
- `/erp/customers/[id]/edit` → Edit form
- `/erp/customers/categories` → Category CRUD

**Components**:

- `CustomerTable` → search, filter, actions
- `CustomerForm` → reusable create/edit
- `CategoryDialog` → inline category creation

**Result**: ✅ 100% complete, build successful, pattern established

---

**Next Module**: Suppliers (T2.2.1-T2.2.6) - Follow this exact pattern!
