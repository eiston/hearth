"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddPropertyDialog } from "@/components/add-property-dialog";
import { useAppState } from "@/lib/app-state";

export function PropertiesCatalog() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const { properties } = useAppState();

    const filteredProperties = properties.filter(p =>
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search properties by address..."
                        className="pl-9 bg-background w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <AddPropertyDialog>
                    <Button className="w-full sm:w-auto shrink-0">
                        <Plus className="mr-2 h-4 w-4" /> Add Property
                    </Button>
                </AddPropertyDialog>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredProperties.map((property) => (
                    <div
                        key={property.id}
                        className="group cursor-pointer flex flex-col gap-2"
                        onClick={() => router.push(`/properties/${property.id}`)}
                    >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                            <Image
                                src={property.image}
                                alt={property.address}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-base leading-tight truncate">{property.address}</h3>
                            <p className="text-muted-foreground text-sm">{property.city}</p>
                        </div>
                    </div>
                ))}

                {filteredProperties.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No properties found matching &quot;{searchQuery}&quot;
                    </div>
                )}
            </div>
        </div>
    );
}
