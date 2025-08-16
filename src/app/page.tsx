"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { User } from "@/backend/types/schema";

export default function HomePage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      switch (user.role) {
        case "superadmin":
          router.replace("/dashboard/superadmin");
          break;
        case "company_owner":
          router.replace("/dashboard/company");
          break;
        case "employee":
          router.replace("/dashboard/employee");
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Prevent back button for authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const handlePopState = () => {
        if (user) {
          switch (user.role) {
            case "superadmin":
              router.replace("/dashboard/superadmin");
              break;
            case "company_owner":
              router.replace("/dashboard/company");
              break;
            case "employee":
              router.replace("/dashboard/employee");
              break;
          }
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLoginSuccess = (userData: User) => {
    login(userData);
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login form for non-authenticated users
  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
