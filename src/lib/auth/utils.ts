import { supabase } from '@/lib/supabase/client'

/**
 * User role types
 */
export type UserRole = 'dev' | 'owner' | 'staff'

/**
 * Gets the current user's role from the database
 * @returns Promise<UserRole> - The user's role, defaults to 'staff'
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role =
      profile && 'role' in profile
        ? (profile as { role: UserRole }).role
        : 'staff'

    return role
  } catch (error) {
    console.error('Error fetching user role:', error)
    return 'staff' // Default fallback
  }
}

/**
 * Gets dashboard route based on user role
 * @param role - User role
 * @returns string - Dashboard route path
 */
export function getDashboardRouteByRole(role: UserRole): string {
  const dashboards: Record<UserRole, string> = {
    dev: '/system/dashboard',
    owner: '/company/dashboard',
    staff: '/erp/dashboard',
  }

  return dashboards[role]
}

/**
 * Redirects user to appropriate dashboard based on role
 */
export async function redirectToDashboard(): Promise<void> {
  try {
    const role = await getCurrentUserRole()
    const dashboardRoute = getDashboardRouteByRole(role)
    window.location.href = dashboardRoute
  } catch (error) {
    console.error('Redirect to dashboard failed:', error)
    window.location.href = '/login'
  }
}
