import { UserRole } from "../types/enums";

export interface UserTable {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  role: UserRole;
  companyId?: string; // Foreign key to companies table
  isActive: boolean;
  phone?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

// Users table - contains all system users (superadmin, owners, employees)
export const users: UserTable[] = [
  // Superadmin
  {
    id: "user-superadmin-1",
    email: "superadmin@erpindo.com",
    password: "super123",
    name: "Super Administrator",
    role: UserRole.SUPERADMIN,
    phone: "+62 21 1111 0000",
    position: "System Administrator",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },

  // Company Owners
  {
    id: "user-owner-1",
    email: "owner@teknologimaju.com",
    password: "owner123",
    name: "John Doe",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-1",
    phone: "+62 21 1234 5678",
    position: "CEO",
    isActive: true,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "user-owner-2",
    email: "owner@dagangsukses.com",
    password: "owner123",
    name: "Maria Santos",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-2",
    phone: "+62 31 9876 5432",
    position: "Managing Director",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "user-owner-3",
    email: "owner@retailnusantara.com",
    password: "owner123",
    name: "Budi Santoso",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-3",
    phone: "+62 22 2468 1357",
    position: "President Director",
    isActive: false,
    createdAt: "2024-03-10T00:00:00.000Z",
    updatedAt: "2024-03-10T00:00:00.000Z",
  },
  {
    id: "user-owner-4",
    email: "owner@mandirijaya.com",
    password: "owner123",
    name: "Siti Nurhaliza",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-4",
    phone: "+62 274 3691 2580",
    position: "Owner",
    isActive: true,
    createdAt: "2024-04-05T00:00:00.000Z",
    updatedAt: "2024-04-05T00:00:00.000Z",
  },
  {
    id: "user-owner-5",
    email: "owner@berkahfnb.com",
    password: "owner123",
    name: "Ahmad Rizki",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-5",
    phone: "+62 21 7531 9642",
    position: "Founder & CEO",
    isActive: true,
    createdAt: "2024-05-12T00:00:00.000Z",
    updatedAt: "2024-05-12T00:00:00.000Z",
  },
  {
    id: "user-owner-6",
    email: "owner@cahayamotor.com",
    password: "owner123",
    name: "Hendro Wijaya",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-6",
    phone: "+62 31 8520 7410",
    position: "General Manager",
    isActive: true,
    createdAt: "2024-06-18T00:00:00.000Z",
    updatedAt: "2024-06-18T00:00:00.000Z",
  },
  {
    id: "user-owner-7",
    email: "owner@fashiontrend.com",
    password: "owner123",
    name: "Diana Putri",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-7",
    phone: "+62 21 4567 8901",
    position: "Creative Director",
    isActive: false,
    createdAt: "2024-07-22T00:00:00.000Z",
    updatedAt: "2024-07-22T00:00:00.000Z",
  },
  {
    id: "user-owner-8",
    email: "owner@agromakmur.com",
    password: "owner123",
    name: "Bambang Sutrisno",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-8",
    phone: "+62 341 9876 5432",
    position: "Managing Partner",
    isActive: true,
    createdAt: "2024-08-30T00:00:00.000Z",
    updatedAt: "2024-08-30T00:00:00.000Z",
  },

  // Employees for Company 1 (PT. Teknologi Maju) - 15 employees
  {
    id: "user-employee-1",
    email: "jane.smith@teknologimaju.com",
    password: "emp123",
    name: "Jane Smith",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 811 1234 5678",
    position: "Cashier",
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "user-employee-2",
    email: "ahmad.rahman@teknologimaju.com",
    password: "emp123",
    name: "Ahmad Rahman",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 812 2345 6789",
    position: "Warehouse Staff",
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },
  {
    id: "user-employee-3",
    email: "dewi.sartika@teknologimaju.com",
    password: "emp123",
    name: "Dewi Sartika",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 813 3456 7890",
    position: "Sales Supervisor",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "user-employee-4",
    email: "rudi.hartono@teknologimaju.com",
    password: "emp123",
    name: "Rudi Hartono",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 814 4567 8901",
    position: "Finance Staff",
    isActive: false,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "user-employee-5",
    email: "lisa.permata@teknologimaju.com",
    password: "emp123",
    name: "Lisa Permata",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 815 5678 9012",
    position: "HR Specialist",
    isActive: true,
    createdAt: "2024-04-01T00:00:00.000Z",
    updatedAt: "2024-04-01T00:00:00.000Z",
  },
  {
    id: "user-employee-6",
    email: "andi.kurnia@teknologimaju.com",
    password: "emp123",
    name: "Andi Kurniawan",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 816 6789 0123",
    position: "IT Support",
    isActive: true,
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-05-15T00:00:00.000Z",
  },
  {
    id: "user-employee-7",
    email: "sari.indah@teknologimaju.com",
    password: "emp123",
    name: "Sari Indahsari",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 817 7890 1234",
    position: "Marketing Staff",
    isActive: true,
    createdAt: "2024-06-20T00:00:00.000Z",
    updatedAt: "2024-06-20T00:00:00.000Z",
  },
  {
    id: "user-employee-8",
    email: "bayu.setiawan@teknologimaju.com",
    password: "emp123",
    name: "Bayu Setiawan",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 818 8901 2345",
    position: "Sales Representative",
    isActive: true,
    createdAt: "2024-07-10T00:00:00.000Z",
    updatedAt: "2024-07-10T00:00:00.000Z",
  },

  // More employees for Company 1
  {
    id: "user-employee-17",
    email: "nina.sari@teknologimaju.com",
    password: "emp123",
    name: "Nina Sari",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 819 9012 3456",
    position: "Customer Service",
    isActive: true,
    createdAt: "2024-08-01T00:00:00.000Z",
    updatedAt: "2024-08-01T00:00:00.000Z",
  },
  {
    id: "user-employee-18",
    email: "dimas.pratama@teknologimaju.com",
    password: "emp123",
    name: "Dimas Pratama",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 820 0123 4567",
    position: "Quality Control",
    isActive: true,
    createdAt: "2024-08-15T00:00:00.000Z",
    updatedAt: "2024-08-15T00:00:00.000Z",
  },
  {
    id: "user-employee-19",
    email: "rina.wati@teknologimaju.com",
    password: "emp123",
    name: "Rina Wati",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 821 1234 5678",
    position: "Administrative Assistant",
    isActive: true,
    createdAt: "2024-09-01T00:00:00.000Z",
    updatedAt: "2024-09-01T00:00:00.000Z",
  },
  {
    id: "user-employee-20",
    email: "ferdi.gunawan@teknologimaju.com",
    password: "emp123",
    name: "Ferdi Gunawan",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 822 2345 6789",
    position: "Driver",
    isActive: true,
    createdAt: "2024-09-15T00:00:00.000Z",
    updatedAt: "2024-09-15T00:00:00.000Z",
  },
  {
    id: "user-employee-21",
    email: "lita.sari@teknologimaju.com",
    password: "emp123",
    name: "Lita Sari",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 823 3456 7890",
    position: "Accountant",
    isActive: true,
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-10-01T00:00:00.000Z",
  },
  {
    id: "user-employee-22",
    email: "hendra.wijaya@teknologimaju.com",
    password: "emp123",
    name: "Hendra Wijaya",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 824 4567 8901",
    position: "Procurement Officer",
    isActive: true,
    createdAt: "2024-10-15T00:00:00.000Z",
    updatedAt: "2024-10-15T00:00:00.000Z",
  },
  {
    id: "user-employee-23",
    email: "maya.indri@teknologimaju.com",
    password: "emp123",
    name: "Maya Indri",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 825 5678 9012",
    position: "Graphic Designer",
    isActive: true,
    createdAt: "2024-11-01T00:00:00.000Z",
    updatedAt: "2024-11-01T00:00:00.000Z",
  },

  // Employees for Company 2 (CV. Dagang Sukses Mandiri) - 8 employees
  {
    id: "user-employee-9",
    email: "maya.sari@dagangsukses.com",
    password: "emp123",
    name: "Maya Sari",
    role: UserRole.EMPLOYEE,
    companyId: "company-2",
    phone: "+62 831 1111 2222",
    position: "Head Cashier",
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "user-employee-10",
    email: "rinto.prasetyo@dagangsukses.com",
    password: "emp123",
    name: "Rinto Prasetyo",
    role: UserRole.EMPLOYEE,
    companyId: "company-2",
    phone: "+62 832 2222 3333",
    position: "Warehouse Manager",
    isActive: true,
    createdAt: "2024-04-15T00:00:00.000Z",
    updatedAt: "2024-04-15T00:00:00.000Z",
  },
  {
    id: "user-employee-24",
    email: "sinta.dewi@dagangsukses.com",
    password: "emp123",
    name: "Sinta Dewi",
    role: UserRole.EMPLOYEE,
    companyId: "company-2",
    phone: "+62 833 3333 4444",
    position: "Sales Executive",
    isActive: true,
    createdAt: "2024-05-01T00:00:00.000Z",
    updatedAt: "2024-05-01T00:00:00.000Z",
  },

  // Employees for Company 5 (PT. Berkah Food & Beverage) - 22 employees
  {
    id: "user-employee-11",
    email: "chef.rama@berkahfnb.com",
    password: "emp123",
    name: "Rama Wijaya",
    role: UserRole.EMPLOYEE,
    companyId: "company-5",
    phone: "+62 851 1111 1111",
    position: "Head Chef",
    isActive: true,
    createdAt: "2024-05-20T00:00:00.000Z",
    updatedAt: "2024-05-20T00:00:00.000Z",
  },
  {
    id: "user-employee-12",
    email: "supervisor.dini@berkahfnb.com",
    password: "emp123",
    name: "Dini Anggraeni",
    role: UserRole.EMPLOYEE,
    companyId: "company-5",
    phone: "+62 852 2222 2222",
    position: "Restaurant Supervisor",
    isActive: true,
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "user-employee-13",
    email: "kasir.tono@berkahfnb.com",
    password: "emp123",
    name: "Tono Subekti",
    role: UserRole.EMPLOYEE,
    companyId: "company-5",
    phone: "+62 853 3333 3333",
    position: "Cashier",
    isActive: true,
    createdAt: "2024-06-15T00:00:00.000Z",
    updatedAt: "2024-06-15T00:00:00.000Z",
  },
  {
    id: "user-employee-14",
    email: "waitress.lia@berkahfnb.com",
    password: "emp123",
    name: "Lia Kartika",
    role: UserRole.EMPLOYEE,
    companyId: "company-5",
    phone: "+62 854 4444 4444",
    position: "Waitress",
    isActive: true,
    createdAt: "2024-07-01T00:00:00.000Z",
    updatedAt: "2024-07-01T00:00:00.000Z",
  },

  // Employees for Company 6 (CV. Cahaya Motor) - 10 employees
  {
    id: "user-employee-15",
    email: "mekanik.joko@cahayamotor.com",
    password: "emp123",
    name: "Joko Susanto",
    role: UserRole.EMPLOYEE,
    companyId: "company-6",
    phone: "+62 861 1111 1111",
    position: "Senior Mechanic",
    isActive: true,
    createdAt: "2024-07-01T00:00:00.000Z",
    updatedAt: "2024-07-01T00:00:00.000Z",
  },
  {
    id: "user-employee-16",
    email: "sales.wati@cahayamotor.com",
    password: "emp123",
    name: "Wati Suherman",
    role: UserRole.EMPLOYEE,
    companyId: "company-6",
    phone: "+62 862 2222 2222",
    position: "Sales Executive",
    isActive: true,
    createdAt: "2024-07-15T00:00:00.000Z",
    updatedAt: "2024-07-15T00:00:00.000Z",
  },
];

// Helper functions to simulate database operations
export const getUserById = (id: string): UserTable | undefined => {
  return users.find((user) => user.id === id);
};

export const getUserByEmail = (email: string): UserTable | undefined => {
  return users.find((user) => user.email === email);
};

export const getUsersByCompanyId = (companyId: string): UserTable[] => {
  return users.filter((user) => user.companyId === companyId);
};

export const getUsersByRole = (role: UserRole): UserTable[] => {
  return users.filter((user) => user.role === role);
};

export const getActiveUsersByCompanyId = (companyId: string): UserTable[] => {
  return users.filter((user) => user.companyId === companyId && user.isActive);
};

export const getUsersByPosition = (
  companyId: string,
  position: string
): UserTable[] => {
  return users.filter(
    (user) =>
      user.companyId === companyId &&
      user.position?.toLowerCase().includes(position.toLowerCase())
  );
};

// Statistics helpers
export const getUserStatistics = () => ({
  totalUsers: users.length,
  superadmins: users.filter((u) => u.role === UserRole.SUPERADMIN).length,
  companyOwners: users.filter((u) => u.role === UserRole.COMPANY_OWNER).length,
  employees: users.filter((u) => u.role === UserRole.EMPLOYEE).length,
  activeUsers: users.filter((u) => u.isActive).length,
  inactiveUsers: users.filter((u) => !u.isActive).length,
  usersByCompany: users
    .filter((u) => u.companyId)
    .reduce((acc, user) => {
      const companyId = user.companyId!;
      acc[companyId] = (acc[companyId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
});
