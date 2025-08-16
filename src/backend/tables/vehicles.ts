export interface VehicleTable {
  id: string;
  companyId: string; // Foreign key to companies table
  vehicleCode: string;
  licensePlate: string;
  vehicleType: "car" | "motorcycle" | "truck" | "van" | "pickup";
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  engineCapacity?: string; // e.g., "1500cc", "150cc"
  driverId?: string; // Employee ID who drives this vehicle
  status: "active" | "maintenance" | "inactive";
  lastServiceDate?: string;
  nextServiceDue?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string; // STNK expiry
  currentMileage: number; // in kilometers
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleServiceTable {
  id: string;
  companyId: string; // Foreign key to companies table
  vehicleId: string; // Foreign key to vehicles table
  serviceDate: string;
  serviceType: "routine" | "repair" | "emergency" | "inspection";
  description: string;
  mileage: number;
  cost: number;
  workshop?: string;
  nextServiceDue?: string;
  employeeId?: string; // Employee who arranged the service
  notes?: string;
  createdAt: string;
}

export interface VehicleUsageTable {
  id: string;
  companyId: string; // Foreign key to companies table
  vehicleId: string; // Foreign key to vehicles table
  driverId: string; // Employee ID
  usageDate: string;
  startTime: string;
  endTime?: string;
  startMileage: number;
  endMileage?: number;
  distance?: number;
  fuelUsed?: number; // in liters
  destination?: string;
  purpose: "delivery" | "meeting" | "service" | "other";
  notes?: string;
  createdAt: string;
}

// Vehicles table
export const vehicles: VehicleTable[] = [
  // Vehicles for Company 2 (CV. Dagang Sukses Mandiri) - Delivery trucks
  {
    id: "veh-2-001",
    companyId: "company-2",
    vehicleCode: "TRK-001",
    licensePlate: "L 1234 ABC",
    vehicleType: "truck",
    brand: "Mitsubishi",
    model: "Colt Diesel",
    year: 2020,
    color: "Putih",
    fuelType: "diesel",
    engineCapacity: "2500cc",
    driverId: "emp-2-003",
    status: "active",
    lastServiceDate: "2024-11-15T00:00:00.000Z",
    nextServiceDue: "2025-02-15T00:00:00.000Z",
    insuranceExpiry: "2025-08-20T00:00:00.000Z",
    registrationExpiry: "2025-03-15T00:00:00.000Z",
    currentMileage: 45000,
    notes: "Truck untuk delivery beras dan sembako",
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "veh-2-002",
    companyId: "company-2",
    vehicleCode: "PKP-001",
    licensePlate: "L 5678 DEF",
    vehicleType: "pickup",
    brand: "Toyota",
    model: "Hilux",
    year: 2019,
    color: "Silver",
    fuelType: "diesel",
    engineCapacity: "2400cc",
    driverId: "emp-2-004",
    status: "active",
    lastServiceDate: "2024-10-20T00:00:00.000Z",
    nextServiceDue: "2025-01-20T00:00:00.000Z",
    insuranceExpiry: "2025-06-10T00:00:00.000Z",
    registrationExpiry: "2025-04-12T00:00:00.000Z",
    currentMileage: 62000,
    notes: "Pickup untuk delivery area sempit",
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-11-20T00:00:00.000Z",
  },

  // Vehicles for Company 3 (PT. Fashion Trend) - Delivery van
  {
    id: "veh-3-001",
    companyId: "company-3",
    vehicleCode: "VAN-001",
    licensePlate: "B 9876 GHI",
    vehicleType: "van",
    brand: "Daihatsu",
    model: "Gran Max",
    year: 2021,
    color: "Merah",
    fuelType: "gasoline",
    engineCapacity: "1300cc",
    status: "active",
    lastServiceDate: "2024-12-01T00:00:00.000Z",
    nextServiceDue: "2025-03-01T00:00:00.000Z",
    insuranceExpiry: "2025-09-15T00:00:00.000Z",
    registrationExpiry: "2025-05-20T00:00:00.000Z",
    currentMileage: 28000,
    notes: "Van untuk pengiriman fashion items",
    isActive: true,
    createdAt: "2024-04-10T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },

  // Vehicles for Company 5 (PT. Berkah Food & Beverage) - Delivery motorcycles
  {
    id: "veh-5-001",
    companyId: "company-5",
    vehicleCode: "MTR-001",
    licensePlate: "B 1111 JKL",
    vehicleType: "motorcycle",
    brand: "Honda",
    model: "Beat",
    year: 2022,
    color: "Merah",
    fuelType: "gasoline",
    engineCapacity: "110cc",
    driverId: "emp-5-003",
    status: "active",
    lastServiceDate: "2024-11-10T00:00:00.000Z",
    nextServiceDue: "2025-02-10T00:00:00.000Z",
    insuranceExpiry: "2025-07-15T00:00:00.000Z",
    registrationExpiry: "2025-03-20T00:00:00.000Z",
    currentMileage: 15000,
    notes: "Motor untuk delivery makanan",
    isActive: true,
    createdAt: "2024-05-20T00:00:00.000Z",
    updatedAt: "2024-11-10T00:00:00.000Z",
  },
  {
    id: "veh-5-002",
    companyId: "company-5",
    vehicleCode: "MTR-002",
    licensePlate: "B 2222 MNO",
    vehicleType: "motorcycle",
    brand: "Yamaha",
    model: "Mio",
    year: 2021,
    color: "Biru",
    fuelType: "gasoline",
    engineCapacity: "125cc",
    driverId: "emp-5-004",
    status: "active",
    lastServiceDate: "2024-10-25T00:00:00.000Z",
    nextServiceDue: "2025-01-25T00:00:00.000Z",
    insuranceExpiry: "2025-08-10T00:00:00.000Z",
    registrationExpiry: "2025-02-15T00:00:00.000Z",
    currentMileage: 18500,
    notes: "Motor cadangan untuk peak hours",
    isActive: true,
    createdAt: "2024-05-20T00:00:00.000Z",
    updatedAt: "2024-10-25T00:00:00.000Z",
  },

  // Vehicles for Company 6 (CV. Cahaya Motor) - Workshop vehicles
  {
    id: "veh-6-001",
    companyId: "company-6",
    vehicleCode: "SVC-001",
    licensePlate: "L 7777 PQR",
    vehicleType: "motorcycle",
    brand: "Honda",
    model: "Scoopy",
    year: 2023,
    color: "Putih",
    fuelType: "gasoline",
    engineCapacity: "110cc",
    status: "active",
    lastServiceDate: "2024-11-30T00:00:00.000Z",
    nextServiceDue: "2025-02-28T00:00:00.000Z",
    insuranceExpiry: "2025-12-01T00:00:00.000Z",
    registrationExpiry: "2025-06-15T00:00:00.000Z",
    currentMileage: 8500,
    notes: "Motor untuk test ride dan demo",
    isActive: true,
    createdAt: "2024-06-20T00:00:00.000Z",
    updatedAt: "2024-11-30T00:00:00.000Z",
  },

  // Vehicles for Company 8 (PT. Agro Sejahtera) - Farm vehicles
  {
    id: "veh-8-001",
    companyId: "company-8",
    vehicleCode: "TRK-001",
    licensePlate: "AG 3333 STU",
    vehicleType: "truck",
    brand: "Isuzu",
    model: "ELF",
    year: 2018,
    color: "Hijau",
    fuelType: "diesel",
    engineCapacity: "3000cc",
    status: "active",
    lastServiceDate: "2024-11-05T00:00:00.000Z",
    nextServiceDue: "2025-02-05T00:00:00.000Z",
    insuranceExpiry: "2025-05-20T00:00:00.000Z",
    registrationExpiry: "2025-01-30T00:00:00.000Z",
    currentMileage: 95000,
    notes: "Truck untuk angkut hasil panen",
    isActive: true,
    createdAt: "2024-08-01T00:00:00.000Z",
    updatedAt: "2024-11-05T00:00:00.000Z",
  },
  {
    id: "veh-8-002",
    companyId: "company-8",
    vehicleCode: "PKP-001",
    licensePlate: "AG 4444 VWX",
    vehicleType: "pickup",
    brand: "Mitsubishi",
    model: "Triton",
    year: 2020,
    color: "Coklat",
    fuelType: "diesel",
    engineCapacity: "2400cc",
    status: "maintenance",
    lastServiceDate: "2024-12-08T00:00:00.000Z",
    nextServiceDue: "2025-03-08T00:00:00.000Z",
    insuranceExpiry: "2025-10-15T00:00:00.000Z",
    registrationExpiry: "2025-07-12T00:00:00.000Z",
    currentMileage: 58000,
    notes: "Pickup untuk distribusi ke toko-toko",
    isActive: true,
    createdAt: "2024-08-01T00:00:00.000Z",
    updatedAt: "2024-12-08T00:00:00.000Z",
  },
];

// Vehicle Service records
export const vehicleServices: VehicleServiceTable[] = [
  // Services for Company 2 vehicles
  {
    id: "svc-2-001",
    companyId: "company-2",
    vehicleId: "veh-2-001",
    serviceDate: "2024-11-15T00:00:00.000Z",
    serviceType: "routine",
    description: "Ganti oli mesin, filter oli, dan cek rem",
    mileage: 45000,
    cost: 450000,
    workshop: "Bengkel Mitsubishi Resmi Surabaya",
    nextServiceDue: "2025-02-15T00:00:00.000Z",
    employeeId: "emp-2-001",
    notes: "Kondisi kendaraan masih baik",
    createdAt: "2024-11-15T00:00:00.000Z",
  },
  {
    id: "svc-2-002",
    companyId: "company-2",
    vehicleId: "veh-2-002",
    serviceDate: "2024-10-20T00:00:00.000Z",
    serviceType: "repair",
    description: "Perbaikan sistem AC dan ganti kampas rem",
    mileage: 62000,
    cost: 850000,
    workshop: "Toyota Auto 2000 Surabaya",
    nextServiceDue: "2025-01-20T00:00:00.000Z",
    employeeId: "emp-2-001",
    notes: "AC sudah normal kembali",
    createdAt: "2024-10-20T00:00:00.000Z",
  },

  // Services for Company 5 motorcycles
  {
    id: "svc-5-001",
    companyId: "company-5",
    vehicleId: "veh-5-001",
    serviceDate: "2024-11-10T00:00:00.000Z",
    serviceType: "routine",
    description: "Service rutin 15.000 km - ganti oli, busi, dan cek rantai",
    mileage: 15000,
    cost: 125000,
    workshop: "Honda AHASS Jakarta",
    nextServiceDue: "2025-02-10T00:00:00.000Z",
    employeeId: "emp-5-001",
    notes: "Motor dalam kondisi prima",
    createdAt: "2024-11-10T00:00:00.000Z",
  },
  {
    id: "svc-5-002",
    companyId: "company-5",
    vehicleId: "veh-5-002",
    serviceDate: "2024-10-25T00:00:00.000Z",
    serviceType: "routine",
    description: "Ganti oli, filter udara, dan setel klep",
    mileage: 18500,
    cost: 135000,
    workshop: "Yamaha Service Center Jakarta",
    nextServiceDue: "2025-01-25T00:00:00.000Z",
    employeeId: "emp-5-001",
    createdAt: "2024-10-25T00:00:00.000Z",
  },

  // Service for Company 8 truck
  {
    id: "svc-8-001",
    companyId: "company-8",
    vehicleId: "veh-8-001",
    serviceDate: "2024-11-05T00:00:00.000Z",
    serviceType: "routine",
    description: "Service besar 95.000 km - ganti oli, filter, dan cek sistem",
    mileage: 95000,
    cost: 750000,
    workshop: "Isuzu Service Center Malang",
    nextServiceDue: "2025-02-05T00:00:00.000Z",
    employeeId: "emp-8-001",
    notes: "Perlu perhatian khusus pada sistem transmisi",
    createdAt: "2024-11-05T00:00:00.000Z",
  },
  {
    id: "svc-8-002",
    companyId: "company-8",
    vehicleId: "veh-8-002",
    serviceDate: "2024-12-08T00:00:00.000Z",
    serviceType: "repair",
    description: "Perbaikan sistem suspensi belakang",
    mileage: 58000,
    cost: 1200000,
    workshop: "Bengkel Mitsubishi Malang",
    nextServiceDue: "2025-03-08T00:00:00.000Z",
    employeeId: "emp-8-001",
    notes: "Masih dalam masa garansi perbaikan",
    createdAt: "2024-12-08T00:00:00.000Z",
  },
];

// Vehicle Usage records
export const vehicleUsages: VehicleUsageTable[] = [
  // Usage records for Company 2 delivery trucks
  {
    id: "use-2-001",
    companyId: "company-2",
    vehicleId: "veh-2-001",
    driverId: "emp-2-003",
    usageDate: "2024-12-12T00:00:00.000Z",
    startTime: "2024-12-12T07:00:00.000Z",
    endTime: "2024-12-12T15:30:00.000Z",
    startMileage: 45000,
    endMileage: 45085,
    distance: 85,
    fuelUsed: 12.5,
    destination: "Area Surabaya Timur - Delivery ke 5 warung",
    purpose: "delivery",
    notes: "Delivery beras dan sembako rutin",
    createdAt: "2024-12-12T15:30:00.000Z",
  },
  {
    id: "use-2-002",
    companyId: "company-2",
    vehicleId: "veh-2-002",
    driverId: "emp-2-004",
    usageDate: "2024-12-11T00:00:00.000Z",
    startTime: "2024-12-11T08:00:00.000Z",
    endTime: "2024-12-11T12:00:00.000Z",
    startMileage: 62000,
    endMileage: 62045,
    distance: 45,
    fuelUsed: 8.0,
    destination: "Pasar Induk Gresik",
    purpose: "service",
    notes: "Ambil barang dari supplier",
    createdAt: "2024-12-11T12:00:00.000Z",
  },

  // Usage records for Company 5 delivery motorcycles
  {
    id: "use-5-001",
    companyId: "company-5",
    vehicleId: "veh-5-001",
    driverId: "emp-5-003",
    usageDate: "2024-12-12T00:00:00.000Z",
    startTime: "2024-12-12T11:30:00.000Z",
    endTime: "2024-12-12T12:45:00.000Z",
    startMileage: 15000,
    endMileage: 15018,
    distance: 18,
    fuelUsed: 1.2,
    destination: "Jl. Sudirman No. 123 - Delivery lunch order",
    purpose: "delivery",
    notes: "Delivery paket makan siang ke kantor",
    createdAt: "2024-12-12T12:45:00.000Z",
  },
  {
    id: "use-5-002",
    companyId: "company-5",
    vehicleId: "veh-5-001",
    driverId: "emp-5-003",
    usageDate: "2024-12-12T00:00:00.000Z",
    startTime: "2024-12-12T18:00:00.000Z",
    endTime: "2024-12-12T19:15:00.000Z",
    startMileage: 15018,
    endMileage: 15030,
    distance: 12,
    fuelUsed: 0.8,
    destination: "Perumahan Griya Asri - Delivery dinner",
    purpose: "delivery",
    notes: "Delivery makan malam keluarga",
    createdAt: "2024-12-12T19:15:00.000Z",
  },

  // Usage record for Company 8 farm vehicle
  {
    id: "use-8-001",
    companyId: "company-8",
    vehicleId: "veh-8-001",
    driverId: "emp-8-002",
    usageDate: "2024-12-10T00:00:00.000Z",
    startTime: "2024-12-10T05:00:00.000Z",
    endTime: "2024-12-10T11:00:00.000Z",
    startMileage: 94980,
    endMileage: 95020,
    distance: 40,
    fuelUsed: 18.0,
    destination: "Kebun sayur Blitar - Angkut panen",
    purpose: "service",
    notes: "Angkut hasil panen sayuran ke gudang",
    createdAt: "2024-12-10T11:00:00.000Z",
  },
];

// Helper functions for vehicles
export const getVehicleById = (id: string): VehicleTable | undefined => {
  return vehicles.find((vehicle) => vehicle.id === id);
};

export const getVehiclesByCompanyId = (companyId: string): VehicleTable[] => {
  return vehicles.filter(
    (vehicle) => vehicle.companyId === companyId && vehicle.isActive
  );
};

export const getVehiclesByStatus = (
  companyId: string,
  status: string
): VehicleTable[] => {
  return vehicles.filter(
    (vehicle) =>
      vehicle.companyId === companyId &&
      vehicle.status === status &&
      vehicle.isActive
  );
};

export const getVehiclesByType = (
  companyId: string,
  type: string
): VehicleTable[] => {
  return vehicles.filter(
    (vehicle) =>
      vehicle.companyId === companyId &&
      vehicle.vehicleType === type &&
      vehicle.isActive
  );
};

export const getVehiclesByDriver = (driverId: string): VehicleTable[] => {
  return vehicles.filter(
    (vehicle) => vehicle.driverId === driverId && vehicle.isActive
  );
};

export const getVehiclesNeedingService = (
  companyId: string
): VehicleTable[] => {
  const today = new Date().toISOString();
  return vehicles.filter(
    (vehicle) =>
      vehicle.companyId === companyId &&
      vehicle.nextServiceDue &&
      vehicle.nextServiceDue <= today &&
      vehicle.isActive
  );
};

export const getVehiclesExpiringDocuments = (
  companyId: string,
  days: number = 30
): VehicleTable[] => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const checkDate = futureDate.toISOString();

  return vehicles.filter(
    (vehicle) =>
      vehicle.companyId === companyId &&
      ((vehicle.insuranceExpiry && vehicle.insuranceExpiry <= checkDate) ||
        (vehicle.registrationExpiry &&
          vehicle.registrationExpiry <= checkDate)) &&
      vehicle.isActive
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
  const companyVehicles = getVehiclesByCompanyId(companyId);
  return {
    totalVehicles: companyVehicles.length,
    activeVehicles: companyVehicles.filter((v) => v.status === "active").length,
    maintenanceVehicles: companyVehicles.filter(
      (v) => v.status === "maintenance"
    ).length,
    inactiveVehicles: companyVehicles.filter((v) => v.status === "inactive")
      .length,

    byType: {
      cars: companyVehicles.filter((v) => v.vehicleType === "car").length,
      motorcycles: companyVehicles.filter((v) => v.vehicleType === "motorcycle")
        .length,
      trucks: companyVehicles.filter((v) => v.vehicleType === "truck").length,
      vans: companyVehicles.filter((v) => v.vehicleType === "van").length,
      pickups: companyVehicles.filter((v) => v.vehicleType === "pickup").length,
    },

    needingService: getVehiclesNeedingService(companyId).length,
    expiringDocuments: getVehiclesExpiringDocuments(companyId).length,

    totalMileage: companyVehicles.reduce((sum, v) => sum + v.currentMileage, 0),
    averageMileage:
      companyVehicles.length > 0
        ? companyVehicles.reduce((sum, v) => sum + v.currentMileage, 0) /
          companyVehicles.length
        : 0,
  };
};

export const getVehicleServiceCosts = (companyId: string, year?: number) => {
  let services = getServicesByCompanyId(companyId);

  if (year) {
    const yearStart = `${year}-01-01T00:00:00.000Z`;
    const yearEnd = `${year}-12-31T23:59:59.999Z`;
    services = getServicesByDateRange(companyId, yearStart, yearEnd);
  }

  return {
    totalCost: services.reduce((sum, s) => sum + s.cost, 0),
    routineServiceCost: services
      .filter((s) => s.serviceType === "routine")
      .reduce((sum, s) => sum + s.cost, 0),
    repairCost: services
      .filter((s) => s.serviceType === "repair")
      .reduce((sum, s) => sum + s.cost, 0),
    emergencyCost: services
      .filter((s) => s.serviceType === "emergency")
      .reduce((sum, s) => sum + s.cost, 0),
    averageCostPerService:
      services.length > 0
        ? services.reduce((sum, s) => sum + s.cost, 0) / services.length
        : 0,
  };
};
