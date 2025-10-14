# ERPindo - Main Development Branch

This repository uses **main** as the primary development branch.

## Branch Structure:

- `main` - Primary development branch (contains complete Phase 1 ERP)
- All future development will be done on `main`
- No feature branches - direct commits to `main`

## Current Status:

- ✅ Complete Phase 1 ERP System Implementation
- ✅ Multi-tenant authentication with Supabase
- ✅ Role-based dashboards and permissions
- ✅ Mobile responsive design
- ✅ Enhanced login UX with auto-fill demo accounts

## Technology Stack

- **Frontend**: Next.js 15+ with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Authentication + Real-time)
- **Styling**: Tailwind CSS v4 with shadcn/ui components

## Quick Start:

```bash
npm install
npm run dev  # Runs on http://localhost:3000
```

## Development Workflow:

```bash
git pull origin main
# Make changes...
git add .
git commit -m "your changes"
git push origin main
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
