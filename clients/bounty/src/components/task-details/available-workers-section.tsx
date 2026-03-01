import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { AvailableWorkerItem } from "@/components/task-details/types";

export function AvailableWorkersSection({ workers }: { workers: AvailableWorkerItem[] }) {
  if (workers.length === 0) {
    return <p className="text-sm text-muted-foreground">No workers available for this property yet.</p>;
  }

  return (
    <>
      {workers.map((worker) => (
        <div key={worker.id} className="flex items-center justify-between rounded-md border p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{worker.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{worker.name}</div>
              <div className="truncate text-xs text-muted-foreground">{worker.email ?? "No email"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {worker.trusted ? <Badge variant="outline" className="text-[10px]">Trusted</Badge> : null}
            {typeof worker.reputation === "number" ? (
              <Badge variant="secondary" className="text-[10px]">Rep {worker.reputation}</Badge>
            ) : null}
          </div>
        </div>
      ))}
    </>
  );
}
