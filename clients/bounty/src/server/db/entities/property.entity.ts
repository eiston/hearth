import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { PropertyTrustedWorkerEntity } from "@/server/db/entities/property-trusted-worker.entity";

@Entity({ name: "properties" })
export class PropertyEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id!: string;

  @Column({ type: "varchar", length: 255 })
  address!: string;

  @Column({ type: "varchar", length: 120 })
  city!: string;

  @Column({ type: "varchar", length: 30 })
  zipCode!: string;

  @Column({ type: "varchar", length: 80 })
  gateCode!: string;

  @Column({ type: "text" })
  instructions!: string;

  @Column({ type: "text" })
  image!: string;

  @Column({ type: "double precision", nullable: true })
  lat!: number | null;

  @Column({ type: "double precision", nullable: true })
  lng!: number | null;

  @Column({ type: "int", default: 0 })
  orderIndex!: number;

  @OneToMany(() => PropertyTrustedWorkerEntity, (trusted) => trusted.property)
  trustedWorkers!: PropertyTrustedWorkerEntity[];
}
