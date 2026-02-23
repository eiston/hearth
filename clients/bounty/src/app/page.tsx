"use client";

import { useRole } from "@/components/role-provider";
import { OwnerDashboard } from "@/components/owner-dashboard";
import { WorkerDashboard } from "@/components/worker-dashboard";
import { useAppLoading } from "@/lib/app-state";

export default function Home() {
  const { role } = useRole();
  const loading = useAppLoading();

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading in-memory data...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      {role === "owner" ? <OwnerDashboard /> : <WorkerDashboard />}
    </div>
  );
}
