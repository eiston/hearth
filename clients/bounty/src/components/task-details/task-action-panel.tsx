import type { ReactNode } from "react";
import { Save, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PersonBasicInfoCard } from "@/components/person-basic-info-card";
import { AvailableWorkersSection } from "@/components/task-details/available-workers-section";
import { LaneActionButtons } from "@/components/task-details/lane-action-buttons";
import type { AvailableWorkerItem } from "@/components/task-details/types";
import type { OwnerBountyLane, Role } from "@/lib/app-types";

export function TaskActionPanel({
  lane,
  boosted,
  onMove,
  onDelete,
  onToggleBoost,
  assignedWorker,
  costDisplay,
  costDraft,
  onCostChange,
  canSavePrice,
  onSavePrice,
  pendingMove,
  moveReason,
  onMoveReasonChange,
  onCancelPendingMove,
  onConfirmPendingMove,
  expirationTimeControl,
  availableWorkers,
  viewerRole = "owner",
}: {
  lane: OwnerBountyLane;
  boosted?: boolean;
  onMove: (lane: OwnerBountyLane) => void;
  onDelete: () => void;
  onToggleBoost: () => void;
  assignedWorker?: { initials?: string; name?: string; email?: string } | null;
  costDisplay: number;
  costDraft: string;
  onCostChange: (value: string) => void;
  canSavePrice: boolean;
  onSavePrice: () => void;
  pendingMove: boolean;
  moveReason: string;
  onMoveReasonChange: (value: string) => void;
  onCancelPendingMove: () => void;
  onConfirmPendingMove: () => void;
  expirationTimeControl: ReactNode;
  availableWorkers: AvailableWorkerItem[];
  viewerRole?: Role;
}) {
  const isWorkerBacklogView = viewerRole === "worker" && lane === "backlog";
  const hideCostSection = viewerRole === "worker" && lane === "in_progress";

  return (
    <Card>
      <CardContent className="space-y-4 pt-0">
        <LaneActionButtons
          lane={lane}
          boosted={boosted}
          onMove={onMove}
          onDelete={onDelete}
          onToggleBoost={onToggleBoost}
          backlogPrimaryLabel={isWorkerBacklogView ? "Accept Task" : "Move to Active"}
          hideBacklogDelete={isWorkerBacklogView}
        />

        {isWorkerBacklogView ? expirationTimeControl : null}

        {isWorkerBacklogView ? null : (
          <>
            <PersonBasicInfoCard
              title="Assigned Worker"
              initials={assignedWorker?.initials}
              name={assignedWorker?.name ?? "Unassigned worker"}
              email={assignedWorker?.email ?? "No worker assigned"}
            />

            {hideCostSection ? null : (
              lane === "backlog" ? (
                <div className="space-y-2">
                  <Label htmlFor="task-price" className="text-sm font-medium">Cost</Label>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">$</div>
                    <Input
                      id="task-price"
                      type="number"
                      min={0}
                      step={1}
                      value={costDraft}
                      onChange={(event) => onCostChange(event.target.value)}
                    />
                    {canSavePrice ? (
                      <Button type="button" size="icon-sm" variant="outline" className="shrink-0" onClick={onSavePrice} aria-label="Save price">
                        <Save className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">Editable in backlog. (UI-only draft)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2.5">
                  <span className="text-sm text-muted-foreground">Cost</span>
                  <span className="text-sm font-semibold">${costDisplay}</span>
                </div>
              )
            )}

            {pendingMove ? (
              <div className="rounded-md border border-dashed p-3 space-y-2">
                <div className="text-xs font-medium text-foreground">Reason required to move backward</div>
                <Textarea
                  value={moveReason}
                  onChange={(event) => onMoveReasonChange(event.target.value)}
                  placeholder="Why is this task moving back?"
                  className="min-h-20"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={onCancelPendingMove}>Cancel</Button>
                  <Button size="sm" onClick={onConfirmPendingMove} disabled={!moveReason.trim()}>
                    Confirm Move
                  </Button>
                </div>
              </div>
            ) : null}

            {expirationTimeControl}

            {(lane === "backlog" || lane === "active") ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="size-4" />
                    Available Workers
                  </div>
                  <AvailableWorkersSection workers={availableWorkers} />
                </div>
              </>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
