export type TaskComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  kind?: "user" | "system";
};

export type AvailableWorkerItem = {
  id: string;
  name: string;
  initials: string;
  email?: string;
  reputation?: number;
  trusted: boolean;
};

export type ExpirationHint =
  | {
      tone: "destructive" | "warning";
      text: string;
    }
  | null;

export type TimeParts = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};
