'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-provider'

export function AuthDebugger() {
  const { user, userProfile, loading } = useAuth()

  useEffect(() => {
    // Only log in production for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 [AUTH DEBUG]', {
        hasUser: !!user,
        hasProfile: !!userProfile,
        loading,
        userId: user?.id,
        userRole: userProfile?.role,
        isActive: userProfile?.is_active,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      })
    }
  }, [user, userProfile, loading])

  return null
}
