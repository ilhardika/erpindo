// =============================================
// REORGANIZED SERVICES - Domain-Based Structure
// =============================================

// Core services (keep existing)
export * from "./auth"; // Authentication & user management
export * from "./company"; // Company & subscription management
export * from "./dashboard"; // Analytics & reporting

// New consolidated services
export * from "./hr"; // HR: Employees + Modules + Attendance + Payroll
export * from "./business"; // Business: Products + Inventory + Sales + Customers
export * from "./fleet"; // Fleet: Vehicles + Maintenance + Usage

// =============================================
// DEPRECATED (Legacy) - Use new consolidated services above
// =============================================
// export * from "./employee";   // → Use ./hr
// export * from "./inventory";  // → Use ./business
// export * from "./sales";      // → Use ./business
// export * from "./modules";    // → Use ./hr
