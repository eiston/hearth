"use client";

import { useState, use, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustedWorkerPickerDialog } from "@/components/trusted-worker-picker-dialog";
import { PropertyDetailsCard } from "@/components/property-details/property-details-card";
import { PropertyImagesCard } from "@/components/property-details/property-images-card";
import { PropertyInstructionsCard } from "@/components/property-details/property-instructions-card";
import { PropertyMapCard } from "@/components/property-details/property-map-card";
import { WhitelistedWorkersCard } from "@/components/property-details/whitelisted-workers-card";
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
                    <PropertyDetailsCard
                        property={property}
                        isEditing={isEditingDetails}
                        currentEditForm={currentEditForm}
                        onStartEdit={() => {
                            setEditForm({
                                address: property.address,
                                city: property.city,
                                zipCode: property.zipCode,
                                gateCode: property.gateCode,
                            });
                            setIsEditingDetails(true);
                        }}
                        onCancel={handleCancelDetails}
                        onSave={() => void handleSaveDetails()}
                        onChange={setEditForm}
                    />

                    <PropertyInstructionsCard
                        instructions={property.instructions}
                        onChange={handleInstructionChange}
                    />

                    <PropertyImagesCard image={property.image} />
                </div>

                <div className="space-y-6">
                    <PropertyMapCard mapPreviewImage={state.ui.mapPreviewImage} />

                    <WhitelistedWorkersCard
                        workers={property.whitelistedWorkers}
                        onAddTrustedWorker={() => setIsAddTrustedWorkerOpen(true)}
                    />
                </div>
            </div>

            <TrustedWorkerPickerDialog
                open={isAddTrustedWorkerOpen}
                onOpenChange={setIsAddTrustedWorkerOpen}
                existingEmails={[
                  ...state.workers
                        .filter((worker) => property.whitelistedWorkers.some((trusted) => trusted.id === worker.id))
                        .map((worker) => worker.email),
                  ...state.globalTrustedWorkers.map((worker) => worker.email),
                ]}
                recommendations={state.globalTrustedWorkers}
                onDone={async (workers) => {
                    await actions.addTrustedWorkers(property.id, workers);
                }}
            />
        </div>
    );
}
