"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { PersonBasicInfoCard } from "@/components/person-basic-info-card";
import { TrustedWorkerPickerDialog } from "@/components/trusted-worker-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAppActions, useAppState } from "@/lib/app-state";

function getInitials(name: string, email: string) {
  const normalizedName = name.trim();
  if (normalizedName) {
    const parts = normalizedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }
    return normalizedName.slice(0, 2).toUpperCase();
  }
  return (email.split("@")[0] ?? email).slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const state = useAppState();
  const actions = useAppActions();
  const [isAddTrustedOpen, setIsAddTrustedOpen] = useState(false);

  const signedInUserInfo = {
    name: session?.user?.name ?? "Signed-in user",
    email: session?.user?.email ?? "No email",
    initials: getInitials(session?.user?.name ?? "", session?.user?.email ?? ""),
  };

  const addRecommendations = useMemo(() => {
    const dedup = new Map<string, { id: string; name: string; email: string; initials: string }>();

    state.workers.forEach((worker) => {
      dedup.set(worker.email.toLowerCase(), {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        initials: worker.initials,
      });
    });

    state.signedInUsers.forEach((user) => {
      dedup.set(user.email.toLowerCase(), {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      });
    });

    state.globalTrustedWorkers.forEach((worker) => {
      dedup.set(worker.email.toLowerCase(), worker);
    });

    return Array.from(dedup.values());
  }, [state.globalTrustedWorkers, state.signedInUsers, state.workers]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Saved from your Google sign-in profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonBasicInfoCard
              title="User"
              name={signedInUserInfo.name}
              email={signedInUserInfo.email}
              initials={signedInUserInfo.initials}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Mode</CardTitle>
            <CardDescription>Choose which mode opens by default.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="default-role" className="cursor-pointer text-sm font-medium">
                {state.defaultRole === "owner" ? "Owner Mode" : "Worker Mode"}
              </Label>
              <Switch
                id="default-role"
                checked={state.defaultRole === "worker"}
                onCheckedChange={(checked) => {
                  void actions.setDefaultRole(checked ? "worker" : "owner");
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">This sets the role used on next app load.</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Global Trusted Workers</CardTitle>
            <CardDescription>
              Reusable trusted workers available as recommendations in the Add Trusted Workers popup.
            </CardDescription>
          </div>
          <Badge variant="secondary">{state.globalTrustedWorkers.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.globalTrustedWorkers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No global trusted workers yet.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {state.globalTrustedWorkers.map((worker) => (
                <PersonBasicInfoCard
                  key={worker.id}
                  name={worker.name}
                  email={worker.email}
                  initials={worker.initials}
                  onRemove={() => {
                    void actions.removeGlobalTrustedWorker(worker.id);
                  }}
                  removeLabel={`Remove ${worker.name}`}
                />
              ))}
            </div>
          )}

          <Separator />

          <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAddTrustedOpen(true)}>
            + Add Trusted Workers
          </Button>
        </CardContent>
      </Card>

      <TrustedWorkerPickerDialog
        open={isAddTrustedOpen}
        onOpenChange={setIsAddTrustedOpen}
        existingEmails={state.globalTrustedWorkers.map((worker) => worker.email)}
        recommendations={addRecommendations}
        onDone={async (workers) => {
          await actions.addGlobalTrustedWorkers(workers);
        }}
      />
    </div>
  );
}
