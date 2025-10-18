import { Module } from '@/types/modules'
import { UserRole } from '@/lib/auth/utils'
import { ERP_MODULES, COMPANY_MODULES, SYSTEM_MODULES } from './definitions'

/**
 * Gets modules based on user role
 * Implements role-based access control following SOLID principles
 *
 * @param role - User role (dev, owner, staff)
 * @returns Module[] - Array of modules the user has access to
 */
export function getModulesByRole(role: UserRole): Module[] {
  switch (role) {
    case 'dev':
      // Dev sees all: System + Company + ERP (21 modules total)
      return [...SYSTEM_MODULES, ...COMPANY_MODULES, ...ERP_MODULES]

    case 'owner':
      // Owner sees: Company + ERP (16 modules total)
      return [...COMPANY_MODULES, ...ERP_MODULES]

    case 'staff':
      // Staff sees: ERP only (12 modules total)
      return ERP_MODULES

    default:
      // Default fallback to staff modules
      return ERP_MODULES
  }
}

/**
 * Checks if user role has access to specific module
 *
 * @param userRole - User's role
 * @param moduleId - Module ID to check access for
 * @returns boolean - Whether user has access to the module
 */
export function hasModuleAccess(userRole: UserRole, moduleId: string): boolean {
  const userModules = getModulesByRole(userRole)
  return userModules.some(module => module.id === moduleId)
}

/**
 * Gets modules by category for a specific role
 *
 * @param role - User role
 * @param category - Module category (system, company, erp)
 * @returns Module[] - Modules in the specified category
 */
export function getModulesByRoleAndCategory(
  role: UserRole,
  category: 'system' | 'company' | 'erp'
): Module[] {
  const userModules = getModulesByRole(role)
  return userModules.filter(module => module.category === category)
}
