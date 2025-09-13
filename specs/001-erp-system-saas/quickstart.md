# Quickstart Guide: ERP System Development

**Date**: September 13, 2025  
**Feature**: ERP System (SaaS) with Multi-Tenant Architecture  
**Estimated Time**: 2-3 hours for initial setup

## Prerequisites

- Node.js 18+ installed
- Git for version control
- Supabase account and project created
- VS Code or preferred code editor

## Step 1: Supabase Setup (30 minutes)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create new project
2. Note down your project credentials:
   - Project URL: `https://riupfvwigxwkbclojqlw.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Project ID: `riupfvwigxwkbclojqlw`

### 1.2 Run Database Migrations

1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Initialize project: `supabase init`
4. Link to your project: `supabase link --project-ref riupfvwigxwkbclojqlw`
5. Run migrations:
   ```bash
   supabase db push
   # Or manually execute the SQL files in contracts/ directory
   ```

### 1.3 Verify Database Setup

1. Open Supabase Dashboard
2. Check Tables section - should see all ERP tables
3. Verify RLS policies are enabled
4. Test with sample data insertion

## Step 2: React Project Setup (45 minutes)

### 2.1 Create React Application

```bash
# Create new React app with TypeScript
npx create-react-app erpindo-frontend --template typescript
cd erpindo-frontend

# Install required dependencies
npm install @supabase/supabase-js
npm install zustand react-hook-form @hookform/resolvers zod
npm install @tailwindcss/forms @tailwindcss/typography
npm install lucide-react

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button form input table card dialog
```

### 2.2 Configure Tailwind CSS

```bash
# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f8fafc",
          500: "#64748b",
          900: "#0f172a",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
```

### 2.3 Environment Configuration

Create `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://riupfvwigxwkbclojqlw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Basic Application Structure (60 minutes)

### 3.1 Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.2 Setup Authentication Store

Create `src/stores/authStore.ts`:

```typescript
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  role: "dev" | "owner" | "staff" | null;
  companyId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  companyId: null,
  loading: true,

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await get().checkAuth();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null, companyId: null });
  },

  checkAuth: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Fetch user details including role and company
      const { data: userData } = await supabase
        .from("users")
        .select("role, company_id")
        .eq("id", user.id)
        .single();

      set({
        user,
        role: userData?.role || null,
        companyId: userData?.company_id || null,
        loading: false,
      });
    } else {
      set({ user: null, role: null, companyId: null, loading: false });
    }
  },
}));
```

### 3.3 Create Route Protection

Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "dev" | "owner" | "staff";
  allowedRoles?: ("dev" | "owner" | "staff")[];
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, role, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  if (allowedRoles && !allowedRoles.includes(role!)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};
```

### 3.4 Basic Login Component

Create `src/components/auth/LoginForm.tsx`:

```typescript
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-2xl font-bold text-center">Login ERP System</h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Card>
  );
};
```

## Step 4: Dashboard Layout (45 minutes)

### 4.1 Create Dashboard Layout

Create `src/components/layout/DashboardLayout.tsx`:

```typescript
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, role, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
```

### 4.2 Create Navigation Sidebar

Create `src/components/layout/Sidebar.tsx`:

```typescript
import { useAuthStore } from "@/stores/authStore";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
} from "lucide-react";

export const Sidebar = () => {
  const { role } = useAuthStore();

  const getMenuItems = () => {
    const baseItems = [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    ];

    if (role === "dev") {
      return [
        ...baseItems,
        { label: "Companies", icon: Users, path: "/companies" },
        { label: "Subscription Plans", icon: FileText, path: "/plans" },
        { label: "System Settings", icon: Settings, path: "/settings" },
      ];
    }

    if (role === "owner") {
      return [
        ...baseItems,
        { label: "POS", icon: ShoppingCart, path: "/pos" },
        { label: "Inventory", icon: Package, path: "/inventory" },
        { label: "Customers", icon: Users, path: "/customers" },
        { label: "Employees", icon: Users, path: "/employees" },
        { label: "Reports", icon: FileText, path: "/reports" },
      ];
    }

    // Staff menus based on permissions
    return baseItems;
  };

  return (
    <div className="w-64 bg-white border-r shadow-sm">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">ERP System</h1>
      </div>
      <nav className="p-4">
        {getMenuItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
```

## Step 5: Test the Setup (30 minutes)

### 5.1 Create Test Data

1. Open Supabase SQL Editor
2. Insert test subscription plan and company:

```sql
-- Insert test company
INSERT INTO companies (name, email, subscription_plan_id)
VALUES ('Test Company', 'test@company.com',
  (SELECT id FROM subscription_plans WHERE name = 'Professional'));

-- Create test owner user (requires manual auth.users entry first)
```

### 5.2 Test Authentication Flow

1. Start the development server: `npm start`
2. Navigate to `/login`
3. Test login with created credentials
4. Verify dashboard loads with correct role-based navigation
5. Test data isolation by switching between different user accounts

### 5.3 Verify Multi-Tenancy

1. Create multiple companies in database
2. Create users for different companies
3. Login as different users
4. Confirm each user only sees their company's data

## Step 6: MCP Server Integration (15 minutes)

### 6.1 Configure MCP Server

Add to your Windsurf configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=riupfvwigxwkbclojqlw"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<your-access-token>"
      }
    }
  }
}
```

### 6.2 Test MCP Integration

1. Start MCP server
2. Use AI assistant to query Supabase data
3. Verify schema access and data operations

## Success Criteria

✅ **Database Setup**: All tables created with proper RLS policies  
✅ **Authentication**: Login/logout working with role detection  
✅ **Multi-Tenancy**: Data isolation between companies verified  
✅ **UI Framework**: shadcn/ui components rendering correctly  
✅ **Navigation**: Role-based menu system functional  
✅ **MCP Integration**: AI assistant can interact with database

## Next Steps

After completing this quickstart:

1. Implement individual ERP modules (POS, Inventory, etc.)
2. Add comprehensive error handling and validation
3. Implement offline-first PWA features
4. Add real-time subscriptions for collaborative features
5. Build comprehensive test suite
6. Deploy to production environment

## Troubleshooting

### Common Issues

- **Supabase connection fails**: Check environment variables and project credentials
- **RLS policies block data**: Verify JWT contains correct role and company_id claims
- **Build errors**: Ensure all dependencies are installed and TypeScript is configured
- **Authentication loop**: Check Supabase auth configuration and callback URLs

### Debug Commands

```bash
# Check Supabase connection
supabase status

# View database logs
supabase logs db

# Reset local database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts
```
