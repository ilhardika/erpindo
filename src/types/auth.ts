export type UserRole = 'dev' | 'owner' | 'staff'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  company_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export type AuthSession = {
  user: User
  expires_at: string
  token: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type Company = {
  id: string
  name: string
  is_active: boolean
}

export type UserProfile = User & {
  companies?: Company
}

export type AuthContextType = {
  user: import('@supabase/supabase-js').User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => void
}
