import { Metadata } from 'next'
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  FileText,
  TruckIcon,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sales Dashboard | ERPindo',
  description: 'Sales overview and metrics',
}

// Mock data - will be replaced with real API calls
const mockMetrics = {
  today: {
    revenue: 15750000,
    orders: 12,
    avgOrderValue: 1312500,
    trend: 12.5,
  },
  week: {
    revenue: 87500000,
    orders: 68,
    avgOrderValue: 1286764,
    trend: 8.3,
  },
  month: {
    revenue: 345000000,
    orders: 256,
    avgOrderValue: 1347656,
    trend: -3.2,
  },
}

const mockPendingOrders = [
  {
    id: '1',
    orderNumber: 'SO-202510-0001',
    customerName: 'Warung Serba Ada',
    total: 10650000,
    status: 'confirmed',
    orderDate: '2025-10-21',
  },
  {
    id: '2',
    orderNumber: 'SO-202510-0002',
    customerName: 'Toko Elektronik Jaya',
    total: 25000000,
    status: 'processing',
    orderDate: '2025-10-21',
  },
  {
    id: '3',
    orderNumber: 'SO-202510-0003',
    customerName: 'PT. Maju Bersama',
    total: 50000000,
    status: 'draft',
    orderDate: '2025-10-20',
  },
]

const mockRecentTransactions = [
  {
    id: '1',
    type: 'order',
    number: 'SO-202510-0005',
    customer: 'UD. Sumber Rezeki',
    amount: 8500000,
    status: 'completed',
    date: '2025-10-21',
  },
  {
    id: '2',
    type: 'invoice',
    number: 'INV-202510-0012',
    customer: 'CV. Berkah Jaya',
    amount: 15000000,
    status: 'paid',
    date: '2025-10-21',
  },
  {
    id: '3',
    type: 'payment',
    number: 'PAY-202510-0008',
    customer: 'Warung Serba Ada',
    amount: 5000000,
    status: 'received',
    date: '2025-10-21',
  },
  {
    id: '4',
    type: 'delivery',
    number: 'DO-202510-0003',
    customer: 'Toko Maju Makmur',
    amount: 12000000,
    status: 'delivered',
    date: '2025-10-20',
  },
]

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  processing: { label: 'Processing', variant: 'outline' },
  completed: { label: 'Completed', variant: 'default' },
  paid: { label: 'Paid', variant: 'default' },
  received: { label: 'Received', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  order: { icon: ShoppingCart, label: 'Sales Order' },
  invoice: { icon: FileText, label: 'Invoice' },
  payment: { icon: DollarSign, label: 'Payment' },
  delivery: { icon: TruckIcon, label: 'Delivery' },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
}: {
  title: string
  value: string
  subtitle: string
  trend: number
  icon: React.ElementType
}) {
  const isPositive = trend > 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <div
          className={`flex items-center text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
        >
          <TrendIcon className="h-3 w-3 mr-1" />
          <span>{Math.abs(trend)}% vs last period</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SalesDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your sales performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/erp/sales/orders/new">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="space-y-4">
        {/* Today Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Today</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Revenue"
              value={formatCurrency(mockMetrics.today.revenue)}
              subtitle={`${mockMetrics.today.orders} orders`}
              trend={mockMetrics.today.trend}
              icon={DollarSign}
            />
            <MetricCard
              title="Orders"
              value={mockMetrics.today.orders.toString()}
              subtitle="Today's orders"
              trend={mockMetrics.today.trend}
              icon={ShoppingCart}
            />
            <MetricCard
              title="Avg Order Value"
              value={formatCurrency(mockMetrics.today.avgOrderValue)}
              subtitle="Per transaction"
              trend={mockMetrics.today.trend}
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Week Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-3">This Week</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Revenue"
              value={formatCurrency(mockMetrics.week.revenue)}
              subtitle={`${mockMetrics.week.orders} orders`}
              trend={mockMetrics.week.trend}
              icon={DollarSign}
            />
            <MetricCard
              title="Orders"
              value={mockMetrics.week.orders.toString()}
              subtitle="This week"
              trend={mockMetrics.week.trend}
              icon={ShoppingCart}
            />
            <MetricCard
              title="Avg Order Value"
              value={formatCurrency(mockMetrics.week.avgOrderValue)}
              subtitle="Per transaction"
              trend={mockMetrics.week.trend}
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Month Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-3">This Month</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Revenue"
              value={formatCurrency(mockMetrics.month.revenue)}
              subtitle={`${mockMetrics.month.orders} orders`}
              trend={mockMetrics.month.trend}
              icon={DollarSign}
            />
            <MetricCard
              title="Orders"
              value={mockMetrics.month.orders.toString()}
              subtitle="This month"
              trend={mockMetrics.month.trend}
              icon={ShoppingCart}
            />
            <MetricCard
              title="Avg Order Value"
              value={formatCurrency(mockMetrics.month.avgOrderValue)}
              subtitle="Per transaction"
              trend={mockMetrics.month.trend}
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>

      {/* Pending Orders & Recent Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Orders that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPendingOrders.map(order => {
                const status = statusConfig[order.status]
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.orderNumber}</p>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.orderDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="font-semibold">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/erp/sales/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/erp/sales/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest sales activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentTransactions.map(transaction => {
                const typeInfo = typeConfig[transaction.type]
                const status = statusConfig[transaction.status]
                const TypeIcon = typeInfo.icon

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {transaction.number}
                          </p>
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {transaction.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeInfo.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/erp/sales/orders">View All Transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
