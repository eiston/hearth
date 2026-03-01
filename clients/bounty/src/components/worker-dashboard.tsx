"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkerBountyCard } from "@/components/worker-bounty-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Activity, CheckCircle2, RefreshCw, ShieldCheck, Siren } from "lucide-react";
import { useAppActions, useAppState } from "@/lib/app-state";

export function WorkerDashboard() {
    const router = useRouter();
    const state = useAppState();
    const actions = useAppActions();
    const [openFilter, setOpenFilter] = useState<"all" | "new" | "boosted" | "tenant-bridge">("all");
    const [openSort, setOpenSort] = useState<"recommended" | "pay" | "deadline">("recommended");
    const [selectedOpenBountyId, setSelectedOpenBountyId] = useState<string | null>(null);
    const [selectedAcceptedBountyId, setSelectedAcceptedBountyId] = useState<string | null>(null);

    const currentWorker = state.workers.find((worker) => worker.id === state.currentWorkerId);
    const openBounties = state.bounties.filter((bounty) => bounty.workerStatus === "available");
    const acceptedBounties = state.bounties.filter(
        (bounty) => bounty.workerStatus === "accepted" && bounty.acceptedByWorkerId === state.currentWorkerId,
    );
    const hasReachedAcceptedLimit = acceptedBounties.length >= 3;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        if (hours > 0 && seconds % 3600 === 0) {
            return `${hours} hour${hours === 1 ? "" : "s"}`;
        }
        const minutes = Math.ceil(seconds / 60);
        return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    };

    const getPropertyAddress = (propertyId: string) => {
        const property = state.properties.find((item) => item.id === propertyId);
        return property?.address ?? "Unknown Property";
    };

    const getUrgencyRank = (deadlineAt?: string | null) => {
        if (!deadlineAt) return 0;
        return 1;
    };

    const getUrgencyLabel = (deadlineAt?: string | null) => {
        const rank = getUrgencyRank(deadlineAt);
        if (rank === 1) return "deadline";
        return "flexible";
    };

    const formatDeadline = (deadlineAt?: string | null) => {
        if (!deadlineAt) return null;
        const deadline = new Date(deadlineAt);
        const absolute = deadline.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
        return `Due ${absolute}`;
    };

    const filteredOpenBounties = openBounties.filter((bounty) => {
        if (openFilter === "new") return Boolean(bounty.isNew);
        if (openFilter === "boosted") return Boolean(bounty.boosted);
        if (openFilter === "tenant-bridge") return Boolean(bounty.tenantBridgeEnabled);
        return true;
    });

    const sortedOpenBounties = [...filteredOpenBounties].sort((a, b) => {
        if (openSort === "pay") return b.price - a.price;
        if (openSort === "deadline") {
            const aTs = a.deadlineAt ? new Date(a.deadlineAt).getTime() : Number.POSITIVE_INFINITY;
            const bTs = b.deadlineAt ? new Date(b.deadlineAt).getTime() : Number.POSITIVE_INFINITY;
            return aTs - bTs;
        }

        const score = (bounty: (typeof openBounties)[number]) => {
            let value = bounty.price;
            value += getUrgencyRank(bounty.deadlineAt) * 20;
            if (bounty.isNew) value += 15;
            if (bounty.boosted) value += 10;
            if (bounty.tenantBridgeEnabled) value += 5;
            return value;
        };
        return score(b) - score(a);
    });

    const selectedOpenBounty =
        sortedOpenBounties.find((bounty) => bounty.id === selectedOpenBountyId) ??
        sortedOpenBounties[0] ??
        null;
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Worker Interface</h2>
                <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="font-mono">REPUTATION: {currentWorker?.reputation ?? 0}%</Badge>
                    <Badge variant="outline" className="font-mono bg-primary text-primary-foreground">EARNINGS: ${state.workerFinancialSummary.totalEarnings}</Badge>
                </div>
            </div>

            <Tabs defaultValue="open" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="open">Open Bounties</TabsTrigger>
                    <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="space-y-4">
                    <div className="space-y-4">
                        <div className="sticky top-2 z-10 rounded-lg border bg-background/95 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
                            <div className="grid gap-2 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <div className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed bg-muted/20 px-2.5 text-xs">
                                        <span className="uppercase tracking-wide text-muted-foreground">Avail</span>
                                        <span className="font-semibold text-foreground">{openBounties.length}</span>
                                    </div>
                                    <div className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed bg-muted/20 px-2.5 text-xs">
                                        <span className="uppercase tracking-wide text-muted-foreground">Active</span>
                                        <span className="font-semibold text-foreground">{acceptedBounties.length}/3</span>
                                    </div>
                                    <div className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed bg-muted/20 px-2.5 text-xs">
                                        <Siren className="h-3 w-3 text-muted-foreground" />
                                        <span className="uppercase tracking-wide text-muted-foreground">Timed</span>
                                        <span className="font-semibold text-foreground">
                                            {openBounties.filter((bounty) => Boolean(bounty.deadlineAt)).length}
                                        </span>
                                    </div>
                                    <div className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed bg-muted/20 px-2.5 text-xs">
                                        <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                                        <span className="uppercase tracking-wide text-muted-foreground">Rep</span>
                                        <span className="font-semibold text-foreground">{currentWorker?.reputation ?? 0}%</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="flex flex-wrap gap-1.5">
                                        <Button size="sm" className="h-8 px-2.5" variant={openFilter === "all" ? "default" : "outline"} onClick={() => setOpenFilter("all")}>
                                            All
                                        </Button>
                                        <Button size="sm" className="h-8 px-2.5" variant={openFilter === "new" ? "default" : "outline"} onClick={() => setOpenFilter("new")}>
                                            New
                                        </Button>
                                        <Button size="sm" className="h-8 px-2.5" variant={openFilter === "boosted" ? "default" : "outline"} onClick={() => setOpenFilter("boosted")}>
                                            Boosted
                                        </Button>
                                        <Button size="sm" className="h-8 px-2.5" variant={openFilter === "tenant-bridge" ? "default" : "outline"} onClick={() => setOpenFilter("tenant-bridge")}>
                                            Tenant
                                        </Button>
                                    </div>
                                    <Select value={openSort} onValueChange={(value) => setOpenSort(value as "recommended" | "pay" | "deadline")}>
                                        <SelectTrigger className="h-8 sm:w-[160px]">
                                            <SelectValue placeholder="Sort" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="recommended">Best Match</SelectItem>
                                            <SelectItem value="pay">Highest Pay</SelectItem>
                                            <SelectItem value="deadline">Most Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-end">
                                    <Button variant="outline" size="sm" className="h-8 px-2.5">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Live
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {sortedOpenBounties.map((bounty) => (
                                    <WorkerBountyCard
                                        key={bounty.id}
                                        compact
                                        isSelected={selectedOpenBounty?.id === bounty.id}
                                        onSelect={() => {
                                            setSelectedOpenBountyId(bounty.id);
                                            router.push(`/tasks/${bounty.id}`);
                                        }}
                                        bounty={bounty}
                                    address={getPropertyAddress(bounty.propertyId)}
                                    noShowTimerLabel={formatTime(bounty.timerSecondsRemaining)}
                                    arrivalWindowLabel={formatDuration(state.ui.noShowTimerSeconds)}
                                    deadlineLabel={formatDeadline(bounty.deadlineAt)}
                                    urgencyLabel={getUrgencyLabel(bounty.deadlineAt)}
                                    acceptDisabled={hasReachedAcceptedLimit}
                                    onAccept={() => hasReachedAcceptedLimit ? Promise.resolve() : actions.acceptBounty(bounty.id)}
                                    onUploadPhoto={() => actions.uploadBountyProofPhoto(bounty.id)}
                                    onSubmitWork={() => actions.submitBountyWork(bounty.id)}
                                    onResetToAvailable={() => actions.resetBountyToAvailable(bounty.id)}
                                />
                            ))}
                            {sortedOpenBounties.length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        No open bounties match this filter.
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                            <div className="text-muted-foreground">Active tasks only (submitted tasks are hidden)</div>
                            <Badge variant={acceptedBounties.length >= 3 ? "destructive" : "outline"} className="font-mono">
                                {acceptedBounties.length}/3 ACCEPTED
                            </Badge>
                        </div>
                        {acceptedBounties.map((bounty) => (
                            <WorkerBountyCard
                                key={bounty.id}
                                compact
                                isSelected={selectedAcceptedBountyId === bounty.id}
                                onSelect={() => setSelectedAcceptedBountyId(bounty.id)}
                                showCompactDetailButton={false}
                                bounty={bounty}
                                address={getPropertyAddress(bounty.propertyId)}
                                noShowTimerLabel={formatTime(bounty.timerSecondsRemaining)}
                                arrivalWindowLabel={formatDuration(state.ui.noShowTimerSeconds)}
                                deadlineLabel={formatDeadline(bounty.deadlineAt)}
                                urgencyLabel={getUrgencyLabel(bounty.deadlineAt)}
                                onAccept={() => actions.acceptBounty(bounty.id)}
                                onUploadPhoto={() => Promise.resolve(router.push(`/tasks/${bounty.id}`))}
                                onSubmitWork={() => actions.submitBountyWork(bounty.id)}
                                onResetToAvailable={() => actions.resetBountyToAvailable(bounty.id)}
                            />
                        ))}
                        {acceptedBounties.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No tasks in progress.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="financials" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${state.workerFinancialSummary.totalEarnings.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">{state.workerFinancialSummary.earningsDeltaText}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${state.workerFinancialSummary.pendingPayouts.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">{state.workerFinancialSummary.pendingJobsText}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{state.workerFinancialSummary.jobsCompleted}</div>
                                <p className="text-xs text-muted-foreground">{state.workerFinancialSummary.jobsCompletedDeltaText}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="col-span-4 mt-6">
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                You have earned ${state.workerFinancialSummary.totalEarnings} this month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {state.workerTransactions.map((transaction) => (
                                    <div key={transaction.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{transaction.title} - {transaction.propertyLabel}</p>
                                            <p className="text-sm text-muted-foreground">Completed on {transaction.completedOn}</p>
                                        </div>
                                        <div className="ml-auto font-medium">+${transaction.amount.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
