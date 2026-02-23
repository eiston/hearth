"use client";

import { useMemo, useState, type DragEvent } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Bounty, OwnerBountyLane } from "@/lib/app-types";
import { useAppActions, useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const BOARD_LANES: Array<{ id: OwnerBountyLane; label: string }> = [
  { id: "backlog", label: "Backlog" },
  { id: "active", label: "Active" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "pending_payment", label: "Pending Payment" },
];

const DRAGGABLE_LANES: OwnerBountyLane[] = ["backlog", "active"];

export function TaskEngine() {
  const { bounties, properties, taskTemplates, ui, workers } = useAppState();
  const { createBounty, moveBountyLane } = useAppActions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [template, setTemplate] = useState<string>("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id ?? "");
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [recursiveSchedulingEnabled, setRecursiveSchedulingEnabled] = useState(false);
  const [tenantBridgeEnabled, setTenantBridgeEnabled] = useState(true);
  const [draggingBountyId, setDraggingBountyId] = useState<string | null>(null);
  const [hoverLane, setHoverLane] = useState<OwnerBountyLane | null>(null);

  const bountiesByLane = useMemo(() => {
    const grouped = Object.fromEntries(BOARD_LANES.map((lane) => [lane.id, [] as Bounty[]])) as Record<
      OwnerBountyLane,
      Bounty[]
    >;

    for (const bounty of bounties) {
      const lane = bounty.ownerLane ?? inferOwnerLane(bounty);
      grouped[lane].push(bounty);
    }

    return grouped;
  }, [bounties]);

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    if (value === "custom") {
      setFormTitle("");
      setFormPrice("");
      setFormDesc("");
      return;
    }

    const match = taskTemplates.find((item) => item.id === value);
    if (!match) {
      return;
    }

    setFormTitle(match.title);
    setFormPrice(String(match.price));
    setFormDesc(match.description);
  };

  const resetForm = () => {
    setTemplate("");
    setSelectedPropertyId(properties[0]?.id ?? "");
    setFormTitle("");
    setFormPrice("");
    setFormDesc("");
    setRecursiveSchedulingEnabled(false);
    setTenantBridgeEnabled(true);
  };

  const handleCreate = async () => {
    if (!selectedPropertyId || !formTitle.trim() || !formDesc.trim() || !formPrice) {
      return;
    }

    await createBounty({
      propertyId: selectedPropertyId,
      title: formTitle.trim(),
      description: formDesc.trim(),
      price: Number(formPrice),
      type: "Fixed Price",
      tenantBridgeEnabled,
      recursiveSchedulingEnabled,
    });

    setIsDialogOpen(false);
    resetForm();
  };

  const getPropertyLabel = (propertyId: string) => {
    const property = properties.find((item) => item.id === propertyId);
    return property?.address ?? "Unknown Property";
  };

  const getWorker = (workerId?: string | null) => workers.find((worker) => worker.id === workerId);

  const handleDrop = async (lane: OwnerBountyLane, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!DRAGGABLE_LANES.includes(lane)) {
      return;
    }
    const bountyId = event.dataTransfer.getData("text/bounty-id") || draggingBountyId;
    setHoverLane(null);
    setDraggingBountyId(null);
    if (!bountyId) {
      return;
    }
    const bounty = bounties.find((item) => item.id === bountyId);
    if (!bounty || (bounty.ownerLane ?? inferOwnerLane(bounty)) === lane) {
      return;
    }
    await moveBountyLane(bountyId, lane);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Bounty Engine</h3>
          <p className="text-sm text-muted-foreground">Kanban workflow for dispatch, execution, review, and payout.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Bounty</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Bounty Task</DialogTitle>
              <DialogDescription>Create a task and add it to the backlog lane.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template">Task Library (Template)</Label>
                <Select value={template} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTemplates.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Task...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="property">Property</Label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Task</Label>
                <Input id="title" value={formTitle} onChange={(event) => setFormTitle(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={formDesc} onChange={(event) => setFormDesc(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Cost ($)</Label>
                <Input id="price" type="number" value={formPrice} onChange={(event) => setFormPrice(event.target.value)} />
              </div>
              <div className="grid gap-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recursive"
                    checked={recursiveSchedulingEnabled}
                    onCheckedChange={(checked) => setRecursiveSchedulingEnabled(Boolean(checked))}
                  />
                  <label htmlFor="recursive" className="text-sm leading-none">
                    Recursive Scheduling (Auto-repost every {ui.autoRepostDays} days)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tenant-bridge"
                    checked={tenantBridgeEnabled}
                    onCheckedChange={(checked) => setTenantBridgeEnabled(Boolean(checked))}
                  />
                  <label htmlFor="tenant-bridge" className="text-sm leading-none">
                    Tenant Notification Bridge
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate}>
                Add to Backlog
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1200px] grid-cols-5 gap-0 align-start">
          {BOARD_LANES.map((lane, index) => {
            const laneBounties = bountiesByLane[lane.id];
            const laneIsDroppable = DRAGGABLE_LANES.includes(lane.id);

            return (
              <section
                key={lane.id}
                className={cn(
                  "flex min-h-[32rem] flex-col px-3",
                  index > 0 && "border-l",
                  hoverLane === lane.id && laneIsDroppable && "bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between border-b px-1 py-3">
                  <h4 className="text-sm font-semibold tracking-wide uppercase">{lane.label}</h4>
                  <Badge variant="secondary">{laneBounties.length}</Badge>
                </div>

                <div
                  className="flex flex-1 flex-col gap-2.5 px-1 py-3"
                  onDragOver={(event) => {
                    if (!laneIsDroppable) {
                      return;
                    }
                    event.preventDefault();
                    if (hoverLane !== lane.id) {
                      setHoverLane(lane.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (hoverLane === lane.id) {
                      setHoverLane(null);
                    }
                  }}
                  onDrop={(event) => void handleDrop(lane.id, event)}
                >
                  {laneBounties.map((bounty) => {
                    const worker = getWorker(bounty.acceptedByWorkerId);
                    const bountyLane = bounty.ownerLane ?? inferOwnerLane(bounty);
                    const isDraggable = DRAGGABLE_LANES.includes(bountyLane);
                    return (
                      <Card
                        key={bounty.id}
                        draggable={isDraggable}
                        onDragStart={(event) => {
                          if (!isDraggable) {
                            event.preventDefault();
                            return;
                          }
                          event.dataTransfer.setData("text/bounty-id", bounty.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingBountyId(bounty.id);
                        }}
                        onDragEnd={() => {
                          setDraggingBountyId(null);
                          setHoverLane(null);
                        }}
                        className={cn(
                          "gap-0 py-0 border shadow-sm transition",
                          isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                          draggingBountyId === bounty.id && "opacity-60",
                        )}
                      >
                        <CardHeader className="space-y-1 px-4 py-3 pb-1.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <CardTitle className="line-clamp-2 text-sm leading-5">
                                {bounty.title}
                              </CardTitle>
                              <CardDescription className="mt-0.5 line-clamp-1 text-xs">
                                {getPropertyLabel(bounty.propertyId)}
                              </CardDescription>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-sm font-semibold">${bounty.price}</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-2 px-4 pb-3 pt-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {bounty.boosted ? <Badge className="h-5 px-1.5 text-[10px]">Boosted</Badge> : null}
                            {bounty.isNew ? (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                New
                              </Badge>
                            ) : null}
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                              {statusLabel(bounty)}
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {worker?.initials ?? "U"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {laneBounties.length === 0 ? (
                    <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                      Drop a task here
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function inferOwnerLane(bounty: Bounty): OwnerBountyLane {
  if (bounty.workerStatus === "accepted") {
    return "in_progress";
  }
  if (bounty.workerStatus === "pending_approval") {
    return "review";
  }
  return bounty.boosted ? "active" : "backlog";
}

function statusLabel(bounty: Bounty) {
  if (bounty.workerStatus === "pending_approval") {
    return "Submitted";
  }
  if (bounty.workerStatus === "accepted") {
    return "Assigned";
  }
  return "Open";
}
