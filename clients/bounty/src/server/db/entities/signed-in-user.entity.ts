import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "signed_in_users" })
export class SignedInUserEntity {
  @PrimaryColumn({ type: "varchar", length: 200 })
  email!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
