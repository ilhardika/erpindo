import { User, LoginCredentials } from '../types/schema';
import { mockAuthData } from '../data/erpMockData';

export class AuthService {
  static async validateCredentials(email: string, password: string): Promise<User | null> {
    const demoUser = mockAuthData.demoCredentials.find(
      user => user.email === email && user.password === password
    );

    if (!demoUser) {
      return null;
    }

    return {
      id: `user-${Date.now()}`,
      email: demoUser.email,
      name: demoUser.name,
      role: demoUser.role,
      companyId: demoUser.companyId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
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