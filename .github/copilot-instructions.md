# erpindo Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-12

## Active Technologies

- TypeScript 5.x with Next.js 15.5.4 + React 19+, Supabase JS Client, shadcn/ui, Tailwind CSS v4, Lucide React (002-erp-system-saas)
- Supabase PostgreSQL with Row Level Security (RLS) for multi-tenant isolation (002-erp-system-saas)

- TypeScript 5.x with Next.js 14+ (App Router) + Next.js, React 18+, Supabase JS Client, shadcn/ui, Tailwind CSS, Lucide React (002-erp-system-saas)

## Project Structure

```
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x with Next.js 14+ (App Router): Follow standard conventions

## Clean Code Principles

All code must adhere to these fundamental principles:

### Core Principles

- **DRY (Don't Repeat Yourself)** - Avoid code duplication, extract reusable components/utilities
- **KISS (Keep It Simple, Stupid)** - Prefer simple, readable solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)** - Only build what's necessary, avoid over-engineering
- **Consistency** - Maintain consistent naming, structure, and formatting across codebase

### SOLID Principles

- **S**ingle Responsibility - Each function/component has one clear purpose
- **O**pen/Closed - Open for extension, closed for modification
- **L**iskov Substitution - Subtypes must be substitutable for their base types
- **I**nterface Segregation - No client should depend on methods it doesn't use
- **D**ependency Inversion - Depend on abstractions, not concretions

### Architecture Guidelines

- **Separation of Concerns** - UI, business logic, and data access are clearly separated
- **Scalability** - Code structure supports growth and changing requirements
- **Maintainability** - Code is easy to read, understand, and modify
- **Reusability** - Components and utilities can be used in multiple contexts
- **shadcn/ui Pattern** - All UI components follow established patterns and conventions

## Recent Changes

- 002-erp-system-saas: Added TypeScript 5.x with Next.js 15.5.4 + React 19+, Supabase JS Client, shadcn/ui, Tailwind CSS v4, Lucide React

- 002-erp-system-saas: Added TypeScript 5.x with Next.js 14+ (App Router) + Next.js, React 18+, Supabase JS Client, shadcn/ui, Tailwind CSS, Lucide React

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
