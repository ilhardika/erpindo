"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, LockKeyhole, LogIn } from "lucide-react";
import { UserRole } from "@/backend/types/enums";
import { User } from "@/backend/types/schema";
import { AuthService } from "@/backend/services/auth";

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!credentials.email || !credentials.password) {
      setError("Email dan kata sandi harus diisi");
      return;
    }

    if (!validateEmail(credentials.email)) {
      setError("Format email tidak valid");
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.login(
        credentials.email,
        credentials.password
      );

      if (!result) {
        setError("Email atau kata sandi tidak valid");
        return;
      }

      // Store user in auth context and redirect
      login(result.user);

      // Redirect to dashboard - content will be role-specific
      router.push("/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Sistem ERP Indonesia
          </CardTitle>
          <p className="text-muted-foreground">Masuk ke akun Anda</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Kata Sandi
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan kata sandi Anda"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sedang Masuk..." : "Masuk ke Sistem"}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Akun Demo:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCredentials({
                    email: "superadmin@erpindo.com",
                    password: "super123",
                  });
                }}
                className="text-xs"
              >
                Demo Superadmin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCredentials({
                    email: "owner@teknologimaju.com",
                    password: "owner123",
                  });
                }}
                className="text-xs"
              >
                Demo Pemilik Perusahaan
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCredentials({
                    email: "jane.smith@teknologimaju.com",
                    password: "emp123",
                  });
                }}
                className="text-xs"
              >
                Demo Karyawan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
