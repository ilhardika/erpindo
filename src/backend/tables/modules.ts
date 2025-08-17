import { modulesData, type ModuleData } from "../data/modules";

export interface ModuleTable extends ModuleData {}

// Import modules data from data layer
export const modules = modulesData;

// Helper functions to simulate database operations
export const getModuleById = (id: string): ModuleTable | undefined => {
  return modules.find((module) => module.id === id);
};

export const getModuleByCode = (code: string): ModuleTable | undefined => {
  return modules.find((module) => module.code === code);
};

export const getActiveModules = (): ModuleTable[] => {
  return modules.filter((module) => module.isActive);
};

export const getAllModules = (): ModuleTable[] => {
  return modules;
};
