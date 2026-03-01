import type { OwnerBountyLane } from "@/lib/app-types";
import type { ExpirationHint, TimeParts } from "@/components/task-details/types";

const LANE_ORDER: OwnerBountyLane[] = ["backlog", "active", "in_progress", "review", "pending_payout"];

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getExpirationHint(expirationValue?: string): ExpirationHint {
  if (!expirationValue) {
    return null;
  }

  const expiration = new Date(expirationValue);
  if (Number.isNaN(expiration.getTime())) {
    return null;
  }

  const diffMs = expiration.getTime() - Date.now();
  const hours = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60));

  if (diffMs <= 0) {
    return { tone: "destructive", text: `Expiration passed ${hours}h ago` };
  }

  if (diffMs <= 1000 * 60 * 60 * 24) {
    return { tone: "warning", text: `Expiration approaching (${hours}h left)` };
  }

  return null;
}

export function laneIndex(lane: OwnerBountyLane) {
  return LANE_ORDER.indexOf(lane);
}

export function toLocalDateInputValue(iso?: string | null) {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toTimeParts(iso?: string | null): TimeParts {
  if (!iso) {
    return { hour: "09", minute: "00", period: "AM" };
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { hour: "09", minute: "00", period: "AM" };
  }
  const hours24 = date.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 || 12;
  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
    period,
  };
}

export function buildIsoFromLocalParts(dateValue: string, hour: string, minute: string, period: "AM" | "PM") {
  if (!dateValue) {
    return "";
  }
  const [yearStr, monthStr, dayStr] = dateValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour12 = Number(hour);
  const minuteNum = Number(minute);
  if (![year, month, day, hour12, minuteNum].every(Number.isFinite)) {
    return "";
  }
  let hour24 = hour12 % 12;
  if (period === "PM") {
    hour24 += 12;
  }
  const localDate = new Date(year, month - 1, day, hour24, minuteNum, 0, 0);
  if (Number.isNaN(localDate.getTime())) {
    return "";
  }
  return localDate.toISOString();
}
