'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
}

export function RouteGuard({
  children,
  requiredRole,
  fallback,
}: RouteGuardProps) {
  const router = useRouter()
  const {
    isAuthenticated,
    hasRequiredRole,
    loading,
    redirectTo,
    user,
    userProfile,
  } = useAuthGuard(requiredRole)

  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    // Only redirect if we're not loading AND we have a clear redirect decision
    if (!loading && redirectTo) {
      router.push(redirectTo)
    }
  }, [loading, redirectTo, router])

  // Add timeout to prevent infinite loading - increased timeout for production
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn(
          '⚠️ [RouteGuard] Auth loading timeout reached, forcing check'
        )
        console.log('🔍 [RouteGuard] Debug state:', {
          loading,
          isAuthenticated,
          hasUser: !!user,
          hasProfile: !!userProfile,
          requiredRole,
        })
        setTimeoutReached(true)
      }
    }, 5000) // Increased to 5 seconds for slower connections

    return () => clearTimeout(timeout)
  }, [loading, isAuthenticated, user, userProfile, requiredRole])

  // Show loading while auth state is being determined
  // Show loading if: still loading, or user exists but no profile yet (profile fetching)
  if (
    (loading && !timeoutReached) ||
    (user && !userProfile && !timeoutReached)
  ) {
    return (
      fallback || (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2 text-muted-foreground">Loading...</p>
        </div>
      )
    )
  }

  // If timeout reached and still no auth data, redirect to login
  if (timeoutReached && !isAuthenticated) {
    router.push('/login')
    return null
  }

  // If we have a redirect target, show loading instead of access denied
  if (redirectTo) {
    return (
      fallback || (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2 text-muted-foreground">Redirecting...</p>
        </div>
      )
    )
  }

  // Only block access if we have completed auth check and failed (and no redirect pending)
  if ((!loading && !isAuthenticated) || (!loading && !hasRequiredRole)) {
    return (
      fallback || (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  const GuardedComponent = (props: P) => (
    <RouteGuard requiredRole={requiredRole}>
      <Component {...props} />
    </RouteGuard>
  )

  GuardedComponent.displayName = `withRoleGuard(${Component.displayName || Component.name})`

  return GuardedComponent
}
