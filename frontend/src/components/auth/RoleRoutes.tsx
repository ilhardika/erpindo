import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/authStore'
import { ProtectedRoute } from './ProtectedRoute'

// Role-based route configuration
export interface RoleRouteConfig {
  path: string
  component: React.ComponentType<any>
  roles: ('owner' | 'admin' | 'employee')[]
  permissions?: string[]
  exact?: boolean
  redirectTo?: string
}

// Role-based routing component
export interface RoleRoutesProps {
  routes: RoleRouteConfig[]
  fallbackPath?: string
  unauthorizedPath?: string
}

export const RoleRoutes: React.FC<RoleRoutesProps> = ({
  routes,
  fallbackPath = '/login',
  unauthorizedPath = '/unauthorized'
}) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  // Find matching route
  const currentRoute = routes.find(route => {
    if (route.exact) {
      return location.pathname === route.path
    }
    return location.pathname.startsWith(route.path)
  })

  // No matching route found
  if (!currentRoute) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />
  }

  // Check role access
  const hasRoleAccess = user && currentRoute.roles.includes(user.role || 'employee')

  if (!hasRoleAccess) {
    return (
      <Navigate 
        to={currentRoute.redirectTo || unauthorizedPath} 
        state={{ 
          message: `Akses ditolak. Role yang diizinkan: ${currentRoute.roles.join(', ')}.`,
          from: location.pathname 
        }}
        replace 
      />
    )
  }

  // Render with protection
  const Component = currentRoute.component

  return (
    <ProtectedRoute 
      allowedRoles={currentRoute.roles}
      requiredPermissions={currentRoute.permissions || []}
    >
      <Component />
    </ProtectedRoute>
  )
}

// Pre-configured role-based route components
export const OwnerRoute: React.FC<{ component: React.ComponentType<any> }> = ({ component: Component }) => (
  <ProtectedRoute requiredRole="owner">
    <Component />
  </ProtectedRoute>
)

export const AdminRoute: React.FC<{ component: React.ComponentType<any> }> = ({ component: Component }) => (
  <ProtectedRoute allowedRoles={['owner', 'admin']}>
    <Component />
  </ProtectedRoute>
)

export const EmployeeRoute: React.FC<{ component: React.ComponentType<any> }> = ({ component: Component }) => (
  <ProtectedRoute allowedRoles={['owner', 'admin', 'employee']}>
    <Component />
  </ProtectedRoute>
)

// Dashboard routing based on user role
export const DashboardRoute: React.FC = () => {
  const { isOwner, isAdmin } = useAuth()

  if (isOwner()) {
    return <Navigate to="/dashboard/owner" replace />
  }

  if (isAdmin()) {
    return <Navigate to="/dashboard/admin" replace />
  }

  return <Navigate to="/dashboard/employee" replace />
}

// Menu route resolver based on permissions
export const MenuRoute: React.FC<{ 
  ownerComponent: React.ComponentType<any>
  adminComponent: React.ComponentType<any>
  employeeComponent: React.ComponentType<any>
}> = ({ ownerComponent: OwnerComponent, adminComponent: AdminComponent, employeeComponent: EmployeeComponent }) => {
  const { isOwner, isAdmin } = useAuth()

  if (isOwner()) {
    return <OwnerComponent />
  }

  if (isAdmin()) {
    return <AdminComponent />
  }

  return <EmployeeComponent />
}

// Route permission checker
export const useRoutePermission = () => {
  const { user, hasPermission, isOwner, isAdmin } = useAuth()

  const canAccessRoute = (
    routeRoles: ('owner' | 'admin' | 'employee')[],
    routePermissions: string[] = []
  ): boolean => {
    if (!user) return false

    // Check role access
    const hasRoleAccess = routeRoles.includes(user.role || 'employee')
    if (!hasRoleAccess) return false

    // Check permissions if specified
    if (routePermissions.length > 0) {
      return routePermissions.every(permission => hasPermission(permission))
    }

    return true
  }

  const getAccessibleRoutes = (routes: RoleRouteConfig[]): RoleRouteConfig[] => {
    return routes.filter(route => 
      canAccessRoute(route.roles, route.permissions)
    )
  }

  const getDefaultRoute = (): string => {
    if (isOwner()) return '/dashboard/owner'
    if (isAdmin()) return '/dashboard/admin'
    return '/dashboard/employee'
  }

  return {
    canAccessRoute,
    getAccessibleRoutes,
    getDefaultRoute
  }
}

// Navigation guard hook
export const useNavigationGuard = () => {
  const { user, isAuthenticated } = useAuth()

  const checkRouteAccess = (
    targetPath: string,
    requiredRoles: ('owner' | 'admin' | 'employee')[] = [],
    requiredPermissions: string[] = []
  ): { 
    canAccess: boolean
    redirectTo?: string
    reason?: string
  } => {
    // Check authentication
    if (!isAuthenticated) {
      return {
        canAccess: false,
        redirectTo: `/login?redirect=${encodeURIComponent(targetPath)}`,
        reason: 'Authentication required'
      }
    }

    // Check role access
    if (requiredRoles.length > 0) {
      const hasRoleAccess = user && requiredRoles.includes(user.role || 'employee')
      if (!hasRoleAccess) {
        return {
          canAccess: false,
          redirectTo: '/unauthorized',
          reason: `Role access denied. Required: ${requiredRoles.join(', ')}`
        }
      }
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const { hasPermission } = useAuth()
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      )
      
      if (!hasAllPermissions) {
        return {
          canAccess: false,
          redirectTo: '/unauthorized',
          reason: `Permission denied. Required: ${requiredPermissions.join(', ')}`
        }
      }
    }

    return { canAccess: true }
  }

  return { checkRouteAccess }
}

// Default route configurations for Indonesian ERP
export const indonesianERPRoutes: RoleRouteConfig[] = [
  // Owner routes
  {
    path: '/dashboard/owner',
    component: () => <div>Owner Dashboard</div>,
    roles: ['owner'],
    permissions: ['tenant.manage']
  },
  {
    path: '/settings/company',
    component: () => <div>Company Settings</div>,
    roles: ['owner'],
    permissions: ['settings.manage']
  },
  {
    path: '/users/manage',
    component: () => <div>User Management</div>,
    roles: ['owner'],
    permissions: ['users.manage']
  },

  // Admin routes
  {
    path: '/dashboard/admin',
    component: () => <div>Admin Dashboard</div>,
    roles: ['owner', 'admin'],
    permissions: ['reports.view']
  },
  {
    path: '/products/manage',
    component: () => <div>Product Management</div>,
    roles: ['owner', 'admin'],
    permissions: ['products.manage']
  },
  {
    path: '/customers/manage',
    component: () => <div>Customer Management</div>,
    roles: ['owner', 'admin'],
    permissions: ['customers.manage']
  },

  // Employee routes
  {
    path: '/dashboard/employee',
    component: () => <div>Employee Dashboard</div>,
    roles: ['owner', 'admin', 'employee'],
    permissions: ['orders.view']
  },
  {
    path: '/pos/cashier',
    component: () => <div>POS Cashier</div>,
    roles: ['owner', 'admin', 'employee'],
    permissions: ['orders.create']
  },
  {
    path: '/products/view',
    component: () => <div>Product Catalog</div>,
    roles: ['owner', 'admin', 'employee'],
    permissions: ['products.view']
  }
]

export default RoleRoutes