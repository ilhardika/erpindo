import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSidebarNavigation } from '../../hooks/usePermissions'
import { 
  LayoutDashboard,
  Building2,
  Settings,
  Building,
  Users,
  CreditCard,
  ShoppingCart,
  Package,
  UserCheck,
  UsersRound,
  Truck,
  Calculator,
  Warehouse,
  FileText,
  Gift,
  Crown,
  Shield,
  User
} from 'lucide-react'

export interface SidebarProps {
  onNavigate?: () => void
}

// Icon mapping for dynamic loading
const iconMap = {
  LayoutDashboard,
  Building2,
  Settings,
  Building,
  Users,
  CreditCard,
  ShoppingCart,
  Package,
  UserCheck,
  UsersRound,
  Truck,
  Calculator,
  Warehouse,
  FileText,
  Gift,
} as const;

type IconName = keyof typeof iconMap;

const getIcon = (iconName: string) => {
  return iconMap[iconName as IconName] || Package;
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'dev':
      return Crown;
    case 'owner':
      return Shield;
    case 'staff':
      return User;
    default:
      return User;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'dev':
      return 'text-red-600 bg-red-50';
    case 'owner':
      return 'text-blue-600 bg-blue-50';
    case 'staff':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { 
    navigationItems, 
    userRole, 
    roleInfo,
    accessibleModules 
  } = useSidebarNavigation();

  return (
    <div className="flex flex-col h-screen">
      {/* Logo and Company Info */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              ERP Indonesia
            </h1>
            {roleInfo && (
              <p className="text-xs text-gray-500 truncate">
                {roleInfo.name} - {accessibleModules.length} modul
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navigationItems.map((section) => (
          <div key={section.title} className="space-y-2">
            {/* Section Title */}
            {section.title && (
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            
            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'bg-gray-200 text-gray-900 border-r-2 border-gray-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {React.createElement(getIcon(item.icon), {
                    className: "mr-3 h-5 w-5 flex-shrink-0"
                  })}
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Role Badge */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(userRole || 'staff')}`}>
            {React.createElement(getRoleIcon(userRole || 'staff'), { 
              className: "w-5 h-5" 
            })}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Role Aktif
            </p>
            <p className="text-sm font-medium text-gray-900">
              {roleInfo?.name || 'Unknown Role'}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole || 'staff')}`}>
            {userRole === 'dev' ? 'Dev' : userRole === 'owner' ? 'Owner' : 'Staff'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar