import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Building, 
  UserCheck,
  BarChart3,
  CreditCard,
  ShoppingBag
} from 'lucide-react'
import { useAuth } from '@/stores/authStore'

export interface SidebarProps {
  onNavigate?: () => void
}

export interface MenuItemData {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: ('owner' | 'admin' | 'employee')[]
  permissions?: string[]
}

// Menu configuration for Indonesian ERP
const menuItems: MenuItemData[] = [
  // Dashboard - All roles
  {
    name: 'Beranda',
    href: '/dashboard',
    icon: Home,
    roles: ['owner', 'admin', 'employee']
  },

  // POS - All roles (employees can use POS)
  {
    name: 'Kasir (POS)',
    href: '/pos',
    icon: ShoppingCart,
    roles: ['owner', 'admin', 'employee'],
    permissions: ['orders.create']
  },

  // Products - Admin and Owner
  {
    name: 'Produk',
    href: '/products',
    icon: Package,
    roles: ['owner', 'admin'],
    permissions: ['products.manage']
  },

  // Customers - Admin and Owner
  {
    name: 'Pelanggan',
    href: '/customers',
    icon: Users,
    roles: ['owner', 'admin'],
    permissions: ['customers.manage']
  },

  // Sales Orders - All roles (view)
  {
    name: 'Pesanan',
    href: '/orders',
    icon: ShoppingBag,
    roles: ['owner', 'admin', 'employee'],
    permissions: ['orders.view']
  },

  // Invoices - Admin and Owner
  {
    name: 'Faktur',
    href: '/invoices',
    icon: FileText,
    roles: ['owner', 'admin'],
    permissions: ['orders.manage']
  },

  // Reports - Admin and Owner
  {
    name: 'Laporan',
    href: '/reports',
    icon: BarChart3,
    roles: ['owner', 'admin'],
    permissions: ['reports.view']
  },

  // Payments - Admin and Owner
  {
    name: 'Pembayaran',
    href: '/payments',
    icon: CreditCard,
    roles: ['owner', 'admin'],
    permissions: ['orders.manage']
  },

  // User Management - Owner only
  {
    name: 'Manajemen User',
    href: '/users',
    icon: UserCheck,
    roles: ['owner'],
    permissions: ['users.manage']
  },

  // Company Management - Owner only
  {
    name: 'Pengaturan Perusahaan',
    href: '/company',
    icon: Building,
    roles: ['owner'],
    permissions: ['tenant.manage']
  },

  // Settings - All roles (different levels)
  {
    name: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    roles: ['owner', 'admin', 'employee']
  }
]

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user, tenant, hasPermission } = useAuth()
  const navigate = useNavigate()

  // Filter menu items based on user role and permissions
  const visibleMenuItems = menuItems.filter(item => {
    // Check role access
    const hasRole = user && item.roles.includes(user.role || 'employee')
    if (!hasRole) return false

    // Check permissions if specified
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.every(permission => hasPermission(permission))
    }

    return true
  })

  const handleNavigation = (href: string) => {
    navigate(href)
    onNavigate?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo and Company Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              ERP Indonesia
            </h1>
            {tenant && (
              <p className="text-xs text-gray-500 truncate">
                {tenant.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={(e) => {
              e.preventDefault()
              handleNavigation(item.href)
            }}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Role Badge */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Role Aktif
            </p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {user?.role === 'owner' ? 'Pemilik' : 
               user?.role === 'admin' ? 'Admin' : 'Karyawan'}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            user?.role === 'owner' ? 'bg-purple-100 text-purple-800' :
            user?.role === 'admin' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {user?.role === 'owner' ? 'Owner' : 
             user?.role === 'admin' ? 'Admin' : 'Staff'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar