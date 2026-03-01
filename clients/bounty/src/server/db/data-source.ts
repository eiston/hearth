import "reflect-metadata";
import { DataSource } from "typeorm";
import { AppMetaEntity } from "@/server/db/entities/app-meta.entity";
import { BountyEntity } from "@/server/db/entities/bounty.entity";
import { GlobalTrustedWorkerEntity } from "@/server/db/entities/global-trusted-worker.entity";
import { PropertyEntity } from "@/server/db/entities/property.entity";
import { PropertyTrustedWorkerEntity } from "@/server/db/entities/property-trusted-worker.entity";
import { SignedInUserEntity } from "@/server/db/entities/signed-in-user.entity";
import { TaskTemplateEntity } from "@/server/db/entities/task-template.entity";
import { WorkerEntity } from "@/server/db/entities/worker.entity";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/bounty_local";

declare global {
  var __bountyDataSource: DataSource | undefined;
}

export const appDataSource =
  global.__bountyDataSource ??
  new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [
      AppMetaEntity,
      WorkerEntity,
      PropertyEntity,
      PropertyTrustedWorkerEntity,
      SignedInUserEntity,
      GlobalTrustedWorkerEntity,
      BountyEntity,
      TaskTemplateEntity,
    ],
    synchronize: true,
    logging: false,
  });

if (process.env.NODE_ENV !== "production") {
  global.__bountyDataSource = appDataSource;
}

let initPromise: Promise<DataSource> | null = null;

export async function getDataSource() {
  if (appDataSource.isInitialized) {
    return appDataSource;
  }

  if (!initPromise) {
    initPromise = appDataSource.initialize();
  }

  return initPromise;
}
