"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AddTrustedWorkersInputItem,
  AppStateSnapshot,
  Bounty,
  CreateBountyInput,
  CreatePropertyInput,
  CreateTaskTemplateInput,
  OwnerBountyLane,
  Property,
  Role,
  TaskTemplate,
  UpdatePropertyInput,
} from "@/lib/app-types";
import { mockApi } from "@/lib/mock-api";
import { initialAppState } from "@/lib/mock-seed";

type AppAction =
  | { type: "hydrate"; snapshot: AppStateSnapshot }
  | { type: "setRole"; role: Role }
  | { type: "setDefaultRole"; role: Role }
  | { type: "setGlobalTrustedWorkers"; workers: AppStateSnapshot["globalTrustedWorkers"] }
  | { type: "upsertProperty"; property: Property }
  | { type: "addProperty"; property: Property }
  | { type: "upsertBounty"; bounty: Bounty }
  | { type: "removeBounty"; bountyId: string }
  | { type: "setBounties"; bounties: Bounty[] }
  | { type: "addTaskTemplate"; taskTemplate: TaskTemplate };

function appReducer(state: AppStateSnapshot | null, action: AppAction): AppStateSnapshot | null {
  if (action.type === "hydrate") {
    return action.snapshot;
  }

  if (!state) {
    return state;
  }

  switch (action.type) {
    case "setRole":
      return { ...state, role: action.role };
    case "setDefaultRole":
      return { ...state, defaultRole: action.role };
    case "setGlobalTrustedWorkers":
      return { ...state, globalTrustedWorkers: action.workers };
    case "addProperty":
      return { ...state, properties: [action.property, ...state.properties] };
    case "upsertProperty":
      return {
        ...state,
        properties: state.properties.map((property) =>
          property.id === action.property.id ? action.property : property,
        ),
      };
    case "upsertBounty":
      return {
        ...state,
        bounties: state.bounties.some((bounty) => bounty.id === action.bounty.id)
          ? state.bounties.map((bounty) => (bounty.id === action.bounty.id ? action.bounty : bounty))
          : [action.bounty, ...state.bounties],
      };
    case "removeBounty":
      return {
        ...state,
        bounties: state.bounties.filter((bounty) => bounty.id !== action.bountyId),
      };
    case "setBounties":
      return {
        ...state,
        bounties: action.bounties,
      };
    case "addTaskTemplate":
      return {
        ...state,
        taskTemplates: [action.taskTemplate, ...state.taskTemplates],
      };
    default:
      return state;
  }
}

interface AppActions {
  setRole: (role: Role) => Promise<void>;
  toggleRole: () => Promise<void>;
  setDefaultRole: (role: Role) => Promise<void>;
  addProperty: (input: CreatePropertyInput) => Promise<void>;
  updateProperty: (propertyId: string, input: UpdatePropertyInput) => Promise<void>;
  updatePropertyInstructions: (propertyId: string, instructions: string) => Promise<void>;
  addTrustedWorkers: (propertyId: string, workers: AddTrustedWorkersInputItem[]) => Promise<void>;
  addGlobalTrustedWorkers: (workers: AddTrustedWorkersInputItem[]) => Promise<void>;
  removeGlobalTrustedWorker: (workerId: string) => Promise<void>;
  createBounty: (input: CreateBountyInput) => Promise<Bounty>;
  addTaskTemplate: (input: CreateTaskTemplateInput) => Promise<TaskTemplate>;
  toggleBountyBoost: (bountyId: string) => Promise<void>;
  deleteBounty: (bountyId: string) => Promise<void>;
  acceptBounty: (bountyId: string) => Promise<void>;
  uploadBountyProofPhoto: (bountyId: string) => Promise<void>;
  submitBountyWork: (bountyId: string) => Promise<void>;
  resetBountyToAvailable: (bountyId: string) => Promise<void>;
  moveBountyLane: (bountyId: string, lane: OwnerBountyLane) => Promise<void>;
}

const AppStateContext = createContext<AppStateSnapshot | null>(null);
const AppActionsContext = createContext<AppActions | null>(null);
const AppLoadingContext = createContext<boolean>(true);

function applyTheme(role: Role) {
  if (typeof document === "undefined") {
    return;
  }
  if (role === "worker") {
    document.documentElement.classList.add("worker-theme", "dark");
  } else {
    document.documentElement.classList.remove("worker-theme", "dark");
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, structuredClone(initialAppState));
  const [loading, setLoading] = useState(true);
  const stateRef = useRef<AppStateSnapshot | null>(structuredClone(initialAppState));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const snapshot = await mockApi.getInitialSnapshot();
      const savedRole = typeof window !== "undefined" ? window.localStorage.getItem("bounty-role") : null;
      if (savedRole === "owner" || savedRole === "worker") {
        snapshot.role = savedRole;
        await mockApi.setRole(savedRole);
      } else if (snapshot.role !== snapshot.defaultRole) {
        snapshot.role = snapshot.defaultRole;
        await mockApi.setRole(snapshot.defaultRole);
      }
      if (!cancelled) {
        dispatch({ type: "hydrate", snapshot });
        applyTheme(snapshot.role);
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }
    const timer = window.setInterval(async () => {
      const current = stateRef.current;
      if (!current) {
        return;
      }
      const hasAccepted = current.bounties.some(
        (bounty) => bounty.workerStatus === "accepted" && bounty.timerSecondsRemaining > 0,
      );
      if (!hasAccepted) {
        return;
      }
      const bounties = await mockApi.tickAcceptedBounties(1);
      dispatch({ type: "setBounties", bounties });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [state]);

  const actions = useMemo<AppActions>(
    () => ({
      async setRole(role) {
        const nextRole = await mockApi.setRole(role);
        dispatch({ type: "setRole", role: nextRole });
        if (typeof window !== "undefined") {
          window.localStorage.setItem("bounty-role", nextRole);
        }
        applyTheme(nextRole);
      },
      async toggleRole() {
        const currentRole = stateRef.current?.role ?? "owner";
        const nextRole = currentRole === "owner" ? "worker" : "owner";
        await actionsRef.current.setRole(nextRole);
      },
      async setDefaultRole(role) {
        const nextRole = await mockApi.setDefaultRole(role);
        dispatch({ type: "setDefaultRole", role: nextRole });
      },
      async addProperty(input) {
        const property = await mockApi.addProperty(input);
        dispatch({ type: "addProperty", property });
      },
      async updateProperty(propertyId, input) {
        const property = await mockApi.updateProperty(propertyId, input);
        dispatch({ type: "upsertProperty", property });
      },
      async updatePropertyInstructions(propertyId, instructions) {
        const property = await mockApi.updatePropertyInstructions(propertyId, instructions);
        dispatch({ type: "upsertProperty", property });
      },
      async addTrustedWorkers(propertyId, workers) {
        if (workers.length === 0) {
          return;
        }
        const property = await mockApi.addTrustedWorkers(propertyId, workers);
        dispatch({ type: "upsertProperty", property });
      },
      async addGlobalTrustedWorkers(workers) {
        if (workers.length === 0) {
          return;
        }
        const nextWorkers = await mockApi.addGlobalTrustedWorkers(workers);
        dispatch({ type: "setGlobalTrustedWorkers", workers: nextWorkers });
      },
      async removeGlobalTrustedWorker(workerId) {
        const nextWorkers = await mockApi.removeGlobalTrustedWorker(workerId);
        dispatch({ type: "setGlobalTrustedWorkers", workers: nextWorkers });
      },
      async createBounty(input) {
        const bounty = await mockApi.createBounty(input);
        dispatch({ type: "upsertBounty", bounty });
        return bounty;
      },
      async addTaskTemplate(input) {
        const taskTemplate = await mockApi.addTaskTemplate(input);
        dispatch({ type: "addTaskTemplate", taskTemplate });
        return taskTemplate;
      },
      async toggleBountyBoost(bountyId) {
        const bounty = await mockApi.toggleBountyBoost(bountyId);
        dispatch({ type: "upsertBounty", bounty });
      },
      async deleteBounty(bountyId) {
        await mockApi.deleteBounty(bountyId);
        dispatch({ type: "removeBounty", bountyId });
      },
      async acceptBounty(bountyId) {
        const workerId = stateRef.current?.currentWorkerId;
        if (!workerId) {
          return;
        }
        const bounty = await mockApi.acceptBounty(bountyId, workerId);
        dispatch({ type: "upsertBounty", bounty });
      },
      async uploadBountyProofPhoto(bountyId) {
        const bounty = await mockApi.uploadBountyProofPhoto(bountyId);
        dispatch({ type: "upsertBounty", bounty });
      },
      async submitBountyWork(bountyId) {
        const bounty = await mockApi.submitBountyWork(bountyId);
        dispatch({ type: "upsertBounty", bounty });
      },
      async resetBountyToAvailable(bountyId) {
        const bounty = await mockApi.resetBountyToAvailable(bountyId);
        dispatch({ type: "upsertBounty", bounty });
      },
      async moveBountyLane(bountyId, lane) {
        const bounty = await mockApi.moveBountyLane(bountyId, lane);
        dispatch({ type: "upsertBounty", bounty });
      },
    }),
    [],
  );

  const actionsRef = useRef<AppActions>(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  return (
    <AppLoadingContext.Provider value={loading}>
      <AppActionsContext.Provider value={actions}>
        <AppStateContext.Provider value={state}>{children}</AppStateContext.Provider>
      </AppActionsContext.Provider>
    </AppLoadingContext.Provider>
  );
}

export function useAppState() {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return state;
}

export function useAppActions() {
  const actions = useContext(AppActionsContext);
  if (!actions) {
    throw new Error("useAppActions must be used within AppStateProvider");
  }
  return actions;
}

export function useAppLoading() {
  return useContext(AppLoadingContext);
}
