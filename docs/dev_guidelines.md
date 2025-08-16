# Developer Guidelines – ERP SaaS (Frontend Phase)

## Tech Stack

- **Framework**: React 19 (JavaScript)
- **API & State**: Redux Toolkit + RTK Query
- **Router**: React Router v7
- **UI Library**: shadcn/ui (Tailwind-based, modern & minimalist)
- **Styling**: Tailwind CSS v4 + Layout Components
- **Icons**: Lucide (Outlined)
- **Theme**: White primary, Black secondary, Light Gray accents
- **Language**: UI in Indonesian
- **Goals**: Responsive, Scalable, DRY, Clean Code

---

## Project Structure

src/
assets/ # Static files
components/ # Reusable UI
features/ # Modules (POS, Inventory, etc.)
layouts/ # Dashboard & Auth layouts
pages/ # Page-level views
routes/ # Route configs
store/ # Redux setup
services/ # RTK Query endpoints (mock-based for now)
data/ # Mock JSON data
utils/ # Helpers
hooks/ # Custom hooks

---

## UI & Styling

- Minimal, clean, and mobile-first responsive design.
- White background, black text, gray for secondary elements.
- Consistent spacing & typography via Tailwind scale.
- Dashboard layout: sidebar (nav), header (search/profile), main content.
- All UI text stored in `lang/id.js`.

---

## Data & State (Frontend Only)

- **No database integration yet** — all data stored in `src/data` as JSON files.
- Import mock data into RTK Query services to simulate API calls.
- Keep API structure consistent with planned backend for easy integration later.

---

## Routing

- Centralized in `routes/index.js`.
- Role-based protection: `SuperadminRoute`, `OwnerRoute`, `EmployeeRoute`.
- Redirect unauthenticated users to login.

---

## Code Quality

- DRY principle, reusable components.
- ESLint + Prettier for consistency.
- Naming:
  - Components: PascalCase
  - Files: kebab-case
  - State/API: camelCase

---

## Deployment

- Frontend: Vercel
- Environment variables prepared for future backend integration.

---

## Future Integration

- Replace `src/data` mock with Supabase API calls when backend is ready.
- Keep data structure in mock files aligned with final DB schema.
