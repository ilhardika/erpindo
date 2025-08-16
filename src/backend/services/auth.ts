import { User, LoginCredentials } from "../types/schema";
import { query, authenticateUser } from "../tables";

export class AuthService {
  static async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const dbUser = query.users.findByEmail(email);

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
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string } | null> {
    const authResult = authenticateUser(email, password);

    if (!authResult.success) {
      return null;
    }

    // Generate mock token
    const token = `mock-token-${authResult.user.id}-${Date.now()}`;

    return {
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        name: authResult.user.name,
        role: authResult.user.role,
        companyId: authResult.user.companyId,
        isActive: authResult.user.isActive,
        createdAt: authResult.user.createdAt,
        updatedAt: authResult.user.updatedAt,
      },
      token,
    };
  }

  static async logout(): Promise<void> {
    // Mock logout - in real implementation would invalidate token
    return Promise.resolve();
  }
}
