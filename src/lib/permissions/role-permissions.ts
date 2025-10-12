import { UserProfile, UserRole } from '@/types/auth'
import { ModuleCategory } from '@/types/modules'

export function hasRoleAccess(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    dev: 3,
    owner: 2,
    staff: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canAccessModule(
  userProfile: UserProfile | null,
  moduleCategory: ModuleCategory
): boolean {
  if (!userProfile || !userProfile.is_active) return false

  switch (moduleCategory) {
    case 'system':
      return userProfile.role === 'dev'
    case 'company':
      return userProfile.role === 'dev' || userProfile.role === 'owner'
    case 'erp':
      return true // All authenticated users can potentially access ERP modules (subject to specific permissions)
    default:
      return false
  }
}

export function canCreateUser(
  creatorRole: UserRole,
  targetRole: UserRole
): boolean {
  // Dev can create owners, owners can create staff
  if (creatorRole === 'dev' && targetRole === 'owner') return true
  if (creatorRole === 'owner' && targetRole === 'staff') return true
  return false
}

export function canManageUser(
  managerProfile: UserProfile | null,
  targetUserRole: UserRole,
  targetUserCompanyId: string | null
): boolean {
  if (!managerProfile || !managerProfile.is_active) return false

  // Dev can manage any user
  if (managerProfile.role === 'dev') return true

  // Owner can manage staff in same company
  if (
    managerProfile.role === 'owner' &&
    targetUserRole === 'staff' &&
    managerProfile.company_id === targetUserCompanyId
  ) {
    return true
  }

  return false
}

export function getAccessibleRoutes(userProfile: UserProfile | null): string[] {
  if (!userProfile || !userProfile.is_active) return []

  const routes: string[] = []

  switch (userProfile.role) {
    case 'dev':
      routes.push('/system', '/company', '/erp')
      break
    case 'owner':
      routes.push('/company', '/erp')
      break
    case 'staff':
      routes.push('/erp')
      break
  }

  return routes
}

export function getDefaultRoute(userProfile: UserProfile | null): string {
  if (!userProfile || !userProfile.is_active) return '/login'

  switch (userProfile.role) {
    case 'dev':
      return '/system/dashboard'
    case 'owner':
      return '/company/dashboard'
    case 'staff':
      return '/erp/dashboard'
    default:
      return '/login'
  }
}
