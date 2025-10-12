'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'
import { UserRole } from '@/types/auth'
import {
  hasRoleAccess,
  canAccessModule,
  getDefaultRoute,
} from '@/lib/permissions/role-permissions'
import { ModuleCategory } from '@/types/modules'

export function useAuthGuard(requiredRole?: UserRole) {
  const { user, userProfile, loading } = useAuth()

  const isAuthenticated = !!user && !!userProfile
  const hasRequiredRole = requiredRole
    ? userProfile?.role && hasRoleAccess(userProfile.role, requiredRole)
    : true

  // Consider still loading if we have user but no profile (profile is being fetched)
  const isStillLoading = loading || (!!user && !userProfile)

  // Don't redirect while still loading auth state
  const redirectTo = isStillLoading
    ? null
    : !isAuthenticated
      ? '/login'
      : !hasRequiredRole
        ? getDefaultRoute(userProfile)
        : null

  return {
    isAuthenticated,
    hasRequiredRole,
    loading: isStillLoading,
    user,
    userProfile,
    redirectTo,
  }
}

export function useModuleAccess(moduleCategory: ModuleCategory) {
  const { userProfile } = useAuth()

  return {
    canAccess: canAccessModule(userProfile, moduleCategory),
    userProfile,
  }
}

export function useLogin() {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
    } catch (err) {
      console.error('❌ [useLogin] SignIn failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      console.error('❌ [useLogin] Error message:', errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    loading,
    error,
  }
}

export function useLogout() {
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const logout = async () => {
    setLoading(true)
    try {
      await signOut()
      // Force immediate redirect to login after successful logout
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  return {
    logout,
    loading,
  }
}
