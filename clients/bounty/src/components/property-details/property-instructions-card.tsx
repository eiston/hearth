"use client";

import type { ChangeEventHandler } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type PropertyInstructionsCardProps = {
    instructions: string;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
};

export function PropertyInstructionsCard({ instructions, onChange }: PropertyInstructionsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Access & Logistics Instructions</CardTitle>
                <CardDescription>
                    Always-editable notes provided directly to workers when they accept a bounty here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    className="min-h-[120px] resize-none bg-muted/10"
                    placeholder="Enter gate codes, key locations, or specific quirks about the property..."
                    value={instructions}
                    onChange={onChange}
                />
                <p className="mt-2 text-right text-xs text-muted-foreground">Changes are saved automatically.</p>
            </CardContent>
        </Card>
    );
}
