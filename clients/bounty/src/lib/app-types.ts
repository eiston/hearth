export type Role = "owner" | "worker";

export interface Worker {
  id: string;
  name: string;
  initials: string;
  email: string;
  reputation: number;
}

export interface TrustedWorkerRef {
  id: string;
  name: string;
  initials: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  zipCode: string;
  gateCode: string;
  instructions: string;
  image: string;
  whitelistedWorkers: TrustedWorkerRef[];
  location?: {
    lat: number;
    lng: number;
  } | null;
}

export type WorkerBountyStatus = "available" | "accepted" | "pending_approval";
export type OwnerBountyLane = "backlog" | "active" | "in_progress" | "review" | "pending_payment";

export interface Bounty {
  id: string;
  title: string;
  propertyId: string;
  ownerLane: OwnerBountyLane;
  price: number;
  type: string;
  description: string;
  isNew?: boolean;
  boosted?: boolean;
  workerStatus: WorkerBountyStatus;
  acceptedByWorkerId?: string | null;
  timerSecondsRemaining: number;
  proofPhotosUploaded: number;
  tenantBridgeEnabled?: boolean;
  recursiveSchedulingEnabled?: boolean;
}

export interface TaskTemplate {
  id: string;
  label: string;
  title: string;
  description: string;
  price: number;
}

export interface WorkerTransaction {
  id: string;
  bountyId: string;
  title: string;
  propertyLabel: string;
  completedOn: string;
  amount: number;
}

export interface WorkerFinancialSummary {
  totalEarnings: number;
  pendingPayouts: number;
  jobsCompleted: number;
  earningsDeltaText: string;
  pendingJobsText: string;
  jobsCompletedDeltaText: string;
}

export interface PendingPayout {
  id: string;
  workerId: string;
  worker: string;
  email: string;
  task: string;
  amount: number;
  property: string;
}

export interface TaskReminder {
  id: string;
  title: string;
  propertiesLabel: string;
  badgeLabel: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

export interface OwnerFinancialSummary {
  totalSpentYtd: number;
}

export interface UiSettings {
  defaultCity: string;
  propertyPlaceholderImage: string;
  mapPreviewImage: string;
  noShowTimerSeconds: number;
  autoRepostDays: number;
}

export interface AppStateSnapshot {
  role: Role;
  currentWorkerId: string;
  workers: Worker[];
  properties: Property[];
  bounties: Bounty[];
  taskTemplates: TaskTemplate[];
  ownerFinancials: OwnerFinancialSummary;
  pendingPayouts: PendingPayout[];
  taskReminders: TaskReminder[];
  workerFinancialSummary: WorkerFinancialSummary;
  workerTransactions: WorkerTransaction[];
  ui: UiSettings;
}

export interface CreatePropertyInput {
  address: string;
  city: string;
  zipCode: string;
  gateCode: string;
  instructions: string;
  location?: { lat: number; lng: number } | null;
}

export interface UpdatePropertyInput {
  address: string;
  city: string;
  zipCode: string;
  gateCode: string;
}

export interface AddTrustedWorkersInputItem {
  email: string;
  name: string;
  initials: string;
}

export interface CreateBountyInput {
  propertyId: string;
  title: string;
  description: string;
  price: number;
  type: string;
  tenantBridgeEnabled: boolean;
  recursiveSchedulingEnabled: boolean;
}
