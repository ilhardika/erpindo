'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-provider'
import { getDefaultRoute } from '@/lib/permissions/role-permissions'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirectPage() {
  const { userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userProfile) {
      const defaultRoute = getDefaultRoute(userProfile)
      if (defaultRoute !== '/login') {
        router.replace(defaultRoute)
      }
    }
  }, [userProfile, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return null
}
