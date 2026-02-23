"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useAppActions, useAppState } from "@/lib/app-state";

// Dynamic import with SSR disabled ensures react-leaflet only loads on client
const MapLeaflet = dynamic(() => import("@/components/map-leaflet"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">Loading Map...</div>
});

export function AddPropertyDialog({ children }: { children: React.ReactNode }) {
    const { ui } = useAppState();
    const { addProperty } = useAppActions();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [position, setPosition] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        address: "",
        city: ui.defaultCity,
        zipCode: "",
        gateCode: "",
        instructions: "",
    });

    const resetDialog = () => {
        setStep(1);
        setSearchQuery("");
        setPosition(null);
        setFormData({ address: "", city: ui.defaultCity, zipCode: "", gateCode: "", instructions: "" });
    };

    const handleNext = async () => {
        if (step === 1) {
            // In a real app we might geocode the searchQuery or require a position
            setFormData({ ...formData, address: searchQuery });
            setStep(2);
        } else {
            await addProperty({
                ...formData,
                location: position ? { lat: position.lat, lng: position.lng } : null,
            });
            setOpen(false);
            setTimeout(resetDialog, 300);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset state on close
            setTimeout(() => {
                resetDialog();
            }, 300);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Search for an address and drop a pin on the map." : "Provide specific access details for workers."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address-search">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address-search"
                                        placeholder="Search address (e.g. 123 Main St, Toronto)"
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border h-[300px] w-full overflow-hidden relative bg-muted z-0">
                                <MapLeaflet position={position} setPosition={setPosition} />
                            </div>
                            <p className="text-sm text-muted-foreground flex justify-between">
                                <span>Click the map to place a precise pin.</span>
                                {position && <span className="text-primary font-medium">Pin placed!</span>}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Confirmed Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">Zip/Postal Code</Label>
                                    <Input
                                        id="zipCode"
                                        placeholder="M4J 2T7"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gateCode">Gate Code (Optional)</Label>
                                    <Input
                                        id="gateCode"
                                        placeholder="e.g. 1234#"
                                        value={formData.gateCode}
                                        onChange={(e) => setFormData({ ...formData, gateCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructions">Access Instructions</Label>
                                <Textarea
                                    id="instructions"
                                    placeholder="e.g. Keypad on the back door. Watch out for the dog."
                                    className="resize-none"
                                    rows={3}
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-4">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                            Back
                        </Button>
                    ) : (
                        <div></div> // Placeholder for flex alignment
                    )}
                    <Button onClick={handleNext} disabled={step === 1 && !searchQuery && !position}>
                        {step === 1 ? "Next: Details" : "Save Property"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
