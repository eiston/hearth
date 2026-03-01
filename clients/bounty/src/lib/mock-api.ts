import type {
  AddTrustedWorkersInputItem,
  AppStateSnapshot,
  Bounty,
  CreateBountyInput,
  CreatePropertyInput,
  CreateTaskTemplateInput,
  OwnerBountyLane,
  PersonBasicInfo,
  Property,
  Role,
  TaskTemplate,
  UpdatePropertyInput,
} from "@/lib/app-types";

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const mockApi = {
  async getInitialSnapshot(): Promise<AppStateSnapshot> {
    await delay();
    return request<AppStateSnapshot>("/api/state");
  },

  async setRole(role: Role): Promise<Role> {
    await delay();
    return request<Role>("/api/role", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  },

  async setDefaultRole(role: Role): Promise<Role> {
    await delay();
    return request<Role>("/api/settings/default-role", {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async addProperty(input: CreatePropertyInput): Promise<Property> {
    await delay();
    return request<Property>("/api/properties", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateProperty(propertyId: string, input: UpdatePropertyInput): Promise<Property> {
    await delay();
    return request<Property>(`/api/properties/${propertyId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async updatePropertyInstructions(propertyId: string, instructions: string): Promise<Property> {
    await delay();
    return request<Property>(`/api/properties/${propertyId}/instructions`, {
      method: "PATCH",
      body: JSON.stringify({ instructions }),
    });
  },

  async addTrustedWorkers(propertyId: string, workers: AddTrustedWorkersInputItem[]): Promise<Property> {
    await delay();
    return request<Property>(`/api/properties/${propertyId}/trusted-workers`, {
      method: "POST",
      body: JSON.stringify({ workers }),
    });
  },

  async addGlobalTrustedWorkers(workers: AddTrustedWorkersInputItem[]): Promise<PersonBasicInfo[]> {
    await delay();
    return request<PersonBasicInfo[]>("/api/global-trusted-workers", {
      method: "POST",
      body: JSON.stringify({ workers }),
    });
  },

  async removeGlobalTrustedWorker(workerId: string): Promise<PersonBasicInfo[]> {
    await delay();
    return request<PersonBasicInfo[]>(`/api/global-trusted-workers/${workerId}`, {
      method: "DELETE",
    });
  },

  async createBounty(input: CreateBountyInput): Promise<Bounty> {
    await delay();
    return request<Bounty>("/api/bounties", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async addTaskTemplate(input: CreateTaskTemplateInput): Promise<TaskTemplate> {
    await delay();
    return request<TaskTemplate>("/api/task-templates", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async toggleBountyBoost(bountyId: string): Promise<Bounty> {
    await delay();
    return request<Bounty>(`/api/bounties/${bountyId}/boost`, {
      method: "PATCH",
    });
  },

  async deleteBounty(bountyId: string): Promise<{ id: string }> {
    await delay();
    return request<{ id: string }>(`/api/bounties/${bountyId}`, {
      method: "DELETE",
    });
  },

  async acceptBounty(bountyId: string, workerId: string): Promise<Bounty> {
    await delay();
    return request<Bounty>(`/api/bounties/${bountyId}/accept`, {
      method: "POST",
      body: JSON.stringify({ workerId }),
    });
  },

  async uploadBountyProofPhoto(bountyId: string): Promise<Bounty> {
    await delay();
    return request<Bounty>(`/api/bounties/${bountyId}/proof-photo`, {
      method: "POST",
    });
  },

  async submitBountyWork(bountyId: string): Promise<Bounty> {
    await delay();
    return request<Bounty>(`/api/bounties/${bountyId}/submit`, {
      method: "POST",
    });
  },

  async resetBountyToAvailable(bountyId: string): Promise<Bounty> {
    await delay();
    return request<Bounty>(`/api/bounties/${bountyId}/reset`, {
      method: "POST",
    });
  },

  async tickAcceptedBounties(seconds = 1): Promise<Bounty[]> {
    return request<Bounty[]>(`/api/bounties/tick`, {
      method: "POST",
      body: JSON.stringify({ seconds }),
    });
  },

  async moveBountyLane(bountyId: string, lane: OwnerBountyLane): Promise<Bounty> {
    await delay();
    return request<Bounty>(`/api/bounties/${bountyId}/lane`, {
      method: "PATCH",
      body: JSON.stringify({ lane }),
    });
  },
};
