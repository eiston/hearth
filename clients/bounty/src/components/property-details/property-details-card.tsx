"use client";

import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Property, UpdatePropertyInput } from "@/lib/app-types";

type PropertyDetailsCardProps = {
    property: Property;
    isEditing: boolean;
    currentEditForm: UpdatePropertyInput;
    onStartEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onChange: (next: UpdatePropertyInput) => void;
};

export function PropertyDetailsCard({
    property,
    isEditing,
    currentEditForm,
    onStartEdit,
    onCancel,
    onSave,
    onChange,
}: PropertyDetailsCardProps) {
    const updateField =
        (field: keyof UpdatePropertyInput) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            onChange({ ...currentEditForm, [field]: e.target.value });
        };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>Core information about this location.</CardDescription>
                </div>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={onStartEdit}>
                        Edit Details
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="grid gap-4 rounded-md border border-dashed bg-muted/20 p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address line</Label>
                            <Input id="address" value={currentEditForm.address} onChange={updateField("address")} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={currentEditForm.city} onChange={updateField("city")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zipCode">Postal/Zip Code</Label>
                                <Input id="zipCode" value={currentEditForm.zipCode} onChange={updateField("zipCode")} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gateCode">Gate/Access Code</Label>
                            <Input id="gateCode" value={currentEditForm.gateCode} onChange={updateField("gateCode")} />
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                            <Button variant="ghost" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button onClick={onSave}>Save Changes</Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                            <div className="mb-1 text-muted-foreground">Address</div>
                            <div className="font-medium">{property.address}</div>
                        </div>
                        <div>
                            <div className="mb-1 text-muted-foreground">City</div>
                            <div className="font-medium">{property.city}</div>
                        </div>
                        <div>
                            <div className="mb-1 text-muted-foreground">Postal/Zip Code</div>
                            <div className="font-medium">{property.zipCode}</div>
                        </div>
                        <div>
                            <div className="mb-1 text-muted-foreground">Gate/Access Code</div>
                            <div className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-sm">{property.gateCode}</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
