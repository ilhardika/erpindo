import { query } from "../tables";

export class ModuleService {
  static getModuleDefinitions() {
    return query.modules.findAll().reduce((acc, module) => {
      acc[module.code] = {
        name: module.name,
        description: module.description,
        features: module.features,
      };
      return acc;
    }, {} as Record<string, { name: string; description: string; features: string[] }>);
  }

  static getActiveModules() {
    return query.modules.findActive();
  }

  static getModuleByCode(code: string) {
    return query.modules.findByCode(code);
  }

  static getAllModules() {
    return query.modules.findAll();
  }

  static getModulesByName(searchName: string) {
    return query.modules
      .findAll()
      .filter((module) =>
        module.name.toLowerCase().includes(searchName.toLowerCase())
      );
  }
}
