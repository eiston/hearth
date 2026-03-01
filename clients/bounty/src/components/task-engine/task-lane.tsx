import type { DragEvent } from "react";
import { Badge } from "@/components/ui/badge";
import type { Bounty, OwnerBountyLane, Worker } from "@/lib/app-types";
import { cn } from "@/lib/utils";
import { TaskEngineCard } from "./task-card";

interface TaskEngineLaneProps {
  lane: { id: OwnerBountyLane; label: string };
  index: number;
  bounties: Bounty[];
  hoverLane: OwnerBountyLane | null;
  laneIsDroppable: boolean;
  draggingBountyId: string | null;
  getPropertyLabel: (propertyId: string) => string;
  getWorker: (workerId?: string | null) => Worker | undefined;
  isBountyDraggable: (bounty: Bounty) => boolean;
  onLaneDragOver: (laneId: OwnerBountyLane, event: DragEvent<HTMLDivElement>) => void;
  onLaneDragLeave: (laneId: OwnerBountyLane) => void;
  onLaneDrop: (laneId: OwnerBountyLane, event: DragEvent<HTMLDivElement>) => void;
  onCardDragStart: (bounty: Bounty, event: DragEvent<HTMLDivElement>) => void;
  onCardDragEnd: () => void;
  onCardOpen: (bounty: Bounty) => void;
}

export function TaskEngineLane({
  lane,
  index,
  bounties,
  hoverLane,
  laneIsDroppable,
  draggingBountyId,
  getPropertyLabel,
  getWorker,
  isBountyDraggable,
  onLaneDragOver,
  onLaneDragLeave,
  onLaneDrop,
  onCardDragStart,
  onCardDragEnd,
  onCardOpen,
}: TaskEngineLaneProps) {
  return (
    <section
      className={cn(
        "flex min-h-[32rem] flex-col px-3",
        index > 0 && "border-l",
        hoverLane === lane.id && laneIsDroppable && "bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between border-b px-1 py-3">
        <h4 className="text-sm font-semibold tracking-wide uppercase">{lane.label}</h4>
        <Badge variant="secondary">{bounties.length}</Badge>
      </div>

      <div
        className="flex flex-1 flex-col gap-2.5 px-1 py-3"
        onDragOver={(event) => onLaneDragOver(lane.id, event)}
        onDragLeave={() => onLaneDragLeave(lane.id)}
        onDrop={(event) => onLaneDrop(lane.id, event)}
      >
        {bounties.map((bounty) => {
          const worker = getWorker(bounty.acceptedByWorkerId);
          const isDraggable = isBountyDraggable(bounty);
          return (
            <TaskEngineCard
              key={bounty.id}
              bounty={bounty}
              propertyLabel={getPropertyLabel(bounty.propertyId)}
              worker={worker}
              isDraggable={isDraggable}
              isDragging={draggingBountyId === bounty.id}
              onDragStart={(event) => onCardDragStart(bounty, event)}
              onDragEnd={onCardDragEnd}
              onOpen={() => onCardOpen(bounty)}
            />
          );
        })}

        {bounties.length === 0 ? (
          <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
            Drop a task here
          </div>
        ) : null}
      </div>
    </section>
  );
}
