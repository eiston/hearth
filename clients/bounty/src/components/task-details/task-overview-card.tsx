import type { ChangeEvent, RefObject } from "react";
import { ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export function TaskOverviewCard({
  title,
  propertyAddress,
  status,
  boosted,
  displayPrice,
  description,
  descriptionLocked,
  descriptionHelpText,
  onDescriptionChange,
  taskImages,
  fileInputRef,
  onOpenUpload,
  onImageUpload,
}: {
  title: string;
  propertyAddress: string;
  status: string;
  boosted?: boolean;
  displayPrice: number;
  description: string;
  descriptionLocked: boolean;
  descriptionHelpText?: string;
  onDescriptionChange: (value: string) => void;
  taskImages: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onOpenUpload: () => void;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{propertyAddress}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{status}</Badge>
            {boosted ? <Badge>Boosted</Badge> : null}
            <Badge variant="outline">${displayPrice}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-3">
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={description}
            disabled={descriptionLocked}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className="min-h-32"
          />
          <p className="text-xs text-muted-foreground">
            {descriptionHelpText ?? (
              descriptionLocked
                ? "Description is locked once the task is in progress."
                : "Editable before the task moves into progress. (UI-only draft)"
            )}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium">Task Images</div>
              <div className="text-xs text-muted-foreground">Reference photos and progress shots.</div>
            </div>
            <Button size="sm" variant="outline" onClick={onOpenUpload}>
              <ImagePlus className="size-4" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onImageUpload}
            />
          </div>

          {taskImages.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No task images yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {taskImages.map((src, index) => (
                <div key={`${src}-${index}`} className="group relative aspect-video overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Task image ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
