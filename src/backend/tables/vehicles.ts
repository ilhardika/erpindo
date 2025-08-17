import {
  vehiclesData,
  vehicleServicesData,
  vehicleUsagesData,
  type VehicleData,
  type VehicleServiceData,
  type VehicleUsageData,
} from "../data/vehicles";

export type VehicleTable = VehicleData;
export type VehicleServiceTable = VehicleServiceData;
export type VehicleUsageTable = VehicleUsageData;

// Import vehicles data from data layer
export const vehicles = vehiclesData;
export const vehicleServices = vehicleServicesData;
export const vehicleUsages = vehicleUsagesData;

// Helper functions for vehicles
export const getVehicleById = (id: string): VehicleTable | undefined => {
  return vehicles.find((vehicle) => vehicle.id === id);
};

export const getVehiclesByCompanyId = (companyId: string): VehicleTable[] => {
  return vehicles.filter((vehicle) => vehicle.companyId === companyId);
};

export const getVehiclesByStatus = (
  companyId: string,
  status: string
): VehicleTable[] => {
  return vehicles.filter(
    (vehicle) => vehicle.companyId === companyId && vehicle.status === status
  );
};

export const getVehiclesByType = (
  companyId: string,
  type: string
): VehicleTable[] => {
  return vehicles.filter(
    (vehicle) => vehicle.companyId === companyId && vehicle.vehicleType === type
  );
};

export const getVehiclesByDriver = (driverId: string): VehicleTable[] => {
  return vehicles.filter((vehicle) => vehicle.driverId === driverId);
};

export const getVehiclesNeedingService = (
  companyId: string
): VehicleTable[] => {
  const today = new Date().toISOString().split("T")[0];
  return vehicles.filter(
    (vehicle) =>
      vehicle.companyId === companyId &&
      vehicle.nextServiceDue &&
      vehicle.nextServiceDue <= today
  );
};

export const getVehiclesExpiringDocuments = (
  companyId: string,
  days: number = 30
): VehicleTable[] => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const futureDateStr = futureDate.toISOString();

  return vehicles.filter(
    (vehicle) =>
      vehicle.companyId === companyId &&
      ((vehicle.insuranceExpiry && vehicle.insuranceExpiry <= futureDateStr) ||
        (vehicle.registrationExpiry &&
          vehicle.registrationExpiry <= futureDateStr))
  );
};

// Helper functions for vehicle services
export const getServicesByVehicleId = (
  vehicleId: string
): VehicleServiceTable[] => {
  return vehicleServices.filter((service) => service.vehicleId === vehicleId);
};

export const getServicesByCompanyId = (
  companyId: string
): VehicleServiceTable[] => {
  return vehicleServices.filter((service) => service.companyId === companyId);
};

export const getServicesByDateRange = (
  companyId: string,
  startDate: string,
  endDate: string
): VehicleServiceTable[] => {
  return vehicleServices.filter(
    (service) =>
      service.companyId === companyId &&
      service.serviceDate >= startDate &&
      service.serviceDate <= endDate
  );
};

// Helper functions for vehicle usage
export const getUsagesByVehicleId = (
  vehicleId: string
): VehicleUsageTable[] => {
  return vehicleUsages.filter((usage) => usage.vehicleId === vehicleId);
};

export const getUsagesByDriverId = (driverId: string): VehicleUsageTable[] => {
  return vehicleUsages.filter((usage) => usage.driverId === driverId);
};

export const getUsagesByCompanyId = (
  companyId: string
): VehicleUsageTable[] => {
  return vehicleUsages.filter((usage) => usage.companyId === companyId);
};

export const getUsagesByDateRange = (
  companyId: string,
  startDate: string,
  endDate: string
): VehicleUsageTable[] => {
  return vehicleUsages.filter(
    (usage) =>
      usage.companyId === companyId &&
      usage.usageDate >= startDate &&
      usage.usageDate <= endDate
  );
};

// Statistics helpers
export const getVehicleStatistics = (companyId: string) => {
  const companyVehicles = vehicles.filter((v) => v.companyId === companyId);
  const companyServices = vehicleServices.filter(
    (s) => s.companyId === companyId
  );
  const companyUsages = vehicleUsages.filter((u) => u.companyId === companyId);

  return {
    totalVehicles: companyVehicles.length,
    activeVehicles: companyVehicles.filter((v) => v.status === "active").length,
    maintenanceVehicles: companyVehicles.filter(
      (v) => v.status === "maintenance"
    ).length,
    inactiveVehicles: companyVehicles.filter((v) => v.status === "inactive")
      .length,
    totalServiceCost: companyServices.reduce((sum, s) => sum + s.cost, 0),
    totalDistance: companyUsages.reduce((sum, u) => sum + u.distance, 0),
    totalFuelUsed: companyUsages.reduce((sum, u) => sum + u.fuelUsed, 0),
    vehiclesByType: {
      car: companyVehicles.filter((v) => v.vehicleType === "car").length,
      motorcycle: companyVehicles.filter((v) => v.vehicleType === "motorcycle")
        .length,
      truck: companyVehicles.filter((v) => v.vehicleType === "truck").length,
      van: companyVehicles.filter((v) => v.vehicleType === "van").length,
      pickup: companyVehicles.filter((v) => v.vehicleType === "pickup").length,
    },
  };
};

export const getVehicleServiceCosts = (companyId: string, year?: number) => {
  let filteredServices = vehicleServices.filter(
    (s) => s.companyId === companyId
  );

  if (year) {
    filteredServices = filteredServices.filter(
      (s) => new Date(s.serviceDate).getFullYear() === year
    );
  }

  return {
    totalCost: filteredServices.reduce((sum, s) => sum + s.cost, 0),
    routineCost: filteredServices
      .filter((s) => s.serviceType === "routine")
      .reduce((sum, s) => sum + s.cost, 0),
    repairCost: filteredServices
      .filter((s) => s.serviceType === "repair")
      .reduce((sum, s) => sum + s.cost, 0),
    emergencyCost: filteredServices
      .filter((s) => s.serviceType === "emergency")
      .reduce((sum, s) => sum + s.cost, 0),
    serviceCount: filteredServices.length,
  };
};
