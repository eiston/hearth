import { format } from "date-fns";
import { AlertTriangle, CalendarClock, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/components/task-details/helpers";
import type { ExpirationHint } from "@/components/task-details/types";
import type { OwnerBountyLane } from "@/lib/app-types";
import { cn } from "@/lib/utils";

function parseDraftDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (![year, month, day].every(Number.isFinite)) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeSlotValue(hour: string, minute: string, period: "AM" | "PM") {
  if (minute !== "00") {
    return "";
  }

  return `${hour}-${period}`;
}

export function ExpirationTimeControl({
  lane,
  expirationDateDraft,
  expirationHourDraft,
  expirationMinuteDraft,
  expirationPeriodDraft,
  effectiveExpiration,
  expirationHint,
  readonlyExpirationAt,
  onDateChange,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
}: {
  lane: OwnerBountyLane;
  expirationDateDraft: string;
  expirationHourDraft: string;
  expirationMinuteDraft: string;
  expirationPeriodDraft: "AM" | "PM";
  effectiveExpiration: string;
  expirationHint: ExpirationHint;
  readonlyExpirationAt?: string | null;
  onDateChange: (value: string) => void;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onPeriodChange: (value: "AM" | "PM") => void;
}) {
  const selectedDate = parseDraftDate(expirationDateDraft);
  const hasCompleteDateTime = Boolean(selectedDate && expirationHourDraft && expirationMinuteDraft && expirationPeriodDraft);
  const triggerLabel = selectedDate
    ? `${format(selectedDate, "PPP")} ${expirationHourDraft}:${expirationMinuteDraft} ${expirationPeriodDraft}`
    : "Pick date and time";
  const timeSlotValue = toTimeSlotValue(expirationHourDraft, expirationMinuteDraft, expirationPeriodDraft);

  return (
    <div className="space-y-2">
      {lane === "backlog" ? (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Expiration time</Label>
          <span className="text-xs text-muted-foreground">Required</span>
        </div>
      ) : (
        <div className="rounded-md border px-3 py-2.5">
          <div className="text-xs text-muted-foreground">Scheduled time limit</div>
          <div className="mt-1 text-sm font-medium">
            {readonlyExpirationAt ? (formatDateTime(readonlyExpirationAt) ?? "Invalid date") : "No time limit"}
          </div>
        </div>
      )}

      {lane === "backlog" ? (
        <div className="space-y-2">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !hasCompleteDateTime && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="size-4" />
                  <span>{triggerLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="space-y-3 p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        onDateChange(toDateInputValue(date));
                      }
                    }}
                    initialFocus
                  />
                  <div className="grid grid-cols-1 gap-2">
                    <Select
                      value={timeSlotValue}
                      onValueChange={(value) => {
                        const [hour, period] = value.split("-");
                        if (!hour || (period !== "AM" && period !== "PM")) {
                          return;
                        }
                        onHourChange(hour);
                        onMinuteChange("00");
                        onPeriodChange(period);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, index) => {
                          const value = String(index + 1).padStart(2, "0");
                          return (
                            <SelectItem key={`${value}-AM`} value={`${value}-AM`}>
                              {`${value}:00 AM`}
                            </SelectItem>
                          );
                        })}
                        {Array.from({ length: 12 }, (_, index) => {
                          const value = String(index + 1).padStart(2, "0");
                          return (
                            <SelectItem key={`${value}-PM`} value={`${value}-PM`}>
                              {`${value}:00 PM`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {effectiveExpiration ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              <span>{formatDateTime(effectiveExpiration) ?? "Invalid date"}</span>
              {expirationHint ? (
                <span
                  className={
                    expirationHint.tone === "destructive"
                      ? "inline-flex items-center gap-1 text-destructive"
                      : "inline-flex items-center gap-1 text-amber-700 dark:text-amber-400"
                  }
                >
                  <AlertTriangle className="size-3.5" />
                  {expirationHint.text}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-destructive">Pick an expiration date and time (local).</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
