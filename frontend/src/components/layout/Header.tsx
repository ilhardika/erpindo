import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Building,
  Palette
} from 'lucide-react'
import { useAuth, useAuthActions } from '@/stores/authStore'

export interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  showMenuButton = false 
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationCount] = useState(3) // Mock notification count
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const { user, tenant } = useAuth()
  const { signOut } = useAuthActions()
  const navigate = useNavigate()

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleProfileClick = () => {
    setUserMenuOpen(false)
    navigate('/profile')
  }

  const handleSettingsClick = () => {
    setUserMenuOpen(false)
    navigate('/settings')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'owner':
        return 'Pemilik'
      case 'admin':
        return 'Administrator'
      case 'employee':
        return 'Karyawan'
      default:
        return 'User'
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Greeting and company info */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {getGreeting()}, {getUserDisplayName()}
              </h1>
              {tenant && (
                <p className="text-sm text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {tenant.name} • {tenant.type === 'retail' ? 'Ritel' : 
                                   tenant.type === 'restaurant' ? 'Restoran' :
                                   tenant.type === 'service' ? 'Jasa' : 'Manufaktur'}
                </p>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Theme toggle (placeholder) */}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Palette className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  
                  {/* User info */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleDisplayName()}
                    </p>
                  </div>
                  
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.email}
                    </p>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user?.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                        user?.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {getRoleDisplayName()}
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profil Saya
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Pengaturan
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header