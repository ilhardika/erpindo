'use client'

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
  Users,
  Receipt,
  BarChart3,
  TrendingUp,
  Package,
  ShoppingCart,
  Plus,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

function CompanyDashboard() {
  const companyStats = [
    {
      title: 'Active Employees',
      value: '24',
      description: 'Staff members',
      icon: Users,
      trend: '+3 this month',
      color: 'bg-blue-500',
    },
    {
      title: 'Monthly Revenue',
      value: 'Rp 125M',
      description: 'This month',
      icon: TrendingUp,
      trend: '+12% vs last month',
      color: 'bg-green-500',
    },
    {
      title: 'Active Orders',
      value: '89',
      description: 'Pending processing',
      icon: ShoppingCart,
      trend: '+5 today',
      color: 'bg-orange-500',
    },
    {
      title: 'Inventory Items',
      value: '1,247',
      description: 'Products in stock',
      icon: Package,
      trend: '98% availability',
      color: 'bg-purple-500',
    },
  ]

  const recentActivity = [
    {
      action: 'New Employee Added',
      detail: 'John Doe - Sales Staff',
      timestamp: '1 hour ago',
      type: 'success',
    },
    {
      action: 'Large Order Received',
      detail: 'Order #12345 - Rp 25M',
      timestamp: '3 hours ago',
      type: 'info',
    },
    {
      action: 'Low Stock Alert',
      detail: 'Product ABC123',
      timestamp: '5 hours ago',
      type: 'warning',
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Welcome back, Owner"
        description="Company Owner Dashboard - Manage your business"
      >
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/company/employees">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/company/settings">
              <Settings className="h-4 w-4 mr-2" />
              Company Settings
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      {/* Company Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {companyStats.map((stat, index) => (
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
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest company and employee activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === 'success'
                        ? 'bg-green-500'
                        : activity.type === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.detail} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Management Tools</CardTitle>
            <CardDescription>Manage your company operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/company/employees">
                  <Users className="h-4 w-4 mr-2" />
                  Employee Management
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/company/subscription">
                  <Receipt className="h-4 w-4 mr-2" />
                  Subscription & Billing
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/company/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Company Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ERP Module Access */}
      <Card>
        <CardHeader>
          <CardTitle>ERP Module Access</CardTitle>
          <CardDescription>
            Quick access to your business modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/erp/dashboard">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">ERP Dashboard</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/erp/pos">
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span className="text-sm">Point of Sale</span>
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
                <span className="text-sm">Sales & Purchasing</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompanyDashboard
