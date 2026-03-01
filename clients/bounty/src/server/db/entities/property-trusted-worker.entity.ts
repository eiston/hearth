import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { PropertyEntity } from "@/server/db/entities/property.entity";
import { WorkerEntity } from "@/server/db/entities/worker.entity";

@Entity({ name: "property_trusted_workers" })
export class PropertyTrustedWorkerEntity {
  @PrimaryColumn({ type: "varchar", length: 100 })
  propertyId!: string;

  @PrimaryColumn({ type: "varchar", length: 100 })
  workerId!: string;

  @ManyToOne(() => PropertyEntity, (property) => property.trustedWorkers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "propertyId" })
  property!: PropertyEntity;

  @ManyToOne(() => WorkerEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "workerId" })
  worker!: WorkerEntity;
}
