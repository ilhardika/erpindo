import {
  getModuleById,
  getModuleByCode,
  getActiveModules,
  getAllModules,
  type ModuleTable,
} from "../tables/modules";
import { getEmployeeById } from "../tables/employees";
import { query } from "../tables";
import { getPlanById } from "../tables/subscriptionPlans";

export class ModuleService {
  /**
   * Get all available modules
   */
  static getAllModules(): ModuleTable[] {
    return getAllModules();
  }

  /**
   * Get active modules only
   */
  static getActiveModules(): ModuleTable[] {
    return getActiveModules();
  }

  /**
   * Get module by ID
   */
  static getModuleById(id: string): ModuleTable | undefined {
    return getModuleById(id);
  }

  /**
   * Get module by code
   */
  static getModuleByCode(code: string): ModuleTable | undefined {
    return getModuleByCode(code);
  }

  /**
   * Get module definitions (backward compatibility)
   */
  static getModuleDefinitions() {
    return getAllModules().reduce((acc, module) => {
      acc[module.code] = {
        name: module.name,
        description: module.description,
        features: module.features,
      };
      return acc;
    }, {} as Record<string, { name: string; description: string; features: string[] }>);
  }

  /**
   * Get modules by name search (backward compatibility)
   */
  static getModulesByName(searchName: string): ModuleTable[] {
    return getAllModules().filter((module) =>
      module.name.toLowerCase().includes(searchName.toLowerCase())
    );
  }

  /**
   * Check if employee has access to a module
   */
  static hasModuleAccess(employeeId: string, moduleCode: string): boolean {
    const employee = getEmployeeById(employeeId);
    if (!employee) return false;

    return employee.moduleAccess.includes(moduleCode);
  }

  /**
   * Get employee's accessible modules
   */
  static getEmployeeModules(employeeId: string): ModuleTable[] {
    const employee = getEmployeeById(employeeId);
    if (!employee) return [];

    const accessibleModules: ModuleTable[] = [];

    employee.moduleAccess.forEach((moduleCode) => {
      const module = getModuleByCode(moduleCode);
      if (module) {
        accessibleModules.push(module);
      }
    });

    return accessibleModules;
  }

  /**
   * Get company's available modules based on subscription
   */
  static getCompanyModules(companyId: string): ModuleTable[] {
    const company = query.companies.findById(companyId);
    if (!company) return [];

    const subscriptionPlan = getPlanById(company.subscriptionPlanId);
    if (!subscriptionPlan) return [];

    const availableModules: ModuleTable[] = [];

    subscriptionPlan.features.forEach((moduleCode) => {
      const module = getModuleByCode(moduleCode);
      if (module && module.isActive) {
        availableModules.push(module);
      }
    });

    return availableModules;
  }

  /**
   * Check if company has access to a module through subscription
   */
  static hasCompanyModuleAccess(
    companyId: string,
    moduleCode: string
  ): boolean {
    const company = query.companies.findById(companyId);
    if (!company) return false;

    const subscriptionPlan = getPlanById(company.subscriptionPlanId);
    if (!subscriptionPlan) return false;

    return subscriptionPlan.features.includes(moduleCode);
  }

  /**
   * Get modules grouped by category
   */
  static getModulesByCategory() {
    const modules = getActiveModules();

    return {
      core: modules.filter((m) =>
        ["pos", "sales", "inventory"].includes(m.code)
      ),
      business: modules.filter((m) =>
        ["customers", "promotions", "finance"].includes(m.code)
      ),
      operational: modules.filter((m) => ["hr", "vehicles"].includes(m.code)),
    };
  }

  /**
   * Get module features by code
   */
  static getModuleFeatures(moduleCode: string): string[] {
    const module = getModuleByCode(moduleCode);
    return module ? module.features : [];
  }

  /**
   * Check if specific feature is available in module
   */
  static hasModuleFeature(moduleCode: string, featureName: string): boolean {
    const features = this.getModuleFeatures(moduleCode);
    return features.includes(featureName);
  }

  /**
   * Validate employee permissions for module operation
   */
  static validateEmployeePermission(
    employeeId: string,
    companyId: string,
    moduleCode: string
  ): {
    isValid: boolean;
    reason?: string;
  } {
    // Check if company has module access through subscription
    if (!this.hasCompanyModuleAccess(companyId, moduleCode)) {
      return {
        isValid: false,
        reason: "Company subscription does not include this module",
      };
    }

    // Check if employee has module access
    if (!this.hasModuleAccess(employeeId, moduleCode)) {
      return {
        isValid: false,
        reason: "Employee does not have access to this module",
      };
    }

    // Check if module is active
    const module = getModuleByCode(moduleCode);
    if (!module || !module.isActive) {
      return {
        isValid: false,
        reason: "Module is not available or inactive",
      };
    }

    return { isValid: true };
  }
}

// Export individual functions for backward compatibility
export { getAllModules, getActiveModules, getModuleById, getModuleByCode };
