import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TaskDetailsHeader({
  loading,
  bountyId,
  laneLabel,
  title = "Task Details",
  onBack,
}: {
  loading: boolean;
  bountyId?: string;
  laneLabel?: string;
  title?: string;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          &larr; Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{laneLabel ?? (loading ? "Loading..." : "Task")}</p>
        </div>
      </div>
      {bountyId ? (
        <div className="flex min-w-0 flex-col items-stretch gap-2 sm:items-end">
          <Badge variant="outline" className="font-mono bg-muted">ID: {bountyId}</Badge>
        </div>
      ) : null}
    </div>
  );
}
