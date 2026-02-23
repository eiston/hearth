"use client";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertiesCatalog } from "@/components/properties-catalog";
import { TaskEngine } from "@/components/task-engine";
import { FinancialsDashboard } from "@/components/financials-dashboard";

export function OwnerDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Owner Overview</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage your properties, dispatch tasks, and track financials.
                </p>
            </div>

            <Tabs defaultValue="properties" className="space-y-6">
                <TabsList className="bg-muted/50 border">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="tasks">Bounty Engine</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="space-y-4 animate-in fade-in-50 duration-300">
                    <PropertiesCatalog />
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4 animate-in fade-in-50 duration-300">
                    <TaskEngine />
                </TabsContent>

                <TabsContent value="financials" className="space-y-4 animate-in fade-in-50 duration-300">
                    <FinancialsDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
