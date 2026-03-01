import { X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PersonBasicInfoCardProps = {
  name?: string;
  email?: string;
  initials?: string;
  title?: string;
  className?: string;
  onRemove?: () => void;
  removeLabel?: string;
};

export function PersonBasicInfoCard({
  name,
  email,
  initials,
  title,
  className,
  onRemove,
  removeLabel,
}: PersonBasicInfoCardProps) {
  return (
    <div className={cn("rounded-lg border bg-muted/20 p-3", className)}>
      {title ? (
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      ) : null}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials ?? "--"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{name ?? "Unnamed user"}</div>
            <div className="truncate text-xs text-muted-foreground">{email ?? "No email"}</div>
          </div>
        </div>
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label={removeLabel ?? `Remove ${email ?? "user"}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
