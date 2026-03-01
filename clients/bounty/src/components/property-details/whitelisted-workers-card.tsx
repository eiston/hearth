"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TrustedWorkerRef } from "@/lib/app-types";

type WhitelistedWorkersCardProps = {
    workers: TrustedWorkerRef[];
    onAddTrustedWorker: () => void;
};

export function WhitelistedWorkersCard({ workers, onAddTrustedWorker }: WhitelistedWorkersCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Whitelisted Workers</CardTitle>
                <Badge variant="secondary">{workers.length}</Badge>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {workers.map((worker) => (
                        <div key={worker.id} className="group flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 rounded-md border">
                                    <AvatarFallback className="rounded-md bg-primary/10 text-xs text-primary">
                                        {worker.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-medium">{worker.name}</div>
                                    <div className="text-xs text-muted-foreground">Trusted Provider</div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                &times;
                            </Button>
                        </div>
                    ))}

                    <Separator />

                    <Button variant="outline" className="w-full border-dashed" onClick={onAddTrustedWorker}>
                        + Add Trusted Worker
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
