import type {
  AddTrustedWorkersInputItem,
  AppStateSnapshot,
  Bounty,
  PersonBasicInfo,
  CreateBountyInput,
  CreatePropertyInput,
  CreateTaskTemplateInput,
  OwnerBountyLane,
  Property,
  Role,
  UpdatePropertyInput,
} from "@/lib/app-types";
import { initialAppState } from "@/lib/mock-seed";
import { getDataSource } from "@/server/db/data-source";
import { AppMetaEntity } from "@/server/db/entities/app-meta.entity";
import { BountyEntity } from "@/server/db/entities/bounty.entity";
import { GlobalTrustedWorkerEntity } from "@/server/db/entities/global-trusted-worker.entity";
import { PropertyEntity } from "@/server/db/entities/property.entity";
import { PropertyTrustedWorkerEntity } from "@/server/db/entities/property-trusted-worker.entity";
import { SignedInUserEntity } from "@/server/db/entities/signed-in-user.entity";
import { TaskTemplateEntity } from "@/server/db/entities/task-template.entity";
import { WorkerEntity } from "@/server/db/entities/worker.entity";
import { In } from "typeorm";

let idSequence = 0;

function nextId(prefix: string) {
  idSequence += 1;
  return `${prefix}-${Date.now()}-${idSequence}`;
}

function toPersonBasicInfo(input: { id: string; name: string; email: string; initials?: string }): PersonBasicInfo {
  const name = input.name.trim() || input.email.trim().toLowerCase();
  const initials = (input.initials?.trim() || name.slice(0, 2)).slice(0, 2).toUpperCase();
  return {
    id: input.id,
    name,
    email: input.email.trim().toLowerCase(),
    initials,
  };
}

function toProperty(entity: PropertyEntity, trustedWorkers: WorkerEntity[]): Property {
  return {
    id: entity.id,
    address: entity.address,
    city: entity.city,
    zipCode: entity.zipCode,
    gateCode: entity.gateCode,
    instructions: entity.instructions,
    image: entity.image,
    location: entity.lat !== null && entity.lng !== null ? { lat: entity.lat, lng: entity.lng } : null,
    whitelistedWorkers: trustedWorkers.map((worker) => ({
      id: worker.id,
      name: worker.name,
      initials: worker.initials,
    })),
  };
}

function toBounty(entity: BountyEntity): Bounty {
  return {
    id: entity.id,
    title: entity.title,
    propertyId: entity.propertyId,
    ownerLane: entity.ownerLane,
    price: entity.price,
    type: entity.type,
    description: entity.description,
    isNew: entity.isNew,
    boosted: entity.boosted,
    workerStatus: entity.workerStatus,
    acceptedByWorkerId: entity.acceptedByWorkerId,
    timerSecondsRemaining: entity.timerSecondsRemaining,
    proofPhotosUploaded: entity.proofPhotosUploaded,
    tenantBridgeEnabled: entity.tenantBridgeEnabled,
    recursiveSchedulingEnabled: entity.recursiveSchedulingEnabled,
    recurrenceCadence: entity.recurrenceCadence,
    deadlineAt: entity.deadlineAt ? entity.deadlineAt.toISOString() : null,
    imageUrls: entity.imageUrls ?? [],
  };
}

async function ensureAppMeta() {
  const ds = await getDataSource();
  const metaRepo = ds.getRepository(AppMetaEntity);
  let meta = await metaRepo.findOneBy({ id: 1 });

  if (!meta) {
    meta = metaRepo.create({
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
    });
    await metaRepo.save(meta);
  } else if (!meta.defaultRole) {
    meta.defaultRole = initialAppState.defaultRole;
    await metaRepo.save(meta);
  }

  return meta;
}

async function getTopOrderIndex<T extends { orderIndex: number }>(rows: T[]) {
  if (rows.length === 0) {
    return 0;
  }
  return Math.min(...rows.map((row) => row.orderIndex)) - 1;
}

export async function getSnapshot(): Promise<AppStateSnapshot> {
  const ds = await getDataSource();
  const meta = await ensureAppMeta();

  const [workers, properties, trustedLinks, bounties, taskTemplates, signedInUsers, globalTrustedWorkers] = await Promise.all([
    ds.getRepository(WorkerEntity).find({ order: { orderIndex: "ASC" } }),
    ds.getRepository(PropertyEntity).find({ order: { orderIndex: "ASC" } }),
    ds.getRepository(PropertyTrustedWorkerEntity).find(),
    ds.getRepository(BountyEntity).find({ order: { orderIndex: "ASC" } }),
    ds.getRepository(TaskTemplateEntity).find({ order: { orderIndex: "ASC" } }),
    ds.getRepository(SignedInUserEntity).find({ order: { updatedAt: "DESC" } }),
    ds.getRepository(GlobalTrustedWorkerEntity).find({ order: { orderIndex: "ASC" } }),
  ]);

  const workersById = new Map(workers.map((worker) => [worker.id, worker]));

  const trustedByPropertyId = new Map<string, WorkerEntity[]>();
  trustedLinks.forEach((link) => {
    const worker = workersById.get(link.workerId);
    if (!worker) {
      return;
    }
    const current = trustedByPropertyId.get(link.propertyId) ?? [];
    current.push(worker);
    trustedByPropertyId.set(link.propertyId, current);
  });

  return {
    role: meta.role,
    defaultRole: meta.defaultRole,
    currentWorkerId: meta.currentWorkerId,
    workers: workers.map((worker) => ({
      id: worker.id,
      name: worker.name,
      initials: worker.initials,
      email: worker.email,
      reputation: worker.reputation,
    })),
    signedInUsers: signedInUsers.map((user) =>
      toPersonBasicInfo({
        id: user.email,
        name: user.name,
        email: user.email,
      }),
    ),
    globalTrustedWorkers: globalTrustedWorkers.map((worker) =>
      toPersonBasicInfo({
        id: worker.id,
        name: worker.name,
        email: worker.email,
        initials: worker.initials,
      }),
    ),
    properties: properties.map((property) => toProperty(property, trustedByPropertyId.get(property.id) ?? [])),
    bounties: bounties.map(toBounty),
    taskTemplates: taskTemplates.map((template) => ({
      id: template.id,
      label: template.label,
      title: template.title,
      description: template.description,
      price: template.price,
    })),
    ownerFinancials: meta.ownerFinancials,
    pendingPayouts: meta.pendingPayouts,
    taskReminders: meta.taskReminders,
    workerFinancialSummary: meta.workerFinancialSummary,
    workerTransactions: meta.workerTransactions,
    ui: meta.ui,
  };
}

export async function setRole(role: Role) {
  const ds = await getDataSource();
  const metaRepo = ds.getRepository(AppMetaEntity);
  const meta = await ensureAppMeta();
  meta.role = role;
  await metaRepo.save(meta);
  return meta.role;
}

export async function setDefaultRole(role: Role) {
  const ds = await getDataSource();
  const metaRepo = ds.getRepository(AppMetaEntity);
  const meta = await ensureAppMeta();
  meta.defaultRole = role;
  await metaRepo.save(meta);
  return meta.defaultRole;
}

export async function upsertSignedInUser(name: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return;
  }

  const normalizedName = name.trim() || normalizedEmail;
  const ds = await getDataSource();
  const signedInUserRepo = ds.getRepository(SignedInUserEntity);
  const existing = await signedInUserRepo.findOneBy({ email: normalizedEmail });

  if (existing) {
    existing.name = normalizedName;
    await signedInUserRepo.save(existing);
    return;
  }

  const newUser = signedInUserRepo.create({
    email: normalizedEmail,
    name: normalizedName,
  });
  await signedInUserRepo.save(newUser);
}

export async function addGlobalTrustedWorkers(workers: AddTrustedWorkersInputItem[]) {
  const ds = await getDataSource();
  const trustedRepo = ds.getRepository(GlobalTrustedWorkerEntity);
  const existing = await trustedRepo.find({ order: { orderIndex: "ASC" } });
  const existingByEmail = new Map(existing.map((row) => [row.email.toLowerCase(), row]));

  for (let index = 0; index < workers.length; index += 1) {
    const incoming = workers[index];
    const normalizedEmail = incoming.email.trim().toLowerCase();
    if (!normalizedEmail || existingByEmail.has(normalizedEmail)) {
      continue;
    }

    const normalizedName = incoming.name.trim() || normalizedEmail;
    const normalizedInitials = incoming.initials.trim().slice(0, 2).toUpperCase() || normalizedName.slice(0, 2).toUpperCase();

    const trustedWorker = trustedRepo.create({
      id: nextId("gtw"),
      name: normalizedName,
      email: normalizedEmail,
      initials: normalizedInitials,
      orderIndex: await getTopOrderIndex(existing) - index,
    });
    const saved = await trustedRepo.save(trustedWorker);
    existingByEmail.set(saved.email.toLowerCase(), saved);
    existing.unshift(saved);
  }

  const refreshed = await trustedRepo.find({ order: { orderIndex: "ASC" } });
  return refreshed.map((worker) =>
    toPersonBasicInfo({
      id: worker.id,
      name: worker.name,
      email: worker.email,
      initials: worker.initials,
    }),
  );
}

export async function removeGlobalTrustedWorker(workerId: string) {
  const ds = await getDataSource();
  const trustedRepo = ds.getRepository(GlobalTrustedWorkerEntity);
  await trustedRepo.delete({ id: workerId });
  const refreshed = await trustedRepo.find({ order: { orderIndex: "ASC" } });
  return refreshed.map((worker) =>
    toPersonBasicInfo({
      id: worker.id,
      name: worker.name,
      email: worker.email,
      initials: worker.initials,
    }),
  );
}

export async function addProperty(input: CreatePropertyInput) {
  const ds = await getDataSource();
  const propertyRepo = ds.getRepository(PropertyEntity);
  const properties = await propertyRepo.find();

  const property = propertyRepo.create({
    id: `p-${Date.now()}`,
    address: input.address,
    city: input.city,
    zipCode: input.zipCode,
    gateCode: input.gateCode || "No gate",
    instructions: input.instructions,
    image: initialAppState.ui.propertyPlaceholderImage,
    lat: input.location?.lat ?? null,
    lng: input.location?.lng ?? null,
    orderIndex: await getTopOrderIndex(properties),
  });

  const saved = await propertyRepo.save(property);
  return toProperty(saved, []);
}

async function findPropertyOrThrow(propertyId: string) {
  const ds = await getDataSource();
  const property = await ds.getRepository(PropertyEntity).findOneBy({ id: propertyId });
  if (!property) {
    throw new Error("Property not found");
  }
  return property;
}

export async function updateProperty(propertyId: string, input: UpdatePropertyInput) {
  const ds = await getDataSource();
  const propertyRepo = ds.getRepository(PropertyEntity);
  const trustedRepo = ds.getRepository(PropertyTrustedWorkerEntity);
  const workerRepo = ds.getRepository(WorkerEntity);

  const property = await findPropertyOrThrow(propertyId);
  property.address = input.address;
  property.city = input.city;
  property.zipCode = input.zipCode;
  property.gateCode = input.gateCode;

  await propertyRepo.save(property);

  const trusted = await trustedRepo.findBy({ propertyId });
  const trustedWorkers = trusted.length
    ? await workerRepo.findBy({ id: In(trusted.map((row) => row.workerId)) })
    : [];

  return toProperty(property, trustedWorkers);
}

export async function updatePropertyInstructions(propertyId: string, instructions: string) {
  const ds = await getDataSource();
  const propertyRepo = ds.getRepository(PropertyEntity);
  const trustedRepo = ds.getRepository(PropertyTrustedWorkerEntity);
  const workerRepo = ds.getRepository(WorkerEntity);

  const property = await findPropertyOrThrow(propertyId);
  property.instructions = instructions;
  await propertyRepo.save(property);

  const trusted = await trustedRepo.findBy({ propertyId });
  const trustedWorkers = trusted.length
    ? await workerRepo.findBy({ id: In(trusted.map((row) => row.workerId)) })
    : [];

  return toProperty(property, trustedWorkers);
}

export async function addTrustedWorkers(propertyId: string, workers: AddTrustedWorkersInputItem[]) {
  const ds = await getDataSource();
  const propertyRepo = ds.getRepository(PropertyEntity);
  const workerRepo = ds.getRepository(WorkerEntity);
  const trustedRepo = ds.getRepository(PropertyTrustedWorkerEntity);

  const property = await propertyRepo.findOneBy({ id: propertyId });
  if (!property) {
    throw new Error("Property not found");
  }

  const existingLinks = await trustedRepo.findBy({ propertyId });
  const existingWorkers = existingLinks.length
    ? await workerRepo.findBy({ id: In(existingLinks.map((link) => link.workerId)) })
    : [];
  const existingNameSet = new Set(existingWorkers.map((worker) => worker.name.trim().toLowerCase()));

  for (let index = 0; index < workers.length; index += 1) {
    const incoming = workers[index];
    const normalizedName = incoming.name.trim() || incoming.email.trim().toLowerCase();
    const nameKey = normalizedName.toLowerCase();

    if (existingNameSet.has(nameKey)) {
      continue;
    }

    existingNameSet.add(nameKey);
    const workerId = `tw-${Date.now()}-${index}`;
    const newWorker = workerRepo.create({
      id: workerId,
      name: normalizedName,
      initials: incoming.initials.trim().slice(0, 2).toUpperCase() || "TW",
      email: incoming.email.trim().toLowerCase(),
      reputation: 0,
      orderIndex: 10_000 + index,
    });
    await workerRepo.save(newWorker);

    const link = trustedRepo.create({ propertyId, workerId });
    await trustedRepo.save(link);
  }

  const refreshedLinks = await trustedRepo.findBy({ propertyId });
  const trustedWorkers = refreshedLinks.length
    ? await workerRepo.findBy({ id: In(refreshedLinks.map((link) => link.workerId)) })
    : [];

  return toProperty(property, trustedWorkers);
}

async function findBountyOrThrow(bountyId: string) {
  const ds = await getDataSource();
  const bounty = await ds.getRepository(BountyEntity).findOneBy({ id: bountyId });
  if (!bounty) {
    throw new Error("Bounty not found");
  }
  return bounty;
}

export async function createBounty(input: CreateBountyInput) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);
  const bounties = await bountyRepo.find();

  const bounty = bountyRepo.create({
    id: nextId("bounty"),
    title: input.title,
    propertyId: input.propertyId,
    ownerLane: "backlog",
    price: input.price,
    type: input.type,
    description: input.description,
    isNew: true,
    boosted: false,
    workerStatus: "available",
    acceptedByWorkerId: null,
    timerSecondsRemaining: initialAppState.ui.noShowTimerSeconds,
    proofPhotosUploaded: 0,
    tenantBridgeEnabled: input.tenantBridgeEnabled,
    recursiveSchedulingEnabled: input.recursiveSchedulingEnabled,
    recurrenceCadence: input.recurrenceCadence ?? null,
    deadlineAt: input.deadlineAt ? new Date(input.deadlineAt) : null,
    imageUrls: input.imageUrls ?? [],
    orderIndex: await getTopOrderIndex(bounties),
  });

  const saved = await bountyRepo.save(bounty);
  return toBounty(saved);
}

export async function addTaskTemplate(input: CreateTaskTemplateInput) {
  const ds = await getDataSource();
  const templateRepo = ds.getRepository(TaskTemplateEntity);
  const templates = await templateRepo.find();

  const template = templateRepo.create({
    id: nextId("template"),
    label: input.label,
    title: input.title,
    description: input.description,
    price: input.price,
    orderIndex: await getTopOrderIndex(templates),
  });

  return templateRepo.save(template);
}

export async function toggleBountyBoost(bountyId: string) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);

  const bounty = await findBountyOrThrow(bountyId);

  if (bounty.workerStatus !== "available") {
    return toBounty(bounty);
  }

  if (bounty.boosted) {
    bounty.boosted = false;
    bounty.price = Math.round(bounty.price / 1.5);
  } else {
    bounty.boosted = true;
    bounty.price = Math.round(bounty.price * 1.5);
  }

  await bountyRepo.save(bounty);
  return toBounty(bounty);
}

export async function deleteBounty(bountyId: string) {
  const ds = await getDataSource();
  await ds.getRepository(BountyEntity).delete({ id: bountyId });
  return { id: bountyId };
}

export async function acceptBounty(bountyId: string, workerId: string) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);

  const bounty = await findBountyOrThrow(bountyId);
  bounty.workerStatus = "accepted";
  bounty.ownerLane = "in_progress";
  bounty.acceptedByWorkerId = workerId;
  bounty.timerSecondsRemaining = initialAppState.ui.noShowTimerSeconds;
  bounty.proofPhotosUploaded = 0;
  bounty.isNew = false;

  await bountyRepo.save(bounty);
  return toBounty(bounty);
}

export async function uploadBountyProofPhoto(bountyId: string) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);

  const bounty = await findBountyOrThrow(bountyId);
  bounty.proofPhotosUploaded = Math.min(2, bounty.proofPhotosUploaded + 1);

  await bountyRepo.save(bounty);
  return toBounty(bounty);
}

export async function submitBountyWork(bountyId: string) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);

  const bounty = await findBountyOrThrow(bountyId);
  bounty.workerStatus = "pending_approval";
  bounty.ownerLane = "review";
  bounty.timerSecondsRemaining = 0;
  bounty.proofPhotosUploaded = Math.max(2, bounty.proofPhotosUploaded);

  await bountyRepo.save(bounty);
  return toBounty(bounty);
}

export async function resetBountyToAvailable(bountyId: string) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);

  const bounty = await findBountyOrThrow(bountyId);
  bounty.workerStatus = "available";
  bounty.ownerLane = "active";
  bounty.acceptedByWorkerId = null;
  bounty.timerSecondsRemaining = initialAppState.ui.noShowTimerSeconds;
  bounty.proofPhotosUploaded = 0;

  await bountyRepo.save(bounty);
  return toBounty(bounty);
}

export async function tickAcceptedBounties(seconds = 1) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);
  const bounties = await bountyRepo.find();

  for (const bounty of bounties) {
    if (bounty.workerStatus !== "accepted" || bounty.timerSecondsRemaining <= 0) {
      continue;
    }
    bounty.timerSecondsRemaining = Math.max(0, bounty.timerSecondsRemaining - seconds);
    await bountyRepo.save(bounty);
  }

  const updated = await bountyRepo.find({ order: { orderIndex: "ASC" } });
  return updated.map(toBounty);
}

export async function moveBountyLane(bountyId: string, lane: OwnerBountyLane) {
  const ds = await getDataSource();
  const bountyRepo = ds.getRepository(BountyEntity);

  const bounty = await findBountyOrThrow(bountyId);
  bounty.ownerLane = lane;

  await bountyRepo.save(bounty);
  return toBounty(bounty);
}
