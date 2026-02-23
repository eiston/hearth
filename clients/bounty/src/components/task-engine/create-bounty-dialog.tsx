import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import type { Property, TaskTemplate, UiSettings } from "@/lib/app-types";

interface TaskEngineCreateBountyDialogProps {
  properties: Property[];
  taskTemplates: TaskTemplate[];
  ui: UiSettings;
  onCreate: (input: {
    propertyId: string;
    title: string;
    description: string;
    price: number;
    tenantBridgeEnabled: boolean;
    recursiveSchedulingEnabled: boolean;
  }) => Promise<void>;
}

export function TaskEngineCreateBountyDialog({
  properties,
  taskTemplates,
  ui,
  onCreate,
}: TaskEngineCreateBountyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [template, setTemplate] = useState<string>("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id ?? "");
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [recursiveSchedulingEnabled, setRecursiveSchedulingEnabled] = useState(false);
  const [tenantBridgeEnabled, setTenantBridgeEnabled] = useState(true);

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

    await onCreate({
      propertyId: selectedPropertyId,
      title: formTitle.trim(),
      description: formDesc.trim(),
      price: Number(formPrice),
      tenantBridgeEnabled,
      recursiveSchedulingEnabled,
    });

    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
  );
}
