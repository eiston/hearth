import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TaskSummaryCard({
  type,
  proofPhotosUploaded,
  propertyAddress,
}: {
  type: string;
  proofPhotosUploaded: number;
  propertyAddress?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Task Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Type</span>
          <span>{type}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Proof Photos</span>
          <span>{proofPhotosUploaded}</span>
        </div>
        {propertyAddress ? (
          <>
            <Separator />
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Property</div>
              <div className="text-sm font-medium">{propertyAddress}</div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
