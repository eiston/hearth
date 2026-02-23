import type { DragEventHandler } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Bounty, Worker } from "@/lib/app-types";
import { cn } from "@/lib/utils";
import { statusLabel } from "./helpers";

interface TaskEngineCardProps {
  bounty: Bounty;
  propertyLabel: string;
  worker?: Worker;
  isDraggable: boolean;
  isDragging: boolean;
  onDragStart: DragEventHandler<HTMLDivElement>;
  onDragEnd: DragEventHandler<HTMLDivElement>;
}

export function TaskEngineCard({
  bounty,
  propertyLabel,
  worker,
  isDraggable,
  isDragging,
  onDragStart,
  onDragEnd,
}: TaskEngineCardProps) {
  return (
    <Card
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "gap-0 py-0 border shadow-sm transition",
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging && "opacity-60",
      )}
    >
      <CardHeader className="space-y-1 px-4 py-3 pb-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="line-clamp-2 text-sm leading-5">{bounty.title}</CardTitle>
            <CardDescription className="mt-0.5 line-clamp-1 text-xs">{propertyLabel}</CardDescription>
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
            <AvatarFallback className="text-[10px]">{worker?.initials ?? "U"}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>
  );
}
