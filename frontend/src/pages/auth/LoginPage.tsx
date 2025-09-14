import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Building, AlertCircle, Shield, UserCheck } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth, useAuthActions } from '@/stores/authStore'

export const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null)
  const { isAuthenticated, isInitialized } = useAuth()
  const { signIn } = useAuthActions()
  const navigate = useNavigate()
  const location = useLocation()

  // Demo credentials
  const demoCredentials = [
    {
      id: 'owner',
      email: 'owner@demo.com',
      password: 'password123',
      name: 'Owner Demo',
      role: 'Pemilik Perusahaan',
      description: 'Akses penuh ke semua fitur perusahaan',
      icon: Building,
      color: 'purple'
    },
    {
      id: 'dev',
      email: 'dev@demo.com',
      password: 'password123',
      name: 'Dev Demo',
      role: 'System Developer',
      description: 'Kelola subscription & semua perusahaan',
      icon: Shield,
      color: 'blue'
    },
    {
      id: 'staff',
      email: 'staff@demo.com',
      password: 'password123',
      name: 'Staff Demo',
      role: 'Karyawan',
      description: 'Akses kasir dan melihat produk',
      icon: UserCheck,
      color: 'green'
    }
  ]

  // Get redirect path from location state
  const from = (location.state as any)?.from || '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isInitialized, isAuthenticated, navigate, from])

  const handleQuickLogin = async (credential: any) => {
    try {
      setError(null)
      setSelectedCredential(credential.id)
      await signIn(credential.email, credential.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
      setSelectedCredential(null)
    }
  }

  const handleLoginSuccess = () => {
    setError(null)
    navigate(from, { replace: true })
  }

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // Show loading while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Don't render login page if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Masuk ke ERP Indonesia
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistem manajemen bisnis terintegrasi untuk UMKM Indonesia
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Login Gagal
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            className="space-y-6"
          />
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          {/* Quick Login Buttons */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">
              Quick Login Demo
            </h3>
            <div className="space-y-2">
              {demoCredentials.map((credential) => {
                const Icon = credential.icon
                const isLoading = selectedCredential === credential.id
                const colorClasses = {
                  purple: 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800',
                  blue: 'border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-900', 
                  green: 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }
                
                return (
                  <button
                    key={credential.id}
                    onClick={() => handleQuickLogin(credential)}
                    disabled={isLoading || !!selectedCredential}
                    className={`w-full p-3 rounded-md border transition-colors text-left
                      ${colorClasses[credential.color as keyof typeof colorClasses]}
                      ${isLoading || selectedCredential ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                    `}
                  >
                    <div className="flex items-center">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-3" />
                      ) : (
                        <Icon className="h-4 w-4 mr-3" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{credential.name}</div>
                        <div className="text-xs opacity-75">{credential.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Manual Credentials Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <h4 className="text-xs font-medium text-gray-800 mb-2">
              Manual Login Credentials
            </h4>
            <div className="text-xs text-gray-700 space-y-1">
              <p><strong>Owner:</strong> owner@demo.com / password123</p>
              <p><strong>Dev:</strong> dev@demo.com / password123</p>
              <p><strong>Staff:</strong> staff@demo.com / password123</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            © 2025 ERP Indonesia. Sistem ERP untuk UMKM Indonesia.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage