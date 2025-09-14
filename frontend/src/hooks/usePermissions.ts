/**
 * Updated usePermissions Hook
 * Hook untuk mengelola permissions berdasarkan spesifikasi ERP System (SaaS)
 * Date: 2025-09-14
 */

import { useMemo } from 'react';
import { useAuth } from '../stores/authStore';
import { 
  hasModuleAccess, 
  hasActionPermission, 
  getRoleInfo,
  getNavigationStructure
} from '../lib/permissions';
import type { UserRole } from '../types/database';

/**
 * Hook for checking permissions based on user role
 */
export function usePermissions() {
  const { user } = useAuth();
  
  // Map 'employee' role to 'staff' for consistency with permissions system
  const userRole: UserRole = user?.role === 'employee' ? 'staff' : (user?.role as UserRole);

  const checkModuleAccess = (moduleId: string): boolean => {
    if (!userRole) return false;
    return hasModuleAccess(userRole, moduleId);
  };

  const checkActionPermission = (action: string): boolean => {
    if (!userRole) return false;
    return hasActionPermission(userRole, action);
  };

  const roleInfo = userRole ? getRoleInfo(userRole) : null;

  return {
    userRole,
    roleInfo,
    hasModuleAccess: checkModuleAccess,
    hasActionPermission: checkActionPermission,
  };
}

/**
 * Hook specifically for sidebar navigation with role-based filtering
 */
export function useSidebarNavigation() {
  const { user } = useAuth();
  
  // Map 'employee' role to 'staff' for consistency
  const userRole: UserRole = user?.role === 'employee' ? 'staff' : (user?.role as UserRole);

  const navigationData = useMemo(() => {
    if (!userRole) return null;
    return getNavigationStructure(userRole);
  }, [userRole]);

  return {
    userRole,
    roleInfo: navigationData?.roleInfo || null,
    navigationItems: navigationData?.structure || [],
    accessibleModules: navigationData?.structure.flatMap(section => section.items) || [],
    totalModules: navigationData?.totalModules || 0,
  };
}