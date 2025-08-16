import { User, LoginCredentials } from "../types/schema";
import { db } from "../tables";

export class AuthService {
  static async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const dbUser = db.user.findByEmail(email);

    if (!dbUser || dbUser.password !== password) {
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
    const user = await this.validateCredentials(email, password);

    if (!user) {
      return null;
    }

    // Generate mock token
    const token = `mock-token-${user.id}-${Date.now()}`;

    return { user, token };
  }

  static async logout(): Promise<void> {
    // Mock logout - in real implementation would invalidate token
    return Promise.resolve();
  }
}
