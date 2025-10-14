'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { getCurrentUserRole, type UserRole } from '@/lib/auth/utils'

interface SimpleAuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function SimpleAuthGuard({
  children,
  requiredRole,
}: SimpleAuthGuardProps) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      if (requiredRole) {
        const userRole = await getCurrentUserRole()

        // Simple role check
        if (requiredRole === 'dev' && userRole !== 'dev') {
          window.location.href = '/login'
          return
        }

        if (
          requiredRole === 'owner' &&
          (!userRole || !['owner', 'dev'].includes(userRole))
        ) {
          window.location.href = '/login'
          return
        }
      }

      setChecking(false)
    } catch {
      window.location.href = '/login'
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
