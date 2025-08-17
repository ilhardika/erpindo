"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { EditPlan } from "@/components/dashboard/superadmin/management-plans/editPlan";
import { useEffect } from "react";

interface EditPlanPageProps {
  params: {
    id: string;
  };
}

export default function EditPlanPage({ params }: EditPlanPageProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else if (user.role !== "superadmin") {
      router.push("/dashboard");
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

  if (user.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hanya superadmin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return <EditPlan user={user} onLogout={logout} planId={params.id} />;
}
