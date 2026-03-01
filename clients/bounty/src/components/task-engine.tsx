"use client";

import { useMemo, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import type { Bounty, OwnerBountyLane } from "@/lib/app-types";
import { useAppActions, useAppState } from "@/lib/app-state";
import { BOARD_LANES, DRAGGABLE_LANES } from "@/components/task-engine/board-config";
import { TaskEngineCreateBountyDialog } from "@/components/task-engine/create-bounty-dialog";
import { getPropertyLabel, getWorker, inferOwnerLane } from "@/components/task-engine/helpers";
import { TaskEngineLane } from "@/components/task-engine/task-lane";

export function TaskEngine() {
  const router = useRouter();
  const { bounties, properties, workers } = useAppState();
  const { moveBountyLane } = useAppActions();

  const [draggingBountyId, setDraggingBountyId] = useState<string | null>(null);
  const [hoverLane, setHoverLane] = useState<OwnerBountyLane | null>(null);

  const bountiesByLane = useMemo(() => {
    const grouped = Object.fromEntries(BOARD_LANES.map((lane) => [lane.id, [] as Bounty[]])) as Record<
      OwnerBountyLane,
      Bounty[]
    >;

    for (const bounty of bounties) {
      const lane = bounty.ownerLane ?? inferOwnerLane(bounty);
      grouped[lane].push(bounty);
    }

    return grouped;
  }, [bounties]);

  const isBountyDraggable = (bounty: Bounty) => {
    const lane = bounty.ownerLane ?? inferOwnerLane(bounty);
    return DRAGGABLE_LANES.includes(lane);
  };

  const handleLaneDragOver = (lane: OwnerBountyLane, event: DragEvent<HTMLDivElement>) => {
    if (!DRAGGABLE_LANES.includes(lane)) {
      return;
    }
    event.preventDefault();
    if (hoverLane !== lane) {
      setHoverLane(lane);
    }
  };

  const handleLaneDragLeave = (lane: OwnerBountyLane) => {
    if (hoverLane === lane) {
      setHoverLane(null);
    }
  };

  const handleDrop = async (lane: OwnerBountyLane, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!DRAGGABLE_LANES.includes(lane)) {
      return;
    }

    const bountyId = event.dataTransfer.getData("text/bounty-id") || draggingBountyId;
    setHoverLane(null);
    setDraggingBountyId(null);

    if (!bountyId) {
      return;
    }

    const bounty = bounties.find((item) => item.id === bountyId);
    if (!bounty || (bounty.ownerLane ?? inferOwnerLane(bounty)) === lane) {
      return;
    }

    await moveBountyLane(bountyId, lane);
  };

  const handleCardDragStart = (bounty: Bounty, event: DragEvent<HTMLDivElement>) => {
    if (!isBountyDraggable(bounty)) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/bounty-id", bounty.id);
    event.dataTransfer.effectAllowed = "move";
    setDraggingBountyId(bounty.id);
  };

  const handleCardDragEnd = () => {
    setDraggingBountyId(null);
    setHoverLane(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Bounty Engine</h3>
          <p className="text-sm text-muted-foreground">Kanban workflow for dispatch, execution, review, and payout.</p>
        </div>

        <TaskEngineCreateBountyDialog />
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1200px] grid-cols-5 gap-0 align-start">
          {BOARD_LANES.map((lane, index) => (
            <TaskEngineLane
              key={lane.id}
              lane={lane}
              index={index}
              bounties={bountiesByLane[lane.id]}
              hoverLane={hoverLane}
              laneIsDroppable={DRAGGABLE_LANES.includes(lane.id)}
              draggingBountyId={draggingBountyId}
              getPropertyLabel={(propertyId) => getPropertyLabel(properties, propertyId)}
              getWorker={(workerId) => getWorker(workers, workerId)}
              isBountyDraggable={isBountyDraggable}
              onLaneDragOver={handleLaneDragOver}
              onLaneDragLeave={handleLaneDragLeave}
              onLaneDrop={(laneId, event) => {
                void handleDrop(laneId, event);
              }}
              onCardDragStart={handleCardDragStart}
              onCardDragEnd={handleCardDragEnd}
              onCardOpen={(bounty) => router.push(`/tasks/${bounty.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
