import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OwnerBountyLane } from "@/lib/app-types";

export function LaneActionButtons({
  lane,
  boosted,
  onMove,
  onDelete,
  onToggleBoost,
  backlogPrimaryLabel = "Move to Active",
  hideBacklogDelete = false,
}: {
  lane: OwnerBountyLane;
  boosted?: boolean;
  onMove: (lane: OwnerBountyLane) => void;
  onDelete: () => void;
  onToggleBoost: () => void;
  backlogPrimaryLabel?: string;
  hideBacklogDelete?: boolean;
}) {
  if (lane === "backlog") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onMove("active")}>{backlogPrimaryLabel}</Button>
        {!hideBacklogDelete ? (
          <Button size="sm" variant="destructive" onClick={onDelete}>Delete Task</Button>
        ) : null}
      </div>
    );
  }

  if (lane === "active") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onMove("in_progress")}>Start Progress</Button>
        <Button size="sm" variant="outline" onClick={() => onMove("backlog")}>Move to Backlog</Button>
        <Button size="sm" variant={boosted ? "secondary" : "default"} onClick={onToggleBoost}>
          <Sparkles className="size-3.5" />
          {boosted ? "Remove Boost" : "Boost"}
        </Button>
      </div>
    );
  }

  if (lane === "in_progress") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onMove("review")}>Send to Review</Button>
      </div>
    );
  }

  if (lane === "review") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onMove("pending_payout")}>Approve for Payout</Button>
        <Button size="sm" variant="outline" onClick={() => onMove("in_progress")}>Return to Progress</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => onMove("review")}>Move Back to Review</Button>
    </div>
  );
}
