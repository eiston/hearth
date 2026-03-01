import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "global_trusted_workers" })
export class GlobalTrustedWorkerEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 200, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 10 })
  initials!: string;

  @Column({ type: "int", default: 0 })
  orderIndex!: number;
}
