'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks/use-auth'
import { useAuth } from '@/lib/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn, Eye, EyeOff, User, Crown, Users } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { login, loading, error } = useLogin()
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()

  // Demo credentials for quick access
  const demoAccounts = [
    {
      type: 'System Admin',
      email: 'dev@erpindo.com',
      password: 'password123',
      icon: User,
      color: 'text-blue-600',
    },
    {
      type: 'Company Owner',
      email: 'owner@teknologimaju.com',
      password: 'password123',
      icon: Crown,
      color: 'text-green-600',
    },
    {
      type: 'Staff Member',
      email: 'staff1@teknologimaju.com',
      password: 'password123',
      icon: Users,
      color: 'text-orange-600',
    },
  ]

  const fillCredentials = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setFormErrors({}) // Clear any existing errors
  }

  // Auto redirect if user is already authenticated
  useEffect(() => {
    // Re-enable auto-redirect since middleware is bypassed
    if (user && userProfile && !authLoading && !isRedirecting) {
      setIsRedirecting(true)

      // Get redirect parameter from URL
      const searchParams = new URLSearchParams(window.location.search)
      const redirectTo = searchParams.get('redirect')

      // Add small delay to prevent infinite redirect loop
      setTimeout(() => {
        if (redirectTo) {
        } else {
          // Redirect to role-based dashboard
          let dashboardRoute = '/erp/dashboard' // default for staff

          if (userProfile.role === 'dev') {
            dashboardRoute = '/system/dashboard'
          } else if (userProfile.role === 'owner') {
            dashboardRoute = '/company/dashboard'
          }

          window.location.href = dashboardRoute
        }
      }, 500) // 500ms delay
    }
  }, [user, userProfile, authLoading, router, isRedirecting])

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await login(email, password)

      // Don't force immediate redirect, let useEffect handle it
      console.log('✅ [LOGIN] Login successful, waiting for auth state...')
    } catch (err) {
      console.error('❌ [LOGIN] Login failed:', err)
      console.error('❌ [LOGIN] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      })
    }
  }

  // Show loading screen if user is already authenticated and redirecting
  if ((user && userProfile && !authLoading) || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ERPindo</CardTitle>
          <CardDescription>
            Sign in to your account to access the ERP system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={formErrors.email ? 'border-red-500' : ''}
                disabled={loading}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error === 'Invalid login credentials'
                    ? 'Invalid email or password. Please try again.'
                    : error}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6">
            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-3">Quick Login - Demo Accounts:</p>
              <div className="space-y-2">
                {demoAccounts.map((account, index) => {
                  const IconComponent = account.icon
                  return (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() =>
                        fillCredentials(account.email, account.password)
                      }
                      disabled={loading}
                    >
                      <IconComponent
                        className={`h-4 w-4 mr-2 ${account.color}`}
                      />
                      <div className="text-left">
                        <div className="font-medium">{account.type}</div>
                        <div className="text-xs text-gray-500">
                          {account.email}
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
