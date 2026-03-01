import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "task_templates" })
export class TaskTemplateEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id!: string;

  @Column({ type: "varchar", length: 120 })
  label!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "int" })
  price!: number;

  @Column({ type: "int", default: 0 })
  orderIndex!: number;
}
