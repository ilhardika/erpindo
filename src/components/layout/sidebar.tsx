'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  CreditCard,
  Users,
  Activity,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Package,
  Users2,
  Percent,
  UserCheck,
  Calculator,
  Truck,
  User,
  Receipt,
  UserCog,
  BarChart3,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-provider'
import { useLogout } from '@/hooks/use-auth'
import { ModuleCategory, Module } from '@/types/modules'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  modules: Module[]
}

const iconMap = {
  // System modules
  CreditCard: CreditCard,
  Building2: Building2,
  Users: Users,
  Activity: Activity,
  // Company modules
  Receipt: Receipt,
  UserCog: UserCog,
  BarChart3: BarChart3,
  // ERP modules
  LayoutDashboard: LayoutDashboard,
  ShoppingCart: ShoppingCart,
  TrendingUp: TrendingUp,
  Package: Package,
  Users2: Users2,
  Percent: Percent,
  UserCheck: UserCheck,
  Calculator: Calculator,
  Truck: Truck,
  User: User,
}

export function Sidebar({ className, modules }: SidebarProps) {
  const { userProfile } = useAuth()
  const { logout } = useLogout()

  const groupedModules = modules.reduce(
    (acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = []
      }
      acc[module.category].push(module)
      return acc
    },
    {} as Record<ModuleCategory, Module[]>
  )

  const getCategoryTitle = (category: ModuleCategory) => {
    switch (category) {
      case 'system':
        return 'System Management'
      case 'company':
        return 'Company Management'
      case 'erp':
        return 'ERP Modules'
      default:
        return category
    }
  }

  const renderModuleItem = (module: Module) => {
    const IconComponent =
      iconMap[module.icon as keyof typeof iconMap] || LayoutDashboard

    return (
      <Link key={module.id} href={module.route_path}>
        <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-3">
          <IconComponent className="h-4 w-4" />
          <span className="text-sm">{module.name}</span>
        </Button>
      </Link>
    )
  }

  return (
    <div
      className={cn('pb-12 w-64 min-w-64 flex flex-col h-screen', className)}
    >
      <div className="space-y-4 py-4 flex-1">
        {/* Header */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            ERPindo
          </h2>
          {userProfile && (
            <div className="px-4 text-xs text-muted-foreground">
              <p className="font-medium">{userProfile.name}</p>
              <p className="capitalize">{userProfile.role}</p>
              {userProfile.companies?.name && (
                <p>{userProfile.companies.name}</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <div className="px-3">
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-4">
              {Object.entries(groupedModules).map(
                ([category, categoryModules]) => {
                  if (categoryModules.length === 0) return null

                  return (
                    <div key={category}>
                      <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {getCategoryTitle(category as ModuleCategory)}
                      </h3>
                      <div className="space-y-1">
                        {categoryModules
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map(renderModuleItem)}
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Footer */}
        <div className="px-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 px-3 text-muted-foreground hover:text-foreground"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
