"use client";

import { useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AddTrustedWorkersInputItem, PersonBasicInfo } from "@/lib/app-types";

export type TrustedWorkerRecommendation = {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
};

type TrustedWorkerDraft = {
  key: string;
  email: string;
  label: string;
  initials: string;
  avatarUrl?: string;
};

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getEmailInitials(email: string) {
  const localPart = email.split("@")[0] ?? email;
  return localPart.slice(0, 2).toUpperCase();
}

function extractEmails(input: string) {
  const matches = input.match(EMAIL_REGEX);
  if (matches) {
    return Array.from(new Set(matches.map((email) => email.toLowerCase())));
  }

  const tokens = input
    .split(/[\s,;]+/)
    .map((token) => token.trim().replace(/^<|>$/g, ""))
    .filter(Boolean);

  return Array.from(new Set(tokens.filter(isValidEmail).map((email) => email.toLowerCase())));
}

function buildDraftFromEmail(email: string, recommendations: TrustedWorkerRecommendation[]) {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    return null;
  }
  const rec = recommendations.find((worker) => worker.email.toLowerCase() === normalized);
  if (rec) {
    return {
      key: rec.id,
      email: rec.email,
      label: rec.name,
      initials: rec.initials || getEmailInitials(rec.email),
      avatarUrl: rec.avatarUrl,
    } satisfies TrustedWorkerDraft;
  }
  return {
    key: normalized,
    email: normalized,
    label: normalized,
    initials: getEmailInitials(normalized),
  } satisfies TrustedWorkerDraft;
}

export function TrustedWorkerPickerDialog({
  open,
  onOpenChange,
  existingEmails,
  recommendations = [],
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  recommendations?: TrustedWorkerRecommendation[] | PersonBasicInfo[];
  onDone: (workers: AddTrustedWorkersInputItem[]) => Promise<void> | void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState<TrustedWorkerDraft[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const recommendationItems: TrustedWorkerRecommendation[] = useMemo(
    () =>
      recommendations.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        initials: item.initials,
      })),
    [recommendations],
  );
  const selectedEmails = useMemo(
    () => new Set(selectedWorkers.map((worker) => worker.email.toLowerCase())),
    [selectedWorkers],
  );
  const existingEmailSet = useMemo(
    () => new Set(existingEmails.map((email) => email.toLowerCase())),
    [existingEmails],
  );

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) {
      return [];
    }
    return recommendationItems
      .filter((worker) => !!worker.email)
      .filter((worker) => !existingEmailSet.has(worker.email.toLowerCase()))
      .filter((worker) => !selectedEmails.has(worker.email.toLowerCase()))
      .filter(
        (worker) =>
          worker.name.toLowerCase().includes(query) || worker.email.toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [existingEmailSet, inputValue, recommendationItems, selectedEmails]);

  const showSuggestions = isFocused && inputValue.trim().length > 0 && suggestions.length > 0;

  const addDraft = (draft: TrustedWorkerDraft | null) => {
    if (!draft || existingEmailSet.has(draft.email.toLowerCase())) {
      return;
    }
    setSelectedWorkers((current) => {
      if (current.some((item) => item.email.toLowerCase() === draft.email.toLowerCase())) {
        return current;
      }
      return [...current, draft];
    });
  };

  const addSuggestion = (worker: TrustedWorkerRecommendation) => {
    addDraft(buildDraftFromEmail(worker.email, recommendationItems));
    setInputValue("");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const commitInput = () => {
    const raw = inputValue.trim();
    if (!raw) {
      return;
    }

    if (suggestions.length > 0 && suggestions[highlightedIndex] && !/[,\s;]+/.test(raw)) {
      addSuggestion(suggestions[highlightedIndex]);
      return;
    }

    const emails = extractEmails(raw);
    emails.forEach((email) => addDraft(buildDraftFromEmail(email, recommendationItems)));
    setInputValue("");
    setHighlightedIndex(0);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    const emails = extractEmails(pasted);
    if (emails.length === 0) {
      return;
    }
    event.preventDefault();
    emails.forEach((email) => addDraft(buildDraftFromEmail(email, recommendationItems)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && showSuggestions) {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp" && showSuggestions) {
      event.preventDefault();
      setHighlightedIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab" || event.key === "," || event.key === ";") {
      if (inputValue.trim()) {
        event.preventDefault();
        commitInput();
      }
      return;
    }
    if (event.key === "Backspace" && !inputValue && selectedWorkers.length > 0) {
      setSelectedWorkers((current) => current.slice(0, -1));
      return;
    }
    if (event.key === "Escape") {
      setIsFocused(false);
    }
  };

  const resetLocalState = () => {
    setInputValue("");
    setSelectedWorkers([]);
    setIsFocused(false);
    setHighlightedIndex(0);
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetLocalState();
    }
  };

  const handleDone = async () => {
    if (inputValue.trim()) {
      const pending = extractEmails(inputValue);
      pending.forEach((email) => addDraft(buildDraftFromEmail(email, recommendationItems)));
      setInputValue("");
    }

    const draftsToSubmit = (() => {
      const pendingFromInput = extractEmails(inputValue).map((email) => buildDraftFromEmail(email, recommendationItems)).filter(Boolean) as TrustedWorkerDraft[];
      const merged = [...selectedWorkers];
      for (const pending of pendingFromInput) {
        if (!merged.some((item) => item.email.toLowerCase() === pending.email.toLowerCase())) {
          merged.push(pending);
        }
      }
      return merged;
    })();

    if (draftsToSubmit.length === 0) {
      handleOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onDone(
        draftsToSubmit.map((worker) => ({
          email: worker.email,
          name: worker.label,
          initials: worker.initials,
        })),
      );
      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Trusted Workers</DialogTitle>
          <DialogDescription>
            Paste one or more emails or select from recommendations. Selected workers become pills.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Multi-paste supported: comma, space, semicolon, or newline separated emails.
          </div>

          <div className="relative">
            <div
              className={cn(
                "min-h-11 rounded-md border bg-background px-2 py-1.5 flex flex-wrap items-center gap-2",
                isFocused && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
              onClick={() => inputRef.current?.focus()}
            >
              {selectedWorkers.map((worker) => (
                <div
                  key={worker.key}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border bg-muted pl-1 pr-2 py-1 text-sm"
                >
                  <Avatar className="h-6 w-6 border">
                    {worker.avatarUrl ? <AvatarImage src={worker.avatarUrl} alt={worker.label} /> : null}
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {worker.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-44">{worker.label}</span>
                  {worker.label !== worker.email ? (
                    <span className="truncate max-w-52 text-xs text-muted-foreground">{worker.email}</span>
                  ) : null}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground leading-none"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedWorkers((current) => current.filter((item) => item.key !== worker.key));
                    }}
                    aria-label={`Remove ${worker.email}`}
                  >
                    &times;
                  </button>
                </div>
              ))}

              <input
                ref={inputRef}
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value);
                  setIsFocused(true);
                  setHighlightedIndex(0);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                placeholder={selectedWorkers.length === 0 ? "Type a name or paste emails..." : ""}
                className="flex-1 min-w-[180px] bg-transparent outline-none text-sm"
              />
            </div>

            {showSuggestions ? (
              <div className="absolute z-20 mt-2 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
                <div className="max-h-72 overflow-auto py-1">
                  {suggestions.map((worker, index) => (
                    <button
                      key={worker.id}
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-accent",
                        index === highlightedIndex && "bg-accent",
                      )}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        addSuggestion(worker);
                      }}
                    >
                      <Avatar className="h-8 w-8 border">
                        {worker.avatarUrl ? <AvatarImage src={worker.avatarUrl} alt={worker.name} /> : null}
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {worker.initials || getEmailInitials(worker.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{worker.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{worker.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>New workers queued</span>
            <Badge variant="secondary">{selectedWorkers.length}</Badge>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleDone()} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
