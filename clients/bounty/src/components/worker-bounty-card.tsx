"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock3, Copy, Sparkles } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Bounty } from "@/lib/app-types";
import { useState } from "react";

interface WorkerBountyCardProps {
    bounty: Bounty;
    address: string;
    noShowTimerLabel: string;
    arrivalWindowLabel: string;
    compact?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
    deadlineLabel?: string | null;
    urgencyLabel?: string | null;
    acceptDisabled?: boolean;
    showCompactDetailButton?: boolean;
    onAccept: () => Promise<void>;
    onUploadPhoto: () => Promise<void>;
    onSubmitWork: () => Promise<void>;
    onResetToAvailable: () => Promise<void>;
}

export function WorkerBountyCard({
    bounty,
    address,
    noShowTimerLabel,
    arrivalWindowLabel,
    compact = false,
    isSelected = false,
    onSelect,
    deadlineLabel = null,
    urgencyLabel = null,
    acceptDisabled = false,
    showCompactDetailButton = true,
    onAccept,
    onUploadPhoto,
    onSubmitWork,
    onResetToAvailable,
}: WorkerBountyCardProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
        } catch (err) {
            console.error("Failed to copy address", err);
        }
    };

    if (bounty.workerStatus === "pending_approval" && !compact) {
        return (
            <Card className="border border-dashed border-primary/50">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-primary/20 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl">
                        ✓
                    </div>
                    <CardTitle>Work Submitted</CardTitle>
                    <CardDescription>Pending owner approval. Payout will be sent via e-transfer soon.</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center mt-2 pb-6">
                    <Button variant="outline" onClick={() => void onResetToAvailable()}>
                        Back to Bounties
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (bounty.workerStatus === "accepted" && !compact) {
        return (
            <Card className="border-2 border-primary">
                <CardHeader className="pb-3 bg-muted/20 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-2">ACCEPTED & IN PROGRESS</Badge>
                            <CardTitle className="text-xl">{bounty.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <CardDescription>{address}</CardDescription>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress} title="Copy Address">
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-2xl font-mono font-bold text-destructive">{noShowTimerLabel}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase mt-1">NO SHOW TIMER</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <p className="text-sm">
                        You have accepted this bounty. A notification has been sent to the tenants. Please proceed to the property.
                    </p>

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Proof of Completion Requirements</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => void onUploadPhoto()}
                            >
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">CAM</div>
                                <div className="text-sm font-medium">Before Photo</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    {bounty.proofPhotosUploaded > 0 ? "[UPLOADED]" : "[PENDING]"}
                                </div>
                            </button>
                            <button
                                type="button"
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => void onUploadPhoto()}
                            >
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">CAM</div>
                                <div className="text-sm font-medium">After Photo</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    {bounty.proofPhotosUploaded > 1 ? "[UPLOADED]" : "[PENDING]"}
                                </div>
                            </button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t pt-4">
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={bounty.proofPhotosUploaded < 2}
                        onClick={() => void onSubmitWork()}
                    >
                        Submit for Approval
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const requirementBadges = [
        "2 photos",
        bounty.workerStatus === "accepted" ? `${bounty.proofPhotosUploaded}/2 uploaded` : null,
        bounty.tenantBridgeEnabled ? "tenant access" : null,
        bounty.recursiveSchedulingEnabled && bounty.recurrenceCadence ? `repeat ${bounty.recurrenceCadence}` : null,
    ].filter(Boolean) as string[];

    if (compact) {
        const isAccepted = bounty.workerStatus === "accepted";
        const compactPrimaryLabel = isAccepted
            ? (bounty.proofPhotosUploaded >= 2 ? "Submit Work" : "Upload Proof")
            : "Accept Task";
        const handleCompactPrimaryAction = () => {
            if (isAccepted) {
                if (bounty.proofPhotosUploaded >= 2) {
                    void onSubmitWork();
                    return;
                }
                void onUploadPhoto();
                return;
            }
            void onAccept();
        };

        return (
            <Card className={isSelected ? "border-primary ring-1 ring-primary/30" : undefined}>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {bounty.isNew && (
                                        <Badge className="h-5 px-2 text-[10px] tracking-wide">NEW</Badge>
                                    )}
                                    {bounty.boosted && (
                                        <Badge variant="secondary" className="h-5 px-2 text-[10px] tracking-wide">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            BOOSTED
                                        </Badge>
                                    )}
                                    {urgencyLabel && urgencyLabel !== "flexible" && (
                                        <Badge variant={urgencyLabel === "urgent" ? "destructive" : "outline"} className="h-5 px-2 text-[10px] tracking-wide">
                                            {urgencyLabel.toUpperCase()}
                                        </Badge>
                                    )}
                                    {isAccepted && (
                                        <Badge variant="outline" className="h-5 px-2 text-[10px] tracking-wide">
                                            IN PROGRESS
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-base leading-tight">{bounty.title}</CardTitle>
                                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                        {bounty.type}
                                    </Badge>
                                </div>
                                <CardDescription className="truncate pr-2">{address}</CardDescription>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-2xl font-bold leading-none">${bounty.price}</div>
                                <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                                    payout
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                            <div className="rounded-md border bg-muted/30 px-3 py-2">
                                <div className="uppercase tracking-wide text-[10px]">Arrival Window</div>
                                <div className="mt-1 text-sm font-medium text-foreground">{arrivalWindowLabel}</div>
                            </div>
                            <div className="rounded-md border bg-muted/30 px-3 py-2">
                                <div className="uppercase tracking-wide text-[10px]">No-Show Timer</div>
                                <div className="mt-1 text-sm font-medium text-foreground">{noShowTimerLabel}</div>
                            </div>
                            <div className="rounded-md border bg-muted/30 px-3 py-2">
                                <div className="uppercase tracking-wide text-[10px]">Deadline</div>
                                <div className="mt-1 text-sm font-medium text-foreground">{deadlineLabel ?? "Flexible"}</div>
                            </div>
                        </div>

                        <p className="line-clamp-2 text-sm text-foreground">{bounty.description}</p>

                        <div className="flex flex-wrap items-center gap-2">
                            {requirementBadges.map((label) => (
                                <Badge key={label} variant="outline" className="text-[10px] uppercase tracking-wide">
                                    {label}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                className="h-11 text-base font-semibold sm:flex-1"
                                onClick={handleCompactPrimaryAction}
                                disabled={!isAccepted && acceptDisabled}
                            >
                                {compactPrimaryLabel}
                            </Button>
                            {showCompactDetailButton && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 shrink-0"
                                    onClick={onSelect}
                                    aria-label="View details"
                                    title="View details"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        {bounty.isNew && <Badge className="mb-2 bg-primary text-primary-foreground">NEW BOUNTY</Badge>}
                        <CardTitle className="text-xl">{bounty.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <CardDescription>{address}</CardDescription>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress} title="Copy Address">
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">${bounty.price}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">{bounty.type}</div>
                        {deadlineLabel && (
                            <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock3 className="h-3 w-3" />
                                {deadlineLabel}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <p className="text-sm text-foreground">{bounty.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {requirementBadges.map((label) => (
                            <Badge key={label} variant="outline" className="text-[10px] uppercase tracking-wide">
                                {label}
                            </Badge>
                        ))}
                    </div>

                    <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full" size="lg" disabled={acceptDisabled}>Accept Bounty</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Accept this bounty?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    By accepting this bounty, you commit to arriving at {address} within {arrivalWindowLabel}. Failure to show up may affect your reputation score.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { void onAccept(); setIsConfirmOpen(false); }}>
                                    Confirm & Accept
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
