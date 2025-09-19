import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Types for authentication state
export interface AuthUser extends User {
  tenant_id?: string
  role?: 'owner' | 'dev' | 'employee'
  permissions?: string[]
}

export interface AuthTenant {
  id: string
  name: string
  type: 'retail' | 'restaurant' | 'service' | 'manufacturing'
  settings: {
    currency: string
    timezone: string
    tax_rate: number
    locale: string
  }
}

export interface AuthState {
  // Auth state
  user: AuthUser | null
  session: Session | null
  tenant: AuthTenant | null
  isLoading: boolean
  isInitialized: boolean
  
  // Error state
  error: string | null
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{
    success: boolean
    error?: string
    user?: AuthUser
  }>
  signUp: (data: {
    email: string
    password: string
    fullName: string
    tenantName: string
    tenantType: 'retail' | 'restaurant' | 'service' | 'manufacturing'
  }) => Promise<{
    success: boolean
    error?: string
    user?: AuthUser
  }>
  signOut: () => Promise<void>
  
  // Session management
  initializeAuth: () => Promise<void>
  refreshSession: () => Promise<void>
  
  // Tenant management
  switchTenant: (tenantId: string) => Promise<void>
  updateTenant: (updates: Partial<AuthTenant>) => Promise<void>
  
  // State management
  setUser: (user: AuthUser | null) => void
  setSession: (session: Session | null) => void
  setTenant: (tenant: AuthTenant | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  forceReset: () => void
  
  // Utility functions
  hasPermission: (permission: string) => boolean
  isOwner: () => boolean
  isAdmin: () => boolean
  canAccess: (resource: string, action: string) => boolean
}

// Default permissions by role
const DEFAULT_PERMISSIONS = {
  owner: [
    'tenant:manage',
    'users:manage',
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'products:manage-stock',
    'customers:view',
    'customers:create',
    'customers:edit',
    'customers:delete',
    'orders:view',
    'orders:create',
    'orders:edit',
    'orders:delete',
    'reports:view',
    'settings:manage',
    'integrations:manage'
  ],
  dev: [
    'users:view',
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'products:manage-stock',
    'customers:view',
    'customers:create',
    'customers:edit',
    'customers:delete',
    'orders:view',
    'orders:create',
    'orders:edit',
    'orders:delete',
    'reports:view',
    'settings:view'
  ],
  employee: [
    'products:view',
    'customers:view',
    'orders:create',
    'orders:view'
  ]
}

// Authentication store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      tenant: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Authentication actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Demo credentials for testing without real Supabase
          const demoUsers = {
            'owner@demo.com': { role: 'owner', name: 'Owner Demo' },
            'dev@demo.com': { role: 'dev', name: 'Dev Demo' },
            'staff@demo.com': { role: 'employee', name: 'Staff Demo' }
          }

          // Check demo credentials first
          if (demoUsers[email as keyof typeof demoUsers] && password === 'password123') {
            const demoUser = demoUsers[email as keyof typeof demoUsers]
            
            const demoUserIds = {
              'owner': '11111111-1111-1111-1111-111111111111',
              'dev': '22222222-2222-2222-2222-222222222222', 
              'employee': '33333333-3333-3333-3333-333333333333'
            }
            
            const authUser: AuthUser = {
              id: demoUserIds[demoUser.role as keyof typeof demoUserIds],
              email,
              user_metadata: { full_name: demoUser.name },
              tenant_id: '55555555-5555-5555-5555-555555555555', // Toko Modern Indo
              role: demoUser.role as 'owner' | 'dev' | 'employee',
              permissions: DEFAULT_PERMISSIONS[demoUser.role as keyof typeof DEFAULT_PERMISSIONS],
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              app_metadata: {},
              email_confirmed_at: new Date().toISOString(),
              phone_confirmed_at: undefined,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            const tenant: AuthTenant = {
              id: '55555555-5555-5555-5555-555555555555', // Toko Modern Indo
              name: 'Toko Modern Indo',
              type: 'retail',
              settings: {
                currency: 'IDR',
                timezone: 'Asia/Jakarta',
                tax_rate: 0.11,
                locale: 'id-ID'
              }
            }

            // Simulate session with proper JWT claims for RLS
            const session = {
              access_token: 'demo-access-token',
              refresh_token: 'demo-refresh-token',
              expires_in: 3600,
              token_type: 'bearer',
              user: {
                ...authUser,
                // Add company_id to user metadata for RLS compatibility
                user_metadata: {
                  ...authUser.user_metadata,
                  company_id: '55555555-5555-5555-5555-555555555555',
                  tenant_id: '55555555-5555-5555-5555-555555555555',
                  role: demoUser.role
                }
              }
            }

            set({
              user: authUser,
              session: session as any,
              tenant,
              isLoading: false,
              error: null
            })


            return { success: true, user: authUser }
          }

          // Try real Supabase authentication
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            // If Supabase fails, show helpful message
            set({ 
              error: 'Demo: Gunakan owner@demo.com, dev@demo.com, atau staff@demo.com dengan password "password123"', 
              isLoading: false 
            })
            return { 
              success: false, 
              error: 'Demo: Gunakan owner@demo.com, dev@demo.com, atau staff@demo.com dengan password "password123"' 
            }
          }

          if (data.user && data.session) {
            // For now, create simple auth user without database queries
            const authUser: AuthUser = {
              ...data.user,
              tenant_id: 'default-tenant',
              role: 'owner',
              permissions: DEFAULT_PERMISSIONS.owner
            }

            const tenant: AuthTenant = {
              id: 'default-tenant',
              name: 'My Business',
              type: 'retail',
              settings: {
                currency: 'IDR',
                timezone: 'Asia/Jakarta',
                tax_rate: 0.11,
                locale: 'id-ID'
              }
            }

            set({
              user: authUser,
              session: data.session,
              tenant,
              isLoading: false,
              error: null
            })

            return { success: true, user: authUser }
          }

          return { success: false, error: 'Login gagal' }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signUp: async (data) => {
        set({ isLoading: true, error: null })
        
        try {
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName
              }
            }
          })

          if (authError) {
            set({ error: authError.message, isLoading: false })
            return { success: false, error: authError.message }
          }

          if (authData.user) {
            // For now, create simple setup without database
            const authUser: AuthUser = {
              ...authData.user,
              tenant_id: 'new-tenant',
              role: 'owner',
              permissions: DEFAULT_PERMISSIONS.owner
            }

            const tenant: AuthTenant = {
              id: 'new-tenant',
              name: data.tenantName,
              type: data.tenantType,
              settings: {
                currency: 'IDR',
                timezone: 'Asia/Jakarta',
                tax_rate: 0.11,
                locale: 'id-ID'
              }
            }

            set({
              user: authUser,
              session: authData.session,
              tenant,
              isLoading: false,
              error: null
            })

            return { success: true, user: authUser }
          }

          return { success: false, error: 'Registrasi gagal' }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
          set({ error: errorMessage, isLoading: false })
          return { success: false, error: errorMessage }
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            tenant: null,
            isLoading: false,
            error: null
          })
        } catch (error) {
          console.error('Sign out error:', error)
          // Still clear state even if sign out fails
          set({
            user: null,
            session: null,
            tenant: null,
            isLoading: false,
            error: null
          })
        }
      },

      // Session management
      initializeAuth: async () => {
        const currentState = get()
        
        // Prevent re-initialization if already initialized or in progress
        if (currentState.isInitialized || currentState.isLoading) {
          return
        }
        
        set({ isLoading: true })
        
        try {
          // Check if we have environment variables
          const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
          
          if (!hasSupabaseConfig) {
            console.warn('🚀 Running in demo mode - Supabase not configured')
            // Initialize demo mode
            set({ 
              user: null,
              session: null,
              tenant: null,
              isLoading: false, 
              isInitialized: true,
              error: null
            })
            return
          }

          // First check if we have persisted demo user state
          const demoUserIds = [
            '11111111-1111-1111-1111-111111111111', // owner
            '22222222-2222-2222-2222-222222222222', // dev  
            '33333333-3333-3333-3333-333333333333'  // employee
          ];
          
          if (currentState.user && demoUserIds.includes(currentState.user.id)) {
            set({ 
              isLoading: false, 
              isInitialized: true,
              error: null
            })
            return
          }

          // For real Supabase users, check session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // For now, create simple user without database queries
            const authUser: AuthUser = {
              ...session.user,
              tenant_id: 'default-tenant',
              role: 'owner',
              permissions: DEFAULT_PERMISSIONS.owner
            }

            const tenant: AuthTenant = {
              id: 'default-tenant',
              name: 'My Business',
              type: 'retail',
              settings: {
                currency: 'IDR',
                timezone: 'Asia/Jakarta',
                tax_rate: 0.11,
                locale: 'id-ID'
              }
            }

            set({
              user: authUser,
              session,
              tenant,
              isLoading: false,
              isInitialized: true,
              error: null
            })
          } else {
            // No Supabase session and no demo user - clear state
            set({
              user: null,
              session: null,
              tenant: null,
              isLoading: false,
              isInitialized: true,
              error: null
            })
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
                tenant: null,
                error: null
              })
            } else if (event === 'SIGNED_IN' && session) {
              // Refresh user data when signed in
              get().initializeAuth()
            }
          })
        } catch (error) {
          console.error('Initialize auth error:', error)
          set({
            user: null,
            session: null,
            tenant: null,
            isLoading: false,
            isInitialized: true,
            error: null
          })
        }
      },

      refreshSession: async () => {
        try {
          const { data: { session } } = await supabase.auth.refreshSession()
          if (session) {
            set({ session })
          }
        } catch (error) {
          console.error('Refresh session error:', error)
        }
      },

      // Tenant management
      switchTenant: async (tenantId: string) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true })

        try {
          // For now, just update the state without database
          const newTenant: AuthTenant = {
            id: tenantId,
            name: 'Switched Business',
            type: 'retail',
            settings: {
              currency: 'IDR',
              timezone: 'Asia/Jakarta',
              tax_rate: 0.11,
              locale: 'id-ID'
            }
          }

          set({
            user: { ...user, tenant_id: tenantId },
            tenant: newTenant,
            isLoading: false
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal beralih tenant'
          set({ error: errorMessage, isLoading: false })
        }
      },

      updateTenant: async (updates) => {
        const { tenant } = get()
        if (!tenant) return

        set({ isLoading: true })

        try {
          const updatedTenant: AuthTenant = {
            ...tenant,
            ...updates,
            settings: { ...tenant.settings, ...(updates.settings || {}) }
          }

          set({ tenant: updatedTenant, isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui tenant'
          set({ error: errorMessage, isLoading: false })
        }
      },

      // State setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setTenant: (tenant) => set({ tenant }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Force clear auth cache - for debugging
      forceReset: () => {
        set({
          user: null,
          session: null,
          tenant: null,
          isLoading: false,
          isInitialized: false,
          error: null
        })
      },

      // Utility functions
      hasPermission: (permission: string) => {
        const { user } = get()
        return user?.permissions?.includes(permission) || false
      },

      isOwner: () => {
        const { user } = get()
        return user?.role === 'owner'
      },

      isAdmin: () => {
        const { user } = get()
        return user?.role === 'dev' || user?.role === 'owner'
      },

      canAccess: (resource: string, action: string) => {
        const { user } = get()
        if (!user) return false

        const permission = `${resource}.${action}`
        return get().hasPermission(permission)
      }
    }),
    {
      name: 'auth-storage-v3', // Changed version to force cache refresh with UUID fix
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        tenant: state.tenant,
        isInitialized: state.isInitialized // Include to prevent re-initialization
      })
    }
  )
)

// Hooks for easier access to auth state
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    session: store.session,
    tenant: store.tenant,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,
    isAuthenticated: !!store.user && !!store.session,
    hasPermission: store.hasPermission,
    isOwner: store.isOwner,
    isAdmin: store.isAdmin,
    canAccess: store.canAccess
  }
}

export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    initializeAuth: store.initializeAuth,
    refreshSession: store.refreshSession,
    switchTenant: store.switchTenant,
    updateTenant: store.updateTenant,
    setUser: store.setUser,
    setSession: store.setSession,
    setTenant: store.setTenant,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    forceReset: store.forceReset
  }
}