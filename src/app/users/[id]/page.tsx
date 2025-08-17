"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ViewUser } from "@/components/dashboard/superadmin/users/viewUser";
import { useEffect, use } from "react";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

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

  return <ViewUser user={user} onLogout={logout} userId={resolvedParams.id} />;
}
