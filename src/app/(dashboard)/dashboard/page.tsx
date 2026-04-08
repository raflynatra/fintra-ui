"use client";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout", {});
    } finally {
      useAuthStore.getState().logout();
      router.push("/login");
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default Dashboard;
