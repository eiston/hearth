import type { Bounty, OwnerBountyLane, Property, Worker } from "@/lib/app-types";

export function inferOwnerLane(bounty: Bounty): OwnerBountyLane {
  if (bounty.workerStatus === "accepted") {
    return "in_progress";
  }
  if (bounty.workerStatus === "pending_approval") {
    return "review";
  }
  return bounty.boosted ? "active" : "backlog";
}

export function statusLabel(bounty: Bounty) {
  if (bounty.workerStatus === "pending_approval") {
    return "Submitted";
  }
  if (bounty.workerStatus === "accepted") {
    return "Assigned";
  }
  return "Open";
}

export function getPropertyLabel(properties: Property[], propertyId: string) {
  const property = properties.find((item) => item.id === propertyId);
  return property?.address ?? "Unknown Property";
}

export function getWorker(workers: Worker[], workerId?: string | null) {
  return workers.find((worker) => worker.id === workerId);
}
