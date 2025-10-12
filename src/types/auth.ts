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
