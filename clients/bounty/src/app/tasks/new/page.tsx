"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus, Users } from "lucide-react";
import { ExpirationTimeControl } from "@/components/task-details/expiration-time-control";
import { buildIsoFromLocalParts, formatDateTime, getExpirationHint, toTimeParts } from "@/components/task-details/helpers";
import { TaskDetailsHeader } from "@/components/task-details/task-details-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppActions, useAppLoading, useAppState } from "@/lib/app-state";

type RecurrenceCadence = "daily" | "weekly" | "biweekly" | "monthly";

const RECURRENCE_OPTIONS: Array<{ value: RecurrenceCadence; label: string }> = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Every month" },
];

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = useAppLoading();
  const { properties, taskTemplates, workers, taskReminders } = useAppState();
  const { createBounty, addTaskTemplate } = useAppActions();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prefilledReminderIdRef = useRef<string | null>(null);
  const [template, setTemplate] = useState<string>("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [recursiveSchedulingEnabled, setRecursiveSchedulingEnabled] = useState(false);
  const [recurrenceCadence, setRecurrenceCadence] = useState<RecurrenceCadence>("weekly");
  const initialTimeParts = toTimeParts();
  const [expirationDateDraft, setExpirationDateDraft] = useState("");
  const [expirationHourDraft, setExpirationHourDraft] = useState<string>(initialTimeParts.hour);
  const [expirationMinuteDraft, setExpirationMinuteDraft] = useState<string>(initialTimeParts.minute);
  const [expirationPeriodDraft, setExpirationPeriodDraft] = useState<"AM" | "PM">(initialTimeParts.period);
  const [tenantBridgeEnabled, setTenantBridgeEnabled] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateLabel, setTemplateLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPropertyIds.length === 0 && properties[0]?.id) {
      setSelectedPropertyIds([properties[0].id]);
    }
  }, [properties, selectedPropertyIds.length]);

  useEffect(() => {
    const reminderId = searchParams.get("reminder");
    if (!reminderId || prefilledReminderIdRef.current === reminderId) {
      return;
    }

    const reminder = taskReminders.find((item) => item.id === reminderId);
    if (!reminder) {
      return;
    }

    const reminderPropertyIds =
      Array.isArray(reminder.properties) && reminder.properties.length > 0
        ? reminder.properties.map((property) => property.id)
        : Array.isArray((reminder as { propertyIds?: string[] }).propertyIds)
          ? ((reminder as { propertyIds?: string[] }).propertyIds ?? [])
          : [];

    if (reminderPropertyIds.length > 0 && properties.length === 0) {
      return;
    }

    const validPropertyIds = reminderPropertyIds.filter((propertyId) =>
      properties.some((property) => property.id === propertyId),
    );

    setTemplate("custom");
    setFormTitle(reminder.title);
    if (validPropertyIds.length > 0) {
      setSelectedPropertyIds(validPropertyIds);
    }
    if (!templateLabel.trim()) {
      setTemplateLabel(reminder.title);
    }

    prefilledReminderIdRef.current = reminderId;
  }, [properties, searchParams, taskReminders, templateLabel]);

  const selectedProperties = useMemo(
    () => properties.filter((property) => selectedPropertyIds.includes(property.id)),
    [properties, selectedPropertyIds],
  );

  const whitelistedWorkersById = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        initials: string;
        propertyIds: Set<string>;
      }
    >();

    for (const property of selectedProperties) {
      for (const trusted of property.whitelistedWorkers) {
        const existing = map.get(trusted.id);
        if (existing) {
          existing.propertyIds.add(property.id);
          continue;
        }
        map.set(trusted.id, {
          id: trusted.id,
          name: trusted.name,
          initials: trusted.initials,
          propertyIds: new Set([property.id]),
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedProperties]);

  const trustedOnAllSelected = useMemo(() => {
    if (selectedProperties.length <= 1) {
      return whitelistedWorkersById;
    }
    return whitelistedWorkersById.filter((worker) => worker.propertyIds.size === selectedProperties.length);
  }, [selectedProperties.length, whitelistedWorkersById]);

  const parsedPrice = Number(formPrice);
  const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice >= 0 && formPrice.trim().length > 0;
  const effectiveExpiration = buildIsoFromLocalParts(
    expirationDateDraft,
    expirationHourDraft,
    expirationMinuteDraft,
    expirationPeriodDraft,
  );
  const expirationHint = getExpirationHint(effectiveExpiration);
  const saveTemplateValid = !saveAsTemplate || templateLabel.trim().length > 0;
  const formValid =
    selectedPropertyIds.length > 0 &&
    formTitle.trim().length > 0 &&
    formDesc.trim().length > 0 &&
    hasValidPrice &&
    saveTemplateValid &&
    Boolean(effectiveExpiration);

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
    if (!templateLabel.trim()) {
      setTemplateLabel(match.label);
    }
  };

  const toggleProperty = (propertyId: string) => {
    setSelectedPropertyIds((current) => {
      if (current.includes(propertyId)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((id) => id !== propertyId);
      }
      return [...current, propertyId];
    });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const urls = files.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...urls]);
    event.target.value = "";
  };

  const cadenceLabel = RECURRENCE_OPTIONS.find((option) => option.value === recurrenceCadence)?.label ?? "Every week";

  const handleCreate = async () => {
    if (!formValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (saveAsTemplate) {
        await addTaskTemplate({
          label: templateLabel.trim(),
          title: formTitle.trim(),
          description: formDesc.trim(),
          price: parsedPrice,
        });
      }

      const created = await Promise.all(
        selectedPropertyIds.map((propertyId) =>
          createBounty({
            propertyId,
            title: formTitle.trim(),
            description: formDesc.trim(),
            price: parsedPrice,
            type: "Fixed Price",
            tenantBridgeEnabled,
            recursiveSchedulingEnabled,
            recurrenceCadence: recursiveSchedulingEnabled ? recurrenceCadence : null,
            deadlineAt: effectiveExpiration,
            imageUrls,
          }),
        ),
      );

      if (created.length === 1) {
        router.push(`/tasks/${created[0].id}`);
        return;
      }

      router.push("/?tab=tasks");
    } finally {
      setIsSubmitting(false);
    }
  };

  const trustedWorkerDetails = whitelistedWorkersById.map((trusted) => {
    const fullWorker = workers.find((worker) => worker.id === trusted.id);
    return {
      ...trusted,
      email: fullWorker?.email ?? "No email on file",
      reputation: fullWorker?.reputation,
      propertyCount: trusted.propertyIds.size,
    };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 animate-in fade-in duration-300">
      <TaskDetailsHeader
        loading={loading}
        title="Create Task"
        laneLabel={selectedPropertyIds.length > 1 ? `Bulk Draft (${selectedPropertyIds.length} properties)` : "Backlog Draft"}
        onBack={() => router.push("/?tab=tasks")}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Setup</CardTitle>
              <CardDescription>Build one task and publish it to one or more selected properties.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="template">Task Library (Template)</Label>
                <Select value={template} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="template">
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

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Properties (Multi-select)</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedPropertyIds.length} selected</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPropertyIds(properties.map((property) => property.id))}
                    >
                      Select all
                    </Button>
                  </div>
                </div>

                <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3">
                  {properties.map((property) => {
                    const checked = selectedPropertyIds.includes(property.id);
                    return (
                      <label
                        key={property.id}
                        htmlFor={`property-${property.id}`}
                        className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                      >
                        <Checkbox
                          id={`property-${property.id}`}
                          checked={checked}
                          onCheckedChange={() => toggleProperty(property.id)}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{property.address}</div>
                          <div className="text-xs text-muted-foreground">
                            {property.city} • {property.whitelistedWorkers.length} trusted worker
                            {property.whitelistedWorkers.length === 1 ? "" : "s"}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Task</Label>
                <Input id="title" value={formTitle} onChange={(event) => setFormTitle(event.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={formDesc} onChange={(event) => setFormDesc(event.target.value)} className="min-h-28" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Cost ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formPrice}
                  onChange={(event) => setFormPrice(event.target.value)}
                />
              </div>

              <div className="grid gap-3 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">Task Images</div>
                    <div className="text-xs text-muted-foreground">Reference images copied to each created task.</div>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="size-4" />
                    Upload
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {imageUrls.length === 0 ? (
                  <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    No images uploaded.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {imageUrls.map((src, index) => (
                      <div key={`${src}-${index}`} className="aspect-video overflow-hidden rounded-md border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Draft task image ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
              <CardDescription>Publish now, return to the board, and optionally save this setup as a template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save-template"
                  checked={saveAsTemplate}
                  onCheckedChange={(checked) => setSaveAsTemplate(Boolean(checked))}
                />
                <label htmlFor="save-template" className="text-sm leading-none">
                  Save as template
                </label>
              </div>
              {saveAsTemplate ? (
                <div className="grid gap-2">
                  <Label htmlFor="template-label">Template name</Label>
                  <Input
                    id="template-label"
                    placeholder="e.g. Weekly Yard Cleanup"
                    value={templateLabel}
                    onChange={(event) => setTemplateLabel(event.target.value)}
                  />
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/?tab=tasks")}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleCreate()} disabled={!formValid || isSubmitting}>
                {isSubmitting
                  ? "Creating..."
                  : selectedPropertyIds.length > 1
                    ? `Create ${selectedPropertyIds.length} Tasks`
                    : "Add to Backlog"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
              <CardDescription>These settings will be applied to all created tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-3 rounded-md border p-3">
                <ExpirationTimeControl
                  lane="backlog"
                  expirationDateDraft={expirationDateDraft}
                  expirationHourDraft={expirationHourDraft}
                  expirationMinuteDraft={expirationMinuteDraft}
                  expirationPeriodDraft={expirationPeriodDraft}
                  effectiveExpiration={effectiveExpiration}
                  expirationHint={expirationHint}
                  onDateChange={setExpirationDateDraft}
                  onHourChange={setExpirationHourDraft}
                  onMinuteChange={setExpirationMinuteDraft}
                  onPeriodChange={setExpirationPeriodDraft}
                />
              </div>

              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recursive"
                    checked={recursiveSchedulingEnabled}
                    onCheckedChange={(checked) => setRecursiveSchedulingEnabled(Boolean(checked))}
                  />
                  <label htmlFor="recursive" className="text-sm leading-none">
                    Recursive Scheduling
                  </label>
                </div>

                {recursiveSchedulingEnabled ? (
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="recurrence-cadence">Repeat cadence</Label>
                      <Select value={recurrenceCadence} onValueChange={(value) => setRecurrenceCadence(value as RecurrenceCadence)}>
                        <SelectTrigger id="recurrence-cadence">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECURRENCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Enable recursive scheduling to choose a repeat cadence.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                <CardTitle>Whitelisted Workers</CardTitle>
              </div>
              <CardDescription>Updates based on the selected properties.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                {selectedPropertyIds.length > 1
                  ? `${trustedOnAllSelected.length} worker(s) trusted across all selected properties`
                  : `${trustedWorkerDetails.length} trusted worker(s) on the selected property`}
              </div>

              {trustedWorkerDetails.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No whitelisted workers for the selected properties.
                </div>
              ) : (
                <div className="space-y-2">
                  {trustedWorkerDetails.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-md border">
                          <AvatarFallback className="rounded-md bg-primary/10 text-xs text-primary">
                            {worker.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{worker.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{worker.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {typeof worker.reputation === "number" ? `Rep ${worker.reputation} • ` : ""}
                            {selectedPropertyIds.length > 1
                              ? `Trusted on ${worker.propertyCount}/${selectedPropertyIds.length} selected properties`
                              : "Trusted for selected property"}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div className="text-right text-xs text-muted-foreground">
                          {selectedPropertyIds.length > 1
                            ? `${worker.propertyCount}/${selectedPropertyIds.length}`
                            : "1/1"}
                        </div>
                      </div>
                      {selectedPropertyIds.length > 1 && worker.propertyCount === selectedPropertyIds.length ? (
                        <Badge>All selected</Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{formTitle.trim() || "Task Preview"}</CardTitle>
              <CardDescription>
                {selectedPropertyIds.length > 1 ? `Bulk preview (${selectedPropertyIds.length} tasks)` : "Single task preview"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Price: {hasValidPrice ? `$${parsedPrice}` : "Not set"}
                {recursiveSchedulingEnabled ? ` • ${cadenceLabel}` : ""}
              </div>
              <div className="text-sm text-muted-foreground">
                Expiration: {effectiveExpiration ? (formatDateTime(effectiveExpiration) ?? "Invalid date") : "Required"}
              </div>

              {selectedProperties.length > 1 ? (
                <div className="space-y-2">
                  {selectedProperties.map((property) => (
                    <div key={property.id} className="rounded-md border p-3">
                      <div className="text-sm font-medium">{property.address}</div>
                      <div className="text-xs text-muted-foreground">
                        {property.city} • {hasValidPrice ? `$${parsedPrice}` : "No price"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">{selectedProperties[0]?.address ?? "Select a property"}</div>
                  <div className="text-xs text-muted-foreground">{selectedProperties[0]?.city ?? ""}</div>
                </div>
              )}

              <p className="text-sm leading-6 text-muted-foreground">
                {formDesc.trim() || "Add a description to preview the task content before publishing."}
              </p>
              {imageUrls.length > 0 ? (
                <div className="text-xs text-muted-foreground">{imageUrls.length} image(s) will be attached to each created task.</div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
