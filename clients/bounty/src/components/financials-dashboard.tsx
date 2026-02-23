"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/lib/app-state";

export function FinancialsDashboard() {
    const { ownerFinancials, pendingPayouts, taskReminders } = useAppState();

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Spent</CardTitle>
                        <CardDescription>Year to date</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold font-mono">${ownerFinancials.totalSpentYtd.toLocaleString()}.00</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Task Reminders</CardTitle>
                        <CardDescription>Automated seasonal prompts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {taskReminders.map((reminder, index) => (
                            <div key={reminder.id} className={`flex justify-between items-start ${index < taskReminders.length - 1 ? "border-b pb-4" : ""}`}>
                                <div>
                                    <div className="font-medium">{reminder.title}</div>
                                    <div className="text-sm text-muted-foreground">{reminder.propertiesLabel}</div>
                                </div>
                                <Badge variant={reminder.badgeVariant}>{reminder.badgeLabel}</Badge>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Create Bounty from Reminders</Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Payouts</CardTitle>
                        <CardDescription>
                            Use the &quot;Copy Email&quot; button to send an e-transfer manually.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Worker</TableHead>
                                    <TableHead>Task & Property</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingPayouts.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell className="font-medium">{payout.worker}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{payout.task}</div>
                                            <div className="text-xs text-muted-foreground">{payout.property}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium">${payout.amount}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="secondary" size="sm" onClick={() => handleCopyEmail(payout.email)}>
                                                Copy Email
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pendingPayouts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                            No pending payouts.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
