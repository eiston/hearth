"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PropertyMapCardProps = {
    mapPreviewImage: string;
};

export function PropertyMapCard({ mapPreviewImage }: PropertyMapCardProps) {
    return (
        <Card className="gap-0 overflow-hidden py-0">
            <div className="relative aspect-square w-full bg-muted grayscale opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={mapPreviewImage}
                    alt="Map View"
                    className="h-full w-full object-cover opacity-60 mix-blend-multiply"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-primary shadow-lg ring-4 ring-primary/30" />
                </div>

                <div className="absolute right-2 bottom-2 flex gap-1">
                    <Button size="icon" variant="secondary" className="h-6 w-6 rounded text-xs">
                        +
                    </Button>
                    <Button size="icon" variant="secondary" className="h-6 w-6 rounded text-xs">
                        -
                    </Button>
                </div>
            </div>
        </Card>
    );
}
