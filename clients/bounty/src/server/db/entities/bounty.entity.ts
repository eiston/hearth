import { Column, Entity, PrimaryColumn } from "typeorm";
import type { OwnerBountyLane, WorkerBountyStatus } from "@/lib/app-types";

@Entity({ name: "bounties" })
export class BountyEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "varchar", length: 100 })
  propertyId!: string;

  @Column({ type: "varchar", length: 30 })
  ownerLane!: OwnerBountyLane;

  @Column({ type: "int" })
  price!: number;

  @Column({ type: "varchar", length: 80 })
  type!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "boolean", default: true })
  isNew!: boolean;

  @Column({ type: "boolean", default: false })
  boosted!: boolean;

  @Column({ type: "varchar", length: 30 })
  workerStatus!: WorkerBountyStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  acceptedByWorkerId!: string | null;

  @Column({ type: "int", default: 0 })
  timerSecondsRemaining!: number;

  @Column({ type: "int", default: 0 })
  proofPhotosUploaded!: number;

  @Column({ type: "boolean", default: true })
  tenantBridgeEnabled!: boolean;

  @Column({ type: "boolean", default: false })
  recursiveSchedulingEnabled!: boolean;

  @Column({ type: "varchar", length: 20, nullable: true })
  recurrenceCadence!: "daily" | "weekly" | "biweekly" | "monthly" | null;

  @Column({ type: "timestamptz", nullable: true })
  deadlineAt!: Date | null;

  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  imageUrls!: string[];

  @Column({ type: "int", default: 0 })
  orderIndex!: number;
}
