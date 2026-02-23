"use client";

import { useState, use, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrustedWorkerPickerDialog } from "@/components/trusted-worker-picker-dialog";
import { useAppActions, useAppState } from "@/lib/app-state";
import type { UpdatePropertyInput } from "@/lib/app-types";

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const state = useAppState();
    const actions = useAppActions();

    const property = state.properties.find((p) => p.id === id) ?? state.properties[0];
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editForm, setEditForm] = useState<UpdatePropertyInput | null>(null);
    const [isAddTrustedWorkerOpen, setIsAddTrustedWorkerOpen] = useState(false);

    if (!property) {
        return <div className="text-sm text-muted-foreground">No property found.</div>;
    }

    const handleSaveDetails = async () => {
        if (!editForm) {
            return;
        }
        await actions.updateProperty(property.id, editForm);
        setEditForm(null);
        setIsEditingDetails(false);
    };

    const handleCancelDetails = () => {
        setEditForm(null);
        setIsEditingDetails(false);
    };

    const handleInstructionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        void actions.updatePropertyInstructions(property.id, e.target.value);
    };

    const currentEditForm = editForm ?? {
        address: property.address,
        city: property.city,
        zipCode: property.zipCode,
        gateCode: property.gateCode,
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                        &larr; Back
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Property Management</h2>
                </div>
                <Badge variant="outline" className="font-mono bg-muted">ID: {property.id}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle>Property Details</CardTitle>
                                <CardDescription>Core information about this location.</CardDescription>
                            </div>
                            {!isEditingDetails && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditForm({
                                            address: property.address,
                                            city: property.city,
                                            zipCode: property.zipCode,
                                            gateCode: property.gateCode,
                                        });
                                        setIsEditingDetails(true);
                                    }}
                                >
                                    Edit Details
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditingDetails ? (
                                <div className="grid gap-4 bg-muted/20 p-4 rounded-md border border-dashed">
                                    <div className="grid gap-2">
                                        <Label htmlFor="address">Address line</Label>
                                        <Input id="address" value={currentEditForm.address} onChange={(e) => setEditForm({ ...currentEditForm, address: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" value={currentEditForm.city} onChange={(e) => setEditForm({ ...currentEditForm, city: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="zipCode">Postal/Zip Code</Label>
                                            <Input id="zipCode" value={currentEditForm.zipCode} onChange={(e) => setEditForm({ ...currentEditForm, zipCode: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gateCode">Gate/Access Code</Label>
                                        <Input id="gateCode" value={currentEditForm.gateCode} onChange={(e) => setEditForm({ ...currentEditForm, gateCode: e.target.value })} />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="ghost" onClick={handleCancelDetails}>Cancel</Button>
                                        <Button onClick={() => void handleSaveDetails()}>Save Changes</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-y-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground mb-1">Address</div>
                                        <div className="font-medium">{property.address}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">City</div>
                                        <div className="font-medium">{property.city}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">Postal/Zip Code</div>
                                        <div className="font-medium">{property.zipCode}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">Gate/Access Code</div>
                                        <div className="font-mono bg-muted inline-block px-2 py-0.5 rounded text-sm">{property.gateCode}</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                                value={property.instructions}
                                onChange={handleInstructionChange}
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-right">Changes are saved automatically.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Property Images</CardTitle>
                                <CardDescription>Photos used to identify the location.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">Add Image</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="aspect-video relative rounded-md overflow-hidden bg-muted group border border-border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={property.image} alt="Primary property look" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all" />
                                    <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button variant="destructive" size="sm">Remove</Button>
                                    </div>
                                    <Badge className="absolute top-2 left-2 bg-background/80 text-foreground backdrop-blur pointer-events-none">Primary</Badge>
                                </div>
                                <div className="aspect-video rounded-md border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/10 hover:border-muted-foreground/50 transition-colors cursor-pointer">
                                    <span className="text-2xl mb-1">+</span>
                                    <span className="text-xs">Upload</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="bg-muted aspect-square relative border-b w-full grayscale opacity-80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={state.ui.mapPreviewImage}
                                alt="Map View"
                                className="object-cover w-full h-full opacity-60 mix-blend-multiply"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-primary/30 shadow-lg animate-pulse" />
                            </div>

                            <div className="absolute bottom-2 right-2 flex gap-1">
                                <Button size="icon" variant="secondary" className="h-6 w-6 rounded text-xs">+</Button>
                                <Button size="icon" variant="secondary" className="h-6 w-6 rounded text-xs">-</Button>
                            </div>
                        </div>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base">Location</CardTitle>
                            <CardDescription className="text-xs">{property.address}</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-base">Whitelisted Workers</CardTitle>
                            <Badge variant="secondary">{property.whitelistedWorkers.length}</Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {property.whitelistedWorkers.map(worker => (
                                    <div key={worker.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 rounded-md border">
                                                <AvatarFallback className="text-xs rounded-md bg-primary/10 text-primary">{worker.initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-medium">{worker.name}</div>
                                                <div className="text-xs text-muted-foreground">Trusted Provider</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                            &times;
                                        </Button>
                                    </div>
                                ))}

                                <Separator />

                                <Button
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => setIsAddTrustedWorkerOpen(true)}
                                >
                                    + Add Trusted Worker
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <TrustedWorkerPickerDialog
                open={isAddTrustedWorkerOpen}
                onOpenChange={setIsAddTrustedWorkerOpen}
                existingEmails={[
                    ...state.workers
                        .filter((worker) => property.whitelistedWorkers.some((trusted) => trusted.id === worker.id))
                        .map((worker) => worker.email),
                    ...property.whitelistedWorkers
                        .map((worker) => worker.name)
                        .filter((name) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)),
                ]}
                onDone={async (workers) => {
                    await actions.addTrustedWorkers(property.id, workers);
                }}
            />
        </div>
    );
}
