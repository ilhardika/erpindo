'use client'

import { RouteGuard } from '@/components/auth/route-guard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUserModules } from '@/hooks/use-user-modules'
import { Loader2 } from 'lucide-react'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard>
      <DashboardContent>{children}</DashboardContent>
    </RouteGuard>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { modules, loading, error } = useUserModules()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Error Loading Modules
          </h1>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return <DashboardLayout modules={modules}>{children}</DashboardLayout>
}
