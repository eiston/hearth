import { Column, Entity, PrimaryColumn } from "typeorm";
import type {
  OwnerFinancialSummary,
  PendingPayout,
  Role,
  TaskReminder,
  UiSettings,
  WorkerFinancialSummary,
  WorkerTransaction,
} from "@/lib/app-types";

@Entity({ name: "app_meta" })
export class AppMetaEntity {
  @PrimaryColumn({ type: "int", default: 1 })
  id!: number;

  @Column({ type: "varchar", length: 20, default: "owner" })
  role!: Role;

  @Column({ type: "varchar", length: 20, default: "owner" })
  defaultRole!: Role;

  @Column({ type: "varchar", length: 100, default: "w1" })
  currentWorkerId!: string;

  @Column({ type: "jsonb" })
  ownerFinancials!: OwnerFinancialSummary;

  @Column({ type: "jsonb" })
  pendingPayouts!: PendingPayout[];

  @Column({ type: "jsonb" })
  taskReminders!: TaskReminder[];

  @Column({ type: "jsonb" })
  workerFinancialSummary!: WorkerFinancialSummary;

  @Column({ type: "jsonb" })
  workerTransactions!: WorkerTransaction[];

  @Column({ type: "jsonb" })
  ui!: UiSettings;
}
