'use client'

import { withRoleGuard } from '@/components/auth/route-guard'
import { DashboardHeader } from '@/components/layout/dashboard-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Building2,
  Settings,
  Activity,
  ArrowRight,
  Shield,
  Database,
  CheckCircle,
  Info,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-provider'

function SystemDashboard() {
  const { userProfile } = useAuth()

  const systemModules = [
    {
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: Users,
      href: '/system/users',
      count: '1 active',
      status: 'active',
      available: true,
    },
    {
      title: 'Company Management',
      description: 'Manage company accounts and subscriptions',
      icon: Building2,
      href: '/system/companies',
      count: '0 companies',
      status: 'coming-soon',
      available: false,
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings',
      icon: Settings,
      href: '/system/settings',
      count: '0 configs',
      status: 'coming-soon',
      available: false,
    },
    {
      title: 'Database Admin',
      description: 'Database management and monitoring',
      icon: Database,
      href: '/system/database',
      count: '1 instance',
      status: 'coming-soon',
      available: false,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'deployment',
      message: 'User management system activated - Phase 1 complete',
      timestamp: 'Just now',
      severity: 'success',
      icon: CheckCircle,
    },
    {
      id: 2,
      type: 'system_info',
      message: 'ERPindo Phase 1 implementation successfully deployed',
      timestamp: '5 minutes ago',
      severity: 'info',
      icon: Info,
    },
    {
      id: 3,
      type: 'security',
      message:
        'Authentication system and role-based access control implemented',
      timestamp: '10 minutes ago',
      severity: 'success',
      icon: Shield,
    },
    {
      id: 4,
      type: 'ui_update',
      message: 'Dashboard layouts and navigation system activated',
      timestamp: '15 minutes ago',
      severity: 'info',
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="System Administration Dashboard"
        description={`Welcome back, ${userProfile?.name}! Monitor and manage the ERPindo platform.`}
      />

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Implementation Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Phase 1</div>
            <p className="text-xs text-muted-foreground">
              Authentication & User Management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Modules
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1/17</div>
            <p className="text-xs text-muted-foreground">
              User Management active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Access</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Full</div>
            <p className="text-xs text-muted-foreground">Dev Administrator</p>
          </CardContent>
        </Card>
      </div>

      {/* System Modules */}
      <Card>
        <CardHeader>
          <CardTitle>System Modules</CardTitle>
          <CardDescription>
            Access available system functionality and view development roadmap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemModules.map(module => {
              const Icon = module.icon
              const ModuleCard = (
                <Card
                  className={`transition-colors ${
                    module.available
                      ? 'hover:bg-accent cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`h-8 w-8 ${
                            module.available
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {module.count}
                            </Badge>
                            <Badge
                              variant={
                                module.status === 'active'
                                  ? 'default'
                                  : module.status === 'coming-soon'
                                    ? 'outline'
                                    : 'secondary'
                              }
                              className="text-xs"
                            >
                              {module.status === 'coming-soon'
                                ? 'Coming Soon'
                                : module.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {module.available ? (
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )

              return module.available ? (
                <Link key={module.title} href={module.href}>
                  {ModuleCard}
                </Link>
              ) : (
                <div key={module.title}>{ModuleCard}</div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Development Activity</CardTitle>
          <CardDescription>
            Track system implementation progress and recent changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map(activity => {
              const ActivityIcon = activity.icon
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                >
                  <ActivityIcon
                    className={`w-5 h-5 mt-1 ${
                      activity.severity === 'success'
                        ? 'text-green-500'
                        : activity.severity === 'warning'
                          ? 'text-yellow-500'
                          : activity.severity === 'error'
                            ? 'text-red-500'
                            : 'text-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.severity === 'success'
                        ? 'default'
                        : activity.severity === 'warning'
                          ? 'destructive'
                          : activity.severity === 'error'
                            ? 'destructive'
                            : 'secondary'
                    }
                    className="text-xs"
                  >
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full" disabled>
              View Development Roadmap
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withRoleGuard(SystemDashboard, 'dev')
