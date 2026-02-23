"use client";

import type { Role } from "@/lib/app-types";
import { useAppActions, useAppState } from "@/lib/app-state";

interface RoleContextType {
    role: Role;
    setRole: (role: Role) => Promise<void>;
    toggleRole: () => Promise<void>;
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function useRole(): RoleContextType {
    const { role } = useAppState();
    const { setRole, toggleRole } = useAppActions();
    return { role, setRole, toggleRole };
}
