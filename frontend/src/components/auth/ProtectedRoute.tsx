import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/stores/authStore'

export interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredPermissions?: string[]
  requiredRole?: 'owner' | 'dev' | 'employee'
  fallbackPath?: string
  allowedRoles?: ('owner' | 'dev' | 'employee')[]
  redirectAuthenticated?: boolean
  redirectToRoleDashboard?: boolean
  requiredCompanyId?: string
  showUnauthorizedMessage?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = '/login',
  allowedRoles = [],
  redirectAuthenticated = false,
  redirectToRoleDashboard = false,
  requiredCompanyId,
  showUnauthorizedMessage = false
}) => {
  const { 
    user, 
    isLoading, 
    isInitialized, 
    isAuthenticated,
    hasPermission,
    isOwner,
    isAdmin
  } = useAuth()
  const location = useLocation()

  // No need to initialize auth here - handled in App.tsx

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Redirect authenticated users (e.g., from login page)
  if (redirectAuthenticated && isAuthenticated) {
    const defaultPath = user?.role === 'dev' ? '/admin' : '/dashboard'
    return <Navigate to={defaultPath} replace />
  }

  // Role-based dashboard redirection
  if (redirectToRoleDashboard && isAuthenticated && user) {
    const roleDashboard = user.role === 'dev' ? '/admin' : '/dashboard'
    return <Navigate to={roleDashboard} replace />
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  // Check role-based access
  if (user && requiredRole) {
    const hasRequiredRole = user.role === requiredRole || 
      (requiredRole === 'dev' && isOwner()) ||
      (requiredRole === 'employee' && (isAdmin() || isOwner()))

    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            message: `Akses ditolak. Role ${requiredRole} diperlukan.`,
            from: location.pathname 
          }}
          replace 
        />
      )
    }
  }

  // Check allowed roles
  if (user && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.includes(user.role || 'employee')

    if (!hasAllowedRole) {
      // Show unauthorized message in Indonesian if requested
      if (showUnauthorizedMessage) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  Anda tidak memiliki akses
                </h2>
                <p className="text-red-600">
                  Role yang diizinkan: {allowedRoles.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )
      }

      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            message: `Akses ditolak. Role yang diizinkan: ${allowedRoles.join(', ')}.`,
            from: location.pathname 
          }}
          replace 
        />
      )
    }
  }

  // Check company ID requirement (multi-tenant isolation)
  if (user && requiredCompanyId && user.tenant_id !== requiredCompanyId) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          message: `Akses ditolak. Anda tidak memiliki akses ke perusahaan ini.`,
          from: location.pathname 
        }}
        replace 
      />
    )
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(permission => 
        !hasPermission(permission)
      )

      // Show unauthorized message in Indonesian if requested
      if (showUnauthorizedMessage) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  Anda tidak memiliki akses
                </h2>
                <p className="text-red-600">
                  Permission diperlukan: {missingPermissions.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )
      }

      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            message: `Akses ditolak. Permission diperlukan: ${missingPermissions.join(', ')}.`,
            from: location.pathname 
          }}
          replace 
        />
      )
    }
  }

  // All checks passed, render children
  return <>{children}</>
}

// Higher-order component for route protection
export const withProtectedRoute = (
  Component: React.ComponentType<any>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

// Specialized components for different protection levels
export const OwnerOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="owner">
    {children}
  </ProtectedRoute>
)

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['owner', 'dev']}>
    {children}
  </ProtectedRoute>
)

export const EmployeeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['owner', 'dev', 'employee']}>
    {children}
  </ProtectedRoute>
)

// Permission-based route guards
export const withPermission = (
  Component: React.ComponentType<any>,
  permissions: string[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredPermissions={permissions}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

// Utility component for conditional rendering based on permissions
export const PermissionGate: React.FC<{
  children: React.ReactNode
  permissions: string[]
  fallback?: React.ReactNode
  requireAll?: boolean
}> = ({ 
  children, 
  permissions, 
  fallback = null, 
  requireAll = true 
}) => {
  const { hasPermission } = useAuth()

  const hasAccess = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission))

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Role-based conditional rendering
export const RoleGate: React.FC<{
  children: React.ReactNode
  roles: ('owner' | 'dev' | 'employee')[]
  fallback?: React.ReactNode
}> = ({ children, roles, fallback = null }) => {
  const { user } = useAuth()

  const hasRole = user && roles.includes(user.role || 'employee')

  return hasRole ? <>{children}</> : <>{fallback}</>
}

export default ProtectedRoute