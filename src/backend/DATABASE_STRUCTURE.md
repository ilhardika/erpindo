# Backend Database Structure

Backend ini telah diubah dari menggunakan mock data tunggal menjadi struktur yang mirip database relasional. Ini memudahkan migrasi ke database sungguhan di kemudian hari.

## Struktur Folder

```
src/backend/
├── tables/          # "Database tables" - file per tabel dengan relasi
├── services/        # Business logic services
├── types/          # TypeScript interfaces dan enums
└── utils/          # Helper functions
```

## Database Tables

### 1. `users.ts` - Tabel Users

**Primary Key:** `id`

Menyimpan semua user (superadmin, company owner, employee).

**Fields:**

- `id`: string - Primary key
- `email`: string - Email user (unique)
- `password`: string - Password (di real app akan di-hash)
- `name`: string - Nama lengkap
- `role`: UserRole - Role user (superadmin, company_owner, employee)
- `companyId`: string (optional) - Foreign key ke companies table
- `isActive`: boolean - Status aktif
- `createdAt`, `updatedAt`: string - Timestamps

**Relations:**

- `companyId` → `companies.id` (many-to-one)
- `id` → `employees.userId` (one-to-one untuk employee)

### 2. `companies.ts` - Tabel Companies

**Primary Key:** `id`

Menyimpan data perusahaan yang terdaftar.

**Fields:**

- `id`: string - Primary key
- `name`: string - Nama perusahaan
- `ownerId`: string - Foreign key ke users table
- `email`: string - Email kontak perusahaan
- `status`: CompanyStatus - Status perusahaan (active, inactive, suspended)
- `paymentStatus`: PaymentStatus - Status pembayaran (paid, unpaid, overdue)
- `employeeCount`: number - Jumlah karyawan (calculated field)
- `registrationDate`: string - Tanggal registrasi
- `lastPaymentDate`: string (optional) - Tanggal pembayaran terakhir
- `subscriptionEndDate`: string (optional) - Tanggal berakhir subscription

**Relations:**

- `ownerId` → `users.id` (many-to-one)
- `id` → `users.companyId` (one-to-many)
- `id` → `employees.companyId` (one-to-many)

### 3. `employees.ts` - Tabel Employees

**Primary Key:** `id`

Menyimpan informasi khusus karyawan (selain info dasar yang ada di users).

**Fields:**

- `id`: string - Primary key
- `userId`: string - Foreign key ke users table
- `companyId`: string - Foreign key ke companies table
- `position`: string - Jabatan
- `department`: string - Departemen
- `joinDate`: string - Tanggal bergabung
- `salary`: number (optional) - Gaji
- `isActive`: boolean - Status aktif

**Relations:**

- `userId` → `users.id` (one-to-one)
- `companyId` → `companies.id` (many-to-one)
- `id` → `employeeModules.employeeId` (one-to-many)

### 4. `modules.ts` - Tabel Modules

**Primary Key:** `id`

Menyimpan semua modul ERP yang tersedia.

**Fields:**

- `id`: string - Primary key
- `code`: string - Kode unik modul (pos, sales, inventory, dll)
- `name`: string - Nama modul
- `description`: string - Deskripsi modul
- `features`: string[] - List fitur dalam modul
- `isActive`: boolean - Status aktif modul

**Relations:**

- `code` → `employeeModules.moduleCode` (one-to-many)

### 5. `employeeModules.ts` - Junction Table

**Primary Key:** `id`

Tabel penghubung many-to-many antara employees dan modules dengan permission.

**Fields:**

- `id`: string - Primary key
- `employeeId`: string - Foreign key ke employees table
- `moduleCode`: string - Foreign key ke modules table
- `canRead`: boolean - Permission read
- `canWrite`: boolean - Permission write
- `canDelete`: boolean - Permission delete
- `assignedAt`: string - Kapan diassign
- `assignedBy`: string - User ID yang meng-assign

**Relations:**

- `employeeId` → `employees.id` (many-to-one)
- `moduleCode` → `modules.code` (many-to-one)

## Database Helper Functions

Setiap tabel memiliki helper functions yang mensimulasikan operasi database:

```typescript
// Users
getUserById(id);
getUserByEmail(email);
getUsersByCompanyId(companyId);
getUsersByRole(role);

// Companies
getCompanyById(id);
getCompaniesByOwnerId(ownerId);
getAllCompanies();

// Employees
getEmployeeById(id);
getEmployeeByUserId(userId);
getEmployeesByCompanyId(companyId);

// Dan lain-lain...
```

## Database Object (db)

File `tables/index.ts` mengexport object `db` yang berfungsi seperti ORM sederhana:

```typescript
import { db } from "./backend/tables";

// Find user by email
const user = db.user.findByEmail("user@example.com");

// Get all employees in a company
const employees = db.employee.findByCompanyId("company-1");

// Check if employee has module access
const hasAccess = db.employeeModule.hasAccess("emp-1", "pos");
```

## Migrasi ke Database Sungguhan

Dengan struktur ini, migrasi ke database sungguhan (MySQL, PostgreSQL, MongoDB) akan mudah:

1. **Table Structure**: Sudah mirip dengan struktur tabel database
2. **Relations**: Foreign key relationships sudah didefinisikan
3. **Helper Functions**: Bisa diganti dengan query database
4. **Services**: Tidak perlu diubah, cukup ganti import dari `tables` ke database ORM

### Contoh Migrasi ke Prisma/TypeORM:

```typescript
// Sekarang:
const user = db.user.findByEmail(email);

// Nanti dengan Prisma:
const user = await prisma.user.findUnique({
  where: { email },
});

// Atau dengan TypeORM:
const user = await userRepository.findOne({
  where: { email },
});
```

## Testing & Development

Struktur ini memudahkan testing karena:

- Data terpisah per tabel
- Helper functions bisa di-mock
- Relationship jelas
- Data konsisten

## Kelebihan Struktur Ini

1. **Scalable**: Mudah menambah tabel baru
2. **Maintainable**: Code terorganisir per domain
3. **Testable**: Setiap tabel bisa ditest terpisah
4. **Migration-ready**: Siap migrasi ke database sungguhan
5. **Type-safe**: Full TypeScript support
6. **Relational**: Mendukung foreign key relationships
