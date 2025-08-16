import React, { createContext, useContext, useState } from 'react';
import { mockAuth } from '../../backend/erpMockData';
import { UserRole } from '../../backend/enums';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email and password
      const foundUser = Object.values(mockAuth).find(
        u => u.email === credentials.email && u.password === credentials.password
      );
      
      if (foundUser) {
        setUser(foundUser);
        return { success: true, user: foundUser };
      } else {
        throw new Error('Email atau kata sandi tidak valid');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    let userData;
    switch (role) {
      case UserRole.SUPERADMIN:
        userData = mockAuth.superadmin;
        break;
      case UserRole.COMPANY_OWNER:
        userData = mockAuth.companyOwner;
        break;
      case UserRole.EMPLOYEE:
        userData = mockAuth.employee;
        break;
      default:
        throw new Error('Invalid role');
    }
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    quickLogin,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};