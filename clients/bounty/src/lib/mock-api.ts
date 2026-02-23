import {
  type AddTrustedWorkersInputItem,
  type AppStateSnapshot,
  type CreateBountyInput,
  type OwnerBountyLane,
  type CreatePropertyInput,
  type Property,
  type Role,
  type UpdatePropertyInput,
} from "@/lib/app-types";
import { initialAppState } from "@/lib/mock-seed";

const db: AppStateSnapshot = structuredClone(initialAppState);

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T,>(value: T): T => structuredClone(value);

function findProperty(propertyId: string) {
  return db.properties.find((property) => property.id === propertyId);
}

export const mockApi = {
  async getInitialSnapshot(): Promise<AppStateSnapshot> {
    await delay();
    return clone(db);
  },

  async setRole(role: Role): Promise<Role> {
    await delay();
    db.role = role;
    return db.role;
  },

  async addProperty(input: CreatePropertyInput): Promise<Property> {
    await delay();
    const property: Property = {
      id: `p-${Date.now()}`,
      address: input.address,
      city: input.city,
      zipCode: input.zipCode,
      gateCode: input.gateCode || "No gate",
      instructions: input.instructions,
      image: db.ui.propertyPlaceholderImage,
      whitelistedWorkers: [],
      location: input.location ?? null,
    };
    db.properties = [property, ...db.properties];
    return clone(property);
  },

  async updateProperty(propertyId: string, input: UpdatePropertyInput): Promise<Property> {
    await delay();
    const property = findProperty(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    Object.assign(property, input);
    return clone(property);
  },

  async updatePropertyInstructions(propertyId: string, instructions: string): Promise<Property> {
    await delay();
    const property = findProperty(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    property.instructions = instructions;
    return clone(property);
  },

  async addTrustedWorkers(propertyId: string, workers: AddTrustedWorkersInputItem[]): Promise<Property> {
    await delay();
    const property = findProperty(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    const existingNameSet = new Set(
      property.whitelistedWorkers.map((worker) => worker.name.trim().toLowerCase()),
    );

    const additions = workers
      .map((worker, index) => ({
        id: `tw-${Date.now()}-${index}`,
        name: worker.name.trim() || worker.email.trim().toLowerCase(),
        initials: worker.initials.trim().slice(0, 2).toUpperCase() || "TW",
      }))
      .filter((worker) => {
        const key = worker.name.trim().toLowerCase();
        if (existingNameSet.has(key)) {
          return false;
        }
        existingNameSet.add(key);
        return true;
      });

    property.whitelistedWorkers = [...property.whitelistedWorkers, ...additions];
    return clone(property);
  },

  async createBounty(input: CreateBountyInput) {
    await delay();
    const bounty = {
      id: `bounty-${Date.now()}`,
      title: input.title,
      propertyId: input.propertyId,
      ownerLane: "backlog" as const,
      price: input.price,
      type: input.type,
      description: input.description,
      isNew: true,
      boosted: false,
      workerStatus: "available" as const,
      acceptedByWorkerId: null,
      timerSecondsRemaining: db.ui.noShowTimerSeconds,
      proofPhotosUploaded: 0,
      tenantBridgeEnabled: input.tenantBridgeEnabled,
      recursiveSchedulingEnabled: input.recursiveSchedulingEnabled,
    };
    db.bounties = [bounty, ...db.bounties];
    return clone(bounty);
  },

  async toggleBountyBoost(bountyId: string) {
    await delay();
    const bounty = db.bounties.find((item) => item.id === bountyId);
    if (!bounty) {
      throw new Error("Bounty not found");
    }
    if (bounty.workerStatus !== "available") {
      return clone(bounty);
    }
    if (bounty.boosted) {
      bounty.boosted = false;
      bounty.price = Math.round(bounty.price / 1.5);
    } else {
      bounty.boosted = true;
      bounty.price = Math.round(bounty.price * 1.5);
    }
    return clone(bounty);
  },

  async deleteBounty(bountyId: string): Promise<{ id: string }> {
    await delay();
    db.bounties = db.bounties.filter((item) => item.id !== bountyId);
    return { id: bountyId };
  },

  async acceptBounty(bountyId: string, workerId: string) {
    await delay();
    const bounty = db.bounties.find((item) => item.id === bountyId);
    if (!bounty) {
      throw new Error("Bounty not found");
    }
    bounty.workerStatus = "accepted";
    bounty.ownerLane = "in_progress";
    bounty.acceptedByWorkerId = workerId;
    bounty.timerSecondsRemaining = db.ui.noShowTimerSeconds;
    bounty.proofPhotosUploaded = 0;
    bounty.isNew = false;
    return clone(bounty);
  },

  async uploadBountyProofPhoto(bountyId: string) {
    await delay();
    const bounty = db.bounties.find((item) => item.id === bountyId);
    if (!bounty) {
      throw new Error("Bounty not found");
    }
    bounty.proofPhotosUploaded = Math.min(2, bounty.proofPhotosUploaded + 1);
    return clone(bounty);
  },

  async submitBountyWork(bountyId: string) {
    await delay();
    const bounty = db.bounties.find((item) => item.id === bountyId);
    if (!bounty) {
      throw new Error("Bounty not found");
    }
    bounty.workerStatus = "pending_approval";
    bounty.ownerLane = "review";
    bounty.timerSecondsRemaining = 0;
    bounty.proofPhotosUploaded = Math.max(2, bounty.proofPhotosUploaded);
    return clone(bounty);
  },

  async resetBountyToAvailable(bountyId: string) {
    await delay();
    const bounty = db.bounties.find((item) => item.id === bountyId);
    if (!bounty) {
      throw new Error("Bounty not found");
    }
    bounty.workerStatus = "available";
    bounty.ownerLane = "active";
    bounty.acceptedByWorkerId = null;
    bounty.timerSecondsRemaining = db.ui.noShowTimerSeconds;
    bounty.proofPhotosUploaded = 0;
    return clone(bounty);
  },

  async tickAcceptedBounties(seconds = 1) {
    db.bounties = db.bounties.map((bounty) => {
      if (bounty.workerStatus !== "accepted" || bounty.timerSecondsRemaining <= 0) {
        return bounty;
      }
      return {
        ...bounty,
        timerSecondsRemaining: Math.max(0, bounty.timerSecondsRemaining - seconds),
      };
    });
    return clone(db.bounties);
  },

  async moveBountyLane(bountyId: string, lane: OwnerBountyLane) {
    await delay();
    const bounty = db.bounties.find((item) => item.id === bountyId);
    if (!bounty) {
      throw new Error("Bounty not found");
    }
    bounty.ownerLane = lane;
    return clone(bounty);
  },
};
