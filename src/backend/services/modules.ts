import { db } from "../tables";

export class ModuleService {
  static getModuleDefinitions() {
    return db.module.findAll().reduce((acc, module) => {
      acc[module.code] = {
        name: module.name,
        description: module.description,
        features: module.features,
      };
      return acc;
    }, {} as Record<string, { name: string; description: string; features: string[] }>);
  }

  static getActiveModules() {
    return db.module.findActive();
  }

  static getModuleByCode(code: string) {
    return db.module.findByCode(code);
  }

  static getAllModules() {
    return db.module.findAll();
  }
}
