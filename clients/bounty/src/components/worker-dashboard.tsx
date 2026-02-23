"use client";

import { Badge } from "@/components/ui/badge";
import { WorkerBountyCard } from "@/components/worker-bounty-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Activity, CheckCircle2 } from "lucide-react";
import { useAppActions, useAppState } from "@/lib/app-state";

export function WorkerDashboard() {
    const state = useAppState();
    const actions = useAppActions();

    const currentWorker = state.workers.find((worker) => worker.id === state.currentWorkerId);
    const openBounties = state.bounties.filter((bounty) => bounty.workerStatus === "available");
    const inProgressBounties = state.bounties.filter((bounty) => bounty.workerStatus !== "available");

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
                    <div className="grid gap-6 md:grid-cols-2">
                        {openBounties.map((bounty) => (
                            <WorkerBountyCard
                                key={bounty.id}
                                bounty={bounty}
                                address={getPropertyAddress(bounty.propertyId)}
                                noShowTimerLabel={formatTime(bounty.timerSecondsRemaining)}
                                arrivalWindowLabel={formatDuration(state.ui.noShowTimerSeconds)}
                                onAccept={() => actions.acceptBounty(bounty.id)}
                                onUploadPhoto={() => actions.uploadBountyProofPhoto(bounty.id)}
                                onSubmitWork={() => actions.submitBountyWork(bounty.id)}
                                onResetToAvailable={() => actions.resetBountyToAvailable(bounty.id)}
                            />
                        ))}
                        {openBounties.length === 0 && (
                            <div className="col-span-2 py-12 text-center text-muted-foreground">
                                <p>No open bounties available.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        {inProgressBounties.map((bounty) => (
                            <WorkerBountyCard
                                key={bounty.id}
                                bounty={bounty}
                                address={getPropertyAddress(bounty.propertyId)}
                                noShowTimerLabel={formatTime(bounty.timerSecondsRemaining)}
                                arrivalWindowLabel={formatDuration(state.ui.noShowTimerSeconds)}
                                onAccept={() => actions.acceptBounty(bounty.id)}
                                onUploadPhoto={() => actions.uploadBountyProofPhoto(bounty.id)}
                                onSubmitWork={() => actions.submitBountyWork(bounty.id)}
                                onResetToAvailable={() => actions.resetBountyToAvailable(bounty.id)}
                            />
                        ))}
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
