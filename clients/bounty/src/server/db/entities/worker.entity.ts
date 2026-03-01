import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "workers" })
export class WorkerEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 10 })
  initials!: string;

  @Column({ type: "varchar", length: 200 })
  email!: string;

  @Column({ type: "int" })
  reputation!: number;

  @Column({ type: "int", default: 0 })
  orderIndex!: number;
}
