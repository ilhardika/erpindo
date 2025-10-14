'use client'

import { SimpleAuthGuard } from '@/components/auth/auth-guard'
import { DashboardHeader } from '@/components/layout/dashboard-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users2,
  Clock,
  CheckSquare,
} from 'lucide-react'
import Link from 'next/link'

function ERPDashboard() {
  const workStats = [
    {
      title: "Today's Sales",
      value: 'Rp 12.5M',
      description: '15 transactions',
      icon: ShoppingCart,
      trend: '+8% vs yesterday',
      color: 'bg-green-500',
    },
    {
      title: 'Tasks Completed',
      value: '12',
      description: 'Out of 18 tasks',
      icon: CheckSquare,
      trend: '67% completion',
      color: 'bg-blue-500',
    },
    {
      title: 'Stock Alerts',
      value: '3',
      description: 'Items need attention',
      icon: Package,
      trend: 'Review required',
      color: 'bg-orange-500',
    },
    {
      title: 'Work Hours',
      value: '6.5h',
      description: 'Today',
      icon: Clock,
      trend: '1.5h remaining',
      color: 'bg-purple-500',
    },
  ]

  const todayTasks = [
    {
      task: 'Process pending orders',
      status: 'completed',
      priority: 'high',
      module: 'Sales',
    },
    {
      task: 'Update inventory count',
      status: 'pending',
      priority: 'medium',
      module: 'Inventory',
    },
    {
      task: 'Follow up with customers',
      status: 'pending',
      priority: 'low',
      module: 'Customer Service',
    },
  ]

  return (
    <SimpleAuthGuard>
      <div className="space-y-6">
        <DashboardHeader
          title="Good morning, Staff"
          description="Your ERP workspace - manage daily business operations"
        >
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/erp/pos">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Sale
              </Link>
            </Button>
          </div>
        </DashboardHeader>

        {/* Work Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {workStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Tasks</CardTitle>
              <CardDescription>
                Your assigned tasks and priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayTasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.status === 'completed'
                          ? 'bg-green-500'
                          : task.priority === 'high'
                            ? 'bg-red-500'
                            : task.priority === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <p
                        className={`text-sm font-medium ${
                          task.status === 'completed'
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}
                      >
                        {task.task}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {task.module} • {task.priority} priority
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.status === 'completed' ? 'secondary' : 'default'
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Frequently used modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2">
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/erp/pos">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span className="text-sm">POS</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/erp/inventory">
                    <Package className="h-6 w-6 mb-2" />
                    <span className="text-sm">Inventory</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/erp/sales-purchasing">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span className="text-sm">Sales</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <Link href="/erp/customers-suppliers">
                    <Users2 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Customers</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Your weekly performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <p className="text-sm text-muted-foreground">
                  Task Completion Rate
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Rp 85M</div>
                <p className="text-sm text-muted-foreground">Sales This Week</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">42h</div>
                <p className="text-sm text-muted-foreground">
                  Total Work Hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleAuthGuard>
  )
}

export default ERPDashboard
