import "reflect-metadata";
import { initialAppState } from "@/lib/mock-seed";
import { getDataSource } from "@/server/db/data-source";
import { AppMetaEntity } from "@/server/db/entities/app-meta.entity";
import { BountyEntity } from "@/server/db/entities/bounty.entity";
import { PropertyEntity } from "@/server/db/entities/property.entity";
import { PropertyTrustedWorkerEntity } from "@/server/db/entities/property-trusted-worker.entity";
import { TaskTemplateEntity } from "@/server/db/entities/task-template.entity";
import { WorkerEntity } from "@/server/db/entities/worker.entity";

async function seed() {
  const ds = await getDataSource();
  await ds.synchronize(true);

  const workerRepo = ds.getRepository(WorkerEntity);
  const propertyRepo = ds.getRepository(PropertyEntity);
  const trustedRepo = ds.getRepository(PropertyTrustedWorkerEntity);
  const bountyRepo = ds.getRepository(BountyEntity);
  const templateRepo = ds.getRepository(TaskTemplateEntity);
  const metaRepo = ds.getRepository(AppMetaEntity);

  await workerRepo.save(
    initialAppState.workers.map((worker, index) =>
      workerRepo.create({
        id: worker.id,
        name: worker.name,
        initials: worker.initials,
        email: worker.email,
        reputation: worker.reputation,
        orderIndex: index,
      }),
    ),
  );

  await propertyRepo.save(
    initialAppState.properties.map((property, index) =>
      propertyRepo.create({
        id: property.id,
        address: property.address,
        city: property.city,
        zipCode: property.zipCode,
        gateCode: property.gateCode,
        instructions: property.instructions,
        image: property.image,
        lat: property.location?.lat ?? null,
        lng: property.location?.lng ?? null,
        orderIndex: index,
      }),
    ),
  );

  const trustedLinks = initialAppState.properties.flatMap((property) =>
    property.whitelistedWorkers.map((worker) =>
      trustedRepo.create({
        propertyId: property.id,
        workerId: worker.id,
      }),
    ),
  );
  if (trustedLinks.length > 0) {
    await trustedRepo.save(trustedLinks);
  }

  await bountyRepo.save(
    initialAppState.bounties.map((bounty, index) =>
      bountyRepo.create({
        id: bounty.id,
        title: bounty.title,
        propertyId: bounty.propertyId,
        ownerLane: bounty.ownerLane,
        price: bounty.price,
        type: bounty.type,
        description: bounty.description,
        isNew: bounty.isNew ?? true,
        boosted: bounty.boosted ?? false,
        workerStatus: bounty.workerStatus,
        acceptedByWorkerId: bounty.acceptedByWorkerId ?? null,
        timerSecondsRemaining: bounty.timerSecondsRemaining,
        proofPhotosUploaded: bounty.proofPhotosUploaded,
        tenantBridgeEnabled: bounty.tenantBridgeEnabled ?? true,
        recursiveSchedulingEnabled: bounty.recursiveSchedulingEnabled ?? false,
        recurrenceCadence: bounty.recurrenceCadence ?? null,
        deadlineAt: bounty.deadlineAt ? new Date(bounty.deadlineAt) : null,
        imageUrls: bounty.imageUrls ?? [],
        orderIndex: index,
      }),
    ),
  );

  await templateRepo.save(
    initialAppState.taskTemplates.map((template, index) =>
      templateRepo.create({
        id: template.id,
        label: template.label,
        title: template.title,
        description: template.description,
        price: template.price,
        orderIndex: index,
      }),
    ),
  );

  await metaRepo.save(
    metaRepo.create({
      id: 1,
      role: initialAppState.role,
      defaultRole: initialAppState.defaultRole,
      currentWorkerId: initialAppState.currentWorkerId,
      ownerFinancials: initialAppState.ownerFinancials,
      pendingPayouts: initialAppState.pendingPayouts,
      taskReminders: initialAppState.taskReminders,
      workerFinancialSummary: initialAppState.workerFinancialSummary,
      workerTransactions: initialAppState.workerTransactions,
      ui: initialAppState.ui,
    }),
  );

  await ds.destroy();
  console.log("Seed completed.");
}

void seed().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
