'use client'

import { SimpleAuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useCallback, useEffect, useState } from 'react'
import { Module } from '@/types/modules'
import { getCurrentUserRole } from '@/lib/auth/utils'
import { getModulesByRole } from '@/lib/modules/utils'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SimpleAuthGuard>
      <DashboardContent>{children}</DashboardContent>
    </SimpleAuthGuard>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState<Module[]>([])

  const getUserRoleAndSetModules = useCallback(async () => {
    try {
      const role = await getCurrentUserRole()
      setModules(getModulesByRole(role))
    } catch (error) {
      console.error('Error fetching user role:', error)
      setModules(getModulesByRole('staff'))
    }
  }, [])

  useEffect(() => {
    getUserRoleAndSetModules()
  }, [getUserRoleAndSetModules])

  if (modules.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Loading modules...</div>
      </div>
    )
  }

  return <DashboardLayout modules={modules}>{children}</DashboardLayout>
}
