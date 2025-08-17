/**
 * Fleet Service - Comprehensive Vehicle Fleet Management
 *
 * Handles: Vehicles, Vehicle Services, Usage Tracking, Maintenance
 */

import {
  vehicles,
  vehicleServices,
  vehicleUsage,
  type VehicleTable,
  type VehicleServiceTable,
  type VehicleUsageTable,
  getVehiclesByCompanyId,
  getActiveVehicles,
  getVehicleServiceHistory,
  getVehicleUsageHistory,
} from "../tables/vehicles";

// =============================================================================
// VEHICLE MANAGEMENT
// =============================================================================

export const vehicleService = {
  // Basic queries
  findById: (id: string) => vehicles.find((v) => v.id === id),
  findByCompany: getVehiclesByCompanyId,
  findActive: getActiveVehicles,
  findByLicensePlate: (licensePlate: string) =>
    vehicles.find((v) => v.licensePlate === licensePlate),

  // CRUD operations
  create: (
    vehicleData: Omit<VehicleTable, "id" | "createdAt" | "updatedAt">
  ) => {
    const newVehicle: VehicleTable = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vehicles.push(newVehicle);
    return newVehicle;
  },

  update: (id: string, updates: Partial<VehicleTable>) => {
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);
    if (vehicleIndex === -1) return null;

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return vehicles[vehicleIndex];
  },

  delete: (id: string) => {
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);
    if (vehicleIndex === -1) return false;

    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    return true;
  },

  // Vehicle statistics
  getVehicleStats: (companyId: string) => {
    const companyVehicles = vehicles.filter((v) => v.companyId === companyId);
    const activeVehicles = companyVehicles.filter((v) => v.isActive);

    return {
      total: companyVehicles.length,
      active: activeVehicles.length,
      inactive: companyVehicles.length - activeVehicles.length,
      byType: companyVehicles.reduce((acc, v) => {
        acc[v.vehicleType] = (acc[v.vehicleType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: activeVehicles.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageYear:
        activeVehicles.reduce((sum, v) => sum + v.year, 0) /
          activeVehicles.length || 0,
    };
  },

  // Maintenance tracking
  getMaintenanceDue: (companyId: string, days: number = 30) => {
    const activeVehicles = vehicles.filter(
      (v) => v.companyId === companyId && v.isActive
    );

    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return activeVehicles.filter((v) => {
      if (!v.nextMaintenanceDate) return false;
      const maintenanceDate = new Date(v.nextMaintenanceDate);
      return maintenanceDate >= today && maintenanceDate <= futureDate;
    });
  },

  updateOdometer: (vehicleId: string, newReading: number, notes?: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return null;

    const previousReading = vehicle.currentOdometer || 0;
    vehicle.currentOdometer = newReading;
    vehicle.updatedAt = new Date().toISOString();

    // Create usage record
    const usage: VehicleUsageTable = {
      id: `usage-${Date.now()}`,
      companyId: vehicle.companyId,
      vehicleId,
      usageDate: new Date().toISOString().split("T")[0],
      startOdometer: previousReading,
      endOdometer: newReading,
      distance: newReading - previousReading,
      fuelUsed: 0, // Will be updated separately
      fuelCost: 0,
      driverId: "",
      purpose: "odometer_update",
      notes: notes || "Odometer reading update",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vehicleUsage.push(usage);

    return {
      vehicle,
      usage,
      distanceTraveled: newReading - previousReading,
    };
  },
};

// =============================================================================
// VEHICLE SERVICE MANAGEMENT
// =============================================================================

export const maintenanceService = {
  // Service history
  getServiceHistory: getVehicleServiceHistory,

  // Schedule service
  scheduleService: (
    vehicleId: string,
    serviceType: string,
    scheduledDate: string,
    estimatedCost?: number,
    notes?: string
  ) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return null;

    const service: VehicleServiceTable = {
      id: `svc-${Date.now()}`,
      companyId: vehicle.companyId,
      vehicleId,
      serviceDate: scheduledDate,
      serviceType,
      odometerReading: vehicle.currentOdometer || 0,
      description: `Scheduled ${serviceType}`,
      serviceCost: estimatedCost || 0,
      serviceProvider: "",
      employeeId: "",
      status: "scheduled",
      nextServiceDate: "",
      nextServiceOdometer: 0,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vehicleServices.push(service);
    return service;
  },

  // Complete service
  completeService: (
    serviceId: string,
    actualCost: number,
    serviceProvider: string,
    employeeId: string,
    nextServiceDate?: string,
    nextServiceOdometer?: number
  ) => {
    const service = vehicleServices.find((s) => s.id === serviceId);
    if (!service) return null;

    service.serviceCost = actualCost;
    service.serviceProvider = serviceProvider;
    service.employeeId = employeeId;
    service.status = "completed";
    service.nextServiceDate = nextServiceDate || "";
    service.nextServiceOdometer = nextServiceOdometer || 0;
    service.updatedAt = new Date().toISOString();

    // Update vehicle next maintenance date
    if (nextServiceDate) {
      const vehicle = vehicles.find((v) => v.id === service.vehicleId);
      if (vehicle) {
        vehicle.nextMaintenanceDate = nextServiceDate;
        vehicle.updatedAt = new Date().toISOString();
      }
    }

    return service;
  },

  // Service statistics
  getMaintenanceStats: (companyId: string, year?: number) => {
    let services = vehicleServices.filter((s) => s.companyId === companyId);

    if (year) {
      services = services.filter(
        (s) => new Date(s.serviceDate).getFullYear() === year
      );
    }

    const totalCost = services.reduce((sum, s) => sum + s.serviceCost, 0);
    const completedServices = services.filter((s) => s.status === "completed");

    return {
      totalServices: services.length,
      completedServices: completedServices.length,
      scheduledServices: services.filter((s) => s.status === "scheduled")
        .length,
      totalCost,
      averageCost: totalCost / services.length || 0,
      byType: services.reduce((acc, s) => {
        acc[s.serviceType] = (acc[s.serviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      monthlyCost: this.getMonthlyCosts(
        services,
        year || new Date().getFullYear()
      ),
    };
  },

  getMonthlyCosts: (services: VehicleServiceTable[], year: number) => {
    const monthlyCosts = Array(12).fill(0);

    services.forEach((service) => {
      const serviceDate = new Date(service.serviceDate);
      if (serviceDate.getFullYear() === year) {
        monthlyCosts[serviceDate.getMonth()] += service.serviceCost;
      }
    });

    return monthlyCosts;
  },
};

// =============================================================================
// VEHICLE USAGE TRACKING
// =============================================================================

export const usageService = {
  // Usage history
  getUsageHistory: getVehicleUsageHistory,

  // Record trip
  recordTrip: (
    vehicleId: string,
    driverId: string,
    startOdometer: number,
    endOdometer: number,
    purpose: string,
    fuelUsed?: number,
    fuelCost?: number,
    notes?: string
  ) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return null;

    const usage: VehicleUsageTable = {
      id: `usage-${Date.now()}`,
      companyId: vehicle.companyId,
      vehicleId,
      usageDate: new Date().toISOString().split("T")[0],
      startOdometer,
      endOdometer,
      distance: endOdometer - startOdometer,
      fuelUsed: fuelUsed || 0,
      fuelCost: fuelCost || 0,
      driverId,
      purpose,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vehicleUsage.push(usage);

    // Update vehicle odometer
    vehicle.currentOdometer = endOdometer;
    vehicle.updatedAt = new Date().toISOString();

    return usage;
  },

  // Usage statistics
  getUsageStats: (companyId: string, period?: string) => {
    let usageRecords = vehicleUsage.filter((u) => u.companyId === companyId);

    if (period) {
      usageRecords = usageRecords.filter((u) => u.usageDate.startsWith(period));
    }

    const totalDistance = usageRecords.reduce((sum, u) => sum + u.distance, 0);
    const totalFuelCost = usageRecords.reduce((sum, u) => sum + u.fuelCost, 0);
    const totalFuelUsed = usageRecords.reduce((sum, u) => sum + u.fuelUsed, 0);

    return {
      totalTrips: usageRecords.length,
      totalDistance,
      totalFuelUsed,
      totalFuelCost,
      averageDistance: totalDistance / usageRecords.length || 0,
      averageFuelEfficiency:
        totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0,
      byVehicle: this.getUsageByVehicle(usageRecords),
      byDriver: this.getUsageByDriver(usageRecords),
      byPurpose: usageRecords.reduce((acc, u) => {
        acc[u.purpose] = (acc[u.purpose] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },

  getUsageByVehicle: (usageRecords: VehicleUsageTable[]) => {
    return usageRecords.reduce((acc, usage) => {
      if (!acc[usage.vehicleId]) {
        acc[usage.vehicleId] = {
          trips: 0,
          distance: 0,
          fuelUsed: 0,
          fuelCost: 0,
        };
      }
      acc[usage.vehicleId].trips += 1;
      acc[usage.vehicleId].distance += usage.distance;
      acc[usage.vehicleId].fuelUsed += usage.fuelUsed;
      acc[usage.vehicleId].fuelCost += usage.fuelCost;
      return acc;
    }, {} as Record<string, any>);
  },

  getUsageByDriver: (usageRecords: VehicleUsageTable[]) => {
    return usageRecords.reduce((acc, usage) => {
      if (!acc[usage.driverId]) {
        acc[usage.driverId] = {
          trips: 0,
          distance: 0,
          fuelUsed: 0,
          fuelCost: 0,
        };
      }
      acc[usage.driverId].trips += 1;
      acc[usage.driverId].distance += usage.distance;
      acc[usage.driverId].fuelUsed += usage.fuelUsed;
      acc[usage.driverId].fuelCost += usage.fuelCost;
      return acc;
    }, {} as Record<string, any>);
  },
};

// =============================================================================
// UNIFIED FLEET EXPORT
// =============================================================================

export const FleetService = {
  vehicles: vehicleService,
  maintenance: maintenanceService,
  usage: usageService,
};

export default FleetService;
