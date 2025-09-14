import React from 'react'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/stores/authStore'

export const DashboardPage: React.FC = () => {
  const { user, tenant } = useAuth()

  // Mock data for dashboard
  const stats = {
    totalCustomers: 156,
    totalProducts: 89,
    todayOrders: 12,
    todayRevenue: 2450000,
    weeklyGrowth: 8.5,
    pendingOrders: 3,
    completedOrders: 9,
    lowStockProducts: 5
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getRoleGreeting = () => {
    switch (user?.role) {
      case 'owner':
        return 'Selamat datang kembali, Pemilik!'
      case 'dev':
        return 'Selamat datang, Administrator!'
      case 'employee':
        return 'Selamat datang, Tim!'
      default:
        return 'Selamat datang!'
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}! 👋
            </h1>
            <p className="text-gray-300 mb-1">
              {getRoleGreeting()}
            </p>
            {tenant && (
              <p className="text-gray-400 text-sm">
                {tenant.name} • {tenant.type === 'retail' ? 'Toko Ritel' : 
                                 tenant.type === 'restaurant' ? 'Restoran' :
                                 tenant.type === 'service' ? 'Jasa' : 'Manufaktur'}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-sm">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Today Orders */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pesanan Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
          </div>
        </div>

        {/* Today Revenue */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Omzet Hari Ini</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.todayRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Pesanan #001 selesai</p>
                <p className="text-xs text-gray-500">2 menit yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Pesanan #002 sedang diproses</p>
                <p className="text-xs text-gray-500">5 menit yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Stok Produk A hampir habis</p>
                <p className="text-xs text-gray-500">10 menit yang lalu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">Pelanggan baru mendaftar</p>
                <p className="text-xs text-gray-500">15 menit yang lalu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <ShoppingCart className="h-6 w-6 text-primary mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Buka Kasir</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Package className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Tambah Produk</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Tambah Pelanggan</span>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Lihat Laporan</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ringkasan Performa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-green-600">+{stats.weeklyGrowth}%</span>
            </div>
            <p className="text-sm text-gray-500">Pertumbuhan Mingguan</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</span>
            </div>
            <p className="text-sm text-gray-500">Pesanan Pending</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</span>
            </div>
            <p className="text-sm text-gray-500">Produk Stok Rendah</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage