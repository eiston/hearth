"use client";

import * as React from "react"
import Link from "next/link";
import { useRole } from "./role-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function AppHeader() {
    const { role, toggleRole } = useRole()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
                <div className="mr-4 flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <span className="hidden font-bold sm:inline-block">
                            BOUNTY
                        </span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other items could go in the center */}
                    </div>
                    <nav className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 border rounded-full px-3 py-1 bg-muted/50">
                            <Label htmlFor="role-mode" className="text-xs font-medium cursor-pointer">
                                {role === "owner" ? "Owner Mode" : "Worker Mode"}
                            </Label>
                            <Switch
                                id="role-mode"
                                checked={role === "worker"}
                                onCheckedChange={toggleRole}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                        {role === "owner" ? (
                            <Badge variant="outline" className="font-mono bg-primary text-primary-foreground">
                                OWNER
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="font-mono bg-secondary text-secondary-foreground">
                                WORKER
                            </Badge>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
