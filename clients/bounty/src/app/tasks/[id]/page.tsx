"use client";

import { use, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppActions, useAppLoading, useAppState } from "@/lib/app-state";
import type { OwnerBountyLane } from "@/lib/app-types";
import { BOARD_LANES } from "@/components/task-engine/board-config";
import { getPropertyLabel, getWorker, inferOwnerLane, statusLabel } from "@/components/task-engine/helpers";
import { TaskActionPanel } from "@/components/task-details/task-action-panel";
import { TaskCommentsCard } from "@/components/task-details/task-comments-card";
import { ExpirationTimeControl } from "@/components/task-details/expiration-time-control";
import {
  buildIsoFromLocalParts,
  getExpirationHint,
  laneIndex,
  toLocalDateInputValue,
  toTimeParts,
} from "@/components/task-details/helpers";
import { TaskDetailsHeader } from "@/components/task-details/task-details-header";
import { TaskOverviewCard } from "@/components/task-details/task-overview-card";
import { TaskSummaryCard } from "@/components/task-details/task-summary-card";
import type { AvailableWorkerItem, TaskComment } from "@/components/task-details/types";

export default function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const loading = useAppLoading();
  const { bounties, properties, workers, role, currentWorkerId } = useAppState();
  const { deleteBounty, moveBountyLane, toggleBountyBoost } = useAppActions();

  const bounty = bounties.find((item) => item.id === id) ?? null;
  const lane: OwnerBountyLane = bounty ? (bounty.ownerLane ?? inferOwnerLane(bounty)) : "backlog";
  const workerBlockedLane = role === "worker" && (lane === "review" || lane === "pending_payout");

  const [descriptionDraft, setDescriptionDraft] = useState(bounty?.description ?? "");
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const initialTimeParts = toTimeParts(bounty?.deadlineAt);
  const [expirationDateDraft, setExpirationDateDraft] = useState<string>(toLocalDateInputValue(bounty?.deadlineAt));
  const [expirationHourDraft, setExpirationHourDraft] = useState<string>(initialTimeParts.hour);
  const [expirationMinuteDraft, setExpirationMinuteDraft] = useState<string>(initialTimeParts.minute);
  const [expirationPeriodDraft, setExpirationPeriodDraft] = useState<"AM" | "PM">(initialTimeParts.period);
  const [priceDraft, setPriceDraft] = useState<string | null>(null);
  const [savedPriceValue, setSavedPriceValue] = useState<number | null>(null);
  const [taskImages, setTaskImages] = useState<string[]>(bounty?.imageUrls ?? []);
  const [pendingMove, setPendingMove] = useState<OwnerBountyLane | null>(null);
  const [moveReason, setMoveReason] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (workerBlockedLane) {
      router.replace("/");
    }
  }, [workerBlockedLane, router]);

  if (!bounty) {
    return (
      <div className="space-y-4">
        <TaskDetailsHeader loading={loading} onBack={() => router.push("/?tab=tasks")} />
        <div className="text-sm text-muted-foreground">{loading ? "Loading task..." : "Task not found."}</div>
      </div>
    );
  }

  const laneLabel = BOARD_LANES.find((item) => item.id === lane)?.label ?? lane;
  const property = properties.find((item) => item.id === bounty.propertyId) ?? null;
  const propertyAddress = getPropertyLabel(properties, bounty.propertyId);
  const assignedWorker = getWorker(workers, bounty.acceptedByWorkerId);
  const descriptionLocked = lane === "in_progress" || lane === "review" || lane === "pending_payout";
  const isWorkerView = role === "worker";
  const isWorkerBacklogView = isWorkerView && lane === "backlog";
  const commentsDisabledForViewer = isWorkerView && (lane === "backlog" || lane === "active");
  const effectiveDescription = descriptionDraft || bounty.description;

  const editedExpirationIso = buildIsoFromLocalParts(
    expirationDateDraft,
    expirationHourDraft,
    expirationMinuteDraft,
    expirationPeriodDraft,
  );
  const effectiveExpiration = lane === "backlog" ? editedExpirationIso : (bounty.deadlineAt ?? "");
  const expirationHint = getExpirationHint(effectiveExpiration);

  const basePrice = savedPriceValue ?? bounty.price;
  const effectivePrice = priceDraft ?? String(basePrice);
  const parsedDraftPrice = Number(effectivePrice);
  const canSavePrice =
    lane === "backlog" &&
    effectivePrice.trim() !== "" &&
    Number.isFinite(parsedDraftPrice) &&
    parsedDraftPrice >= 0 &&
    parsedDraftPrice !== basePrice;

  const availableWorkers: AvailableWorkerItem[] =
    !property || !["backlog", "active"].includes(lane)
      ? []
      : property.whitelistedWorkers.length > 0
        ? property.whitelistedWorkers.map((trusted) => {
            const full = workers.find((worker) => worker.id === trusted.id);
            return {
              id: trusted.id,
              name: trusted.name,
              initials: trusted.initials,
              email: full?.email,
              reputation: full?.reputation,
              trusted: true,
            };
          })
        : workers.map((worker) => ({
            id: worker.id,
            name: worker.name,
            initials: worker.initials,
            email: worker.email,
            reputation: worker.reputation,
            trusted: false,
          }));

  const pushSystemComment = (text: string) => {
    setComments((prev) => [
      ...prev,
      {
        id: `${bounty.id}-system-${Date.now()}`,
        author: "System",
        text,
        createdAt: new Date().toISOString(),
        kind: "system",
      },
    ]);
  };

  const addComment = () => {
    const text = commentDraft.trim();
    if (!text) {
      return;
    }

    const author = role === "owner" ? "Owner" : workers.find((worker) => worker.id === currentWorkerId)?.name ?? "Worker";
    setComments((prev) => [
      ...prev,
      {
        id: `${bounty.id}-${Date.now()}`,
        author,
        text,
        createdAt: new Date().toISOString(),
        kind: "user",
      },
    ]);
    setCommentDraft("");
  };

  const executeMoveTask = async (nextLane: OwnerBountyLane, reason?: string) => {
    const currentLane = lane;
    await moveBountyLane(bounty.id, nextLane);

    const currentLaneLabel = BOARD_LANES.find((item) => item.id === currentLane)?.label ?? currentLane;
    const nextLaneLabel = BOARD_LANES.find((item) => item.id === nextLane)?.label ?? nextLane;

    if (currentLane === "active") {
      pushSystemComment(`Task moved from ${currentLaneLabel} to ${nextLaneLabel}.`);
    }

    if (reason?.trim()) {
      pushSystemComment(`Moved back to ${nextLaneLabel}. Reason: ${reason.trim()}`);
    }
  };

  const requestMoveTask = async (nextLane: OwnerBountyLane) => {
    if (laneIndex(nextLane) < laneIndex(lane)) {
      setPendingMove(nextLane);
      return;
    }
    await executeMoveTask(nextLane);
  };

  const confirmBackwardMove = async () => {
    if (!pendingMove || !moveReason.trim()) {
      return;
    }
    const reason = moveReason.trim();
    setPendingMove(null);
    setMoveReason("");
    await executeMoveTask(pendingMove, reason);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const urls = files.map((file) => URL.createObjectURL(file));
    setTaskImages((prev) => [...prev, ...urls]);
    event.target.value = "";
  };

  const handleSavePrice = () => {
    if (!canSavePrice) {
      return;
    }
    setSavedPriceValue(parsedDraftPrice);
    setPriceDraft(null);
    pushSystemComment(`Backlog cost updated to $${parsedDraftPrice}.`);
  };

  if (workerBlockedLane) {
    return (
      <div className="space-y-4">
        <TaskDetailsHeader loading={loading} onBack={() => router.push("/")} />
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 animate-in fade-in duration-300">
      <TaskDetailsHeader loading={loading} bountyId={bounty.id} laneLabel={laneLabel} onBack={() => router.push("/?tab=tasks")} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <TaskOverviewCard
            title={bounty.title}
            propertyAddress={propertyAddress}
            status={statusLabel(bounty)}
            boosted={bounty.boosted}
            displayPrice={Number(effectivePrice || basePrice)}
            description={effectiveDescription}
            descriptionLocked={descriptionLocked || isWorkerView}
            descriptionHelpText={isWorkerView ? "Description is read-only for workers." : undefined}
            onDescriptionChange={setDescriptionDraft}
            taskImages={taskImages}
            fileInputRef={fileInputRef}
            onOpenUpload={() => fileInputRef.current?.click()}
            onImageUpload={handleImageUpload}
          />

          <TaskCommentsCard
            comments={comments}
            commentDraft={commentDraft}
            onCommentDraftChange={setCommentDraft}
            onAddComment={addComment}
            disabled={commentsDisabledForViewer}
          />
        </div>

        <div className="space-y-6">
          <TaskActionPanel
            lane={lane}
            viewerRole={role}
            boosted={bounty.boosted}
            onMove={(nextLane) => {
              void requestMoveTask(nextLane);
            }}
            onDelete={() => {
              void deleteBounty(bounty.id);
              router.push("/?tab=tasks");
            }}
            onToggleBoost={() => {
              void toggleBountyBoost(bounty.id);
            }}
            assignedWorker={assignedWorker ?? null}
            costDisplay={basePrice}
            costDraft={effectivePrice}
            onCostChange={setPriceDraft}
            canSavePrice={canSavePrice}
            onSavePrice={handleSavePrice}
            pendingMove={Boolean(pendingMove)}
            moveReason={moveReason}
            onMoveReasonChange={setMoveReason}
            onCancelPendingMove={() => {
              setPendingMove(null);
              setMoveReason("");
            }}
            onConfirmPendingMove={() => {
              void confirmBackwardMove();
            }}
            expirationTimeControl={
              <ExpirationTimeControl
                lane={isWorkerBacklogView ? "active" : lane}
                expirationDateDraft={expirationDateDraft}
                expirationHourDraft={expirationHourDraft}
                expirationMinuteDraft={expirationMinuteDraft}
                expirationPeriodDraft={expirationPeriodDraft}
                effectiveExpiration={effectiveExpiration}
                expirationHint={expirationHint}
                readonlyExpirationAt={bounty.deadlineAt}
                onDateChange={setExpirationDateDraft}
                onHourChange={setExpirationHourDraft}
                onMinuteChange={setExpirationMinuteDraft}
                onPeriodChange={setExpirationPeriodDraft}
              />
            }
            availableWorkers={availableWorkers}
          />

          <TaskSummaryCard
            type={bounty.type}
            proofPhotosUploaded={bounty.proofPhotosUploaded}
            propertyAddress={property?.address}
          />
        </div>
      </div>
    </div>
  );
}
