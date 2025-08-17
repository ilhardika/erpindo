import { User } from "../types/schema";
import { UserTable } from "../tables/users";
import { getAllTables } from "../tables";

export const authenticateUser = (
  email: string,
  password: string
): User | null => {
  try {
    const tables = getAllTables();
    const dbUser = tables.users.find((u) => u.email === email);

    if (!dbUser || !dbUser.isActive) {
      return null;
    }

    // In real app, you'd hash and compare password
    // For demo, we'll just check if password is provided
    if (!password) {
      return null;
    }

    // Convert database user to User interface
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      companyId: dbUser.companyId,
      isActive: dbUser.isActive,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

export class AuthService {
  static async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    return authenticateUser(email, password);
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string } | null> {
    const user = authenticateUser(email, password);

    if (!user) {
      return null;
    }

    // Generate mock token
    const token = `mock-token-${user.id}-${Date.now()}`;

    return {
      user,
      token,
    };
  }

  static async logout(): Promise<void> {
    // Mock logout - in real implementation would invalidate token
    return Promise.resolve();
  }
}
