import type { OwnerBountyLane } from "@/lib/app-types";

export const BOARD_LANES: Array<{ id: OwnerBountyLane; label: string }> = [
  { id: "backlog", label: "Backlog" },
  { id: "active", label: "Active" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "pending_payment", label: "Pending Payment" },
];

export const DRAGGABLE_LANES: OwnerBountyLane[] = ["backlog", "active"];
