"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PropertyImagesCardProps = {
    image: string;
};

export function PropertyImagesCard({ image }: PropertyImagesCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Property Images</CardTitle>
                    <CardDescription>Photos used to identify the location.</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                    Add Image
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    <div className="group relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image}
                            alt="Primary property look"
                            className="h-full w-full object-cover grayscale transition-all hover:grayscale-0"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button variant="destructive" size="sm">
                                Remove
                            </Button>
                        </div>
                        <Badge className="pointer-events-none absolute top-2 left-2 bg-background/80 text-foreground backdrop-blur">
                            Primary
                        </Badge>
                    </div>
                    <div className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/20 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/10">
                        <span className="mb-1 text-2xl">+</span>
                        <span className="text-xs">Upload</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
