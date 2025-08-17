"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { EditUser } from "@/components/dashboard/superadmin/users/editUser";
import { useEffect } from "react";

export default function EditUserPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <EditUser user={user} onLogout={logout} userId={userId} />;
}
