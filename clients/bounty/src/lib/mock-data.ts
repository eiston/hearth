import { initialAppState } from "@/lib/mock-seed";

// Backward-compatible export for any components still referencing the old mock list.
export const mockProperties = initialAppState.properties;
