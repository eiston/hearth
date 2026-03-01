"use client";

import { useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DayButton as RdpDayButton, type DayButtonProps } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";

export function FinancialsDashboard() {
    const { ownerFinancials, pendingPayouts, taskReminders } = useAppState();
    const router = useRouter();
    const reminderGroupRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const remindersByDate = useMemo(() => {
        const groups = new Map<
            string,
            {
                date: Date;
                reminders: typeof taskReminders;
            }
        >();

        for (const reminder of taskReminders) {
            const key = reminder.dueDateISO;
            const parsed = parseISO(key);
            const existing = groups.get(key);
            if (existing) {
                existing.reminders.push(reminder);
                continue;
            }
            groups.set(key, { date: parsed, reminders: [reminder] });
        }

        return Array.from(groups.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => ({ key, ...value }));
    }, [taskReminders]);

    const reminderCountByDate = useMemo(() => {
        return remindersByDate.reduce<Record<string, number>>((acc, group) => {
            acc[group.key] = group.reminders.length;
            return acc;
        }, {});
    }, [remindersByDate]);

    const [selectedReminderDate, setSelectedReminderDate] = useState<Date | undefined>(
        remindersByDate[0]?.date
    );

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
    };

    const handleReminderDateSelect = (date: Date | undefined) => {
        setSelectedReminderDate(date);
        if (!date) return;

        const key = format(date, "yyyy-MM-dd");
        reminderGroupRefs.current[key]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const ReminderDayButton = ({ day, modifiers, className, children, ...props }: DayButtonProps) => {
        const count = reminderCountByDate[day.isoDate] ?? 0;

        return (
            <RdpDayButton
                day={day}
                modifiers={modifiers}
                className={cn(className, count > 0 && "relative")}
                {...props}
            >
                {children}
                {count > 0 && (
                    <span className="pointer-events-none absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold leading-4 text-white">
                        {count}
                    </span>
                )}
            </RdpDayButton>
        );
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
                        <div className="overflow-hidden rounded-lg border bg-muted/20">
                            <div className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedReminderDate}
                                onSelect={handleReminderDateSelect}
                                defaultMonth={selectedReminderDate}
                                components={{ DayButton: ReminderDayButton }}
                            />
                            </div>
                        </div>

                        <div className="max-h-72 overflow-y-auto rounded-lg border bg-background p-3">
                            <div className="space-y-4 pr-1">
                            {remindersByDate.map((group) => (
                                <div
                                    key={group.key}
                                    ref={(node) => {
                                        reminderGroupRefs.current[group.key] = node;
                                    }}
                                    className="scroll-mt-4"
                                >
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {format(group.date, "EEEE, MMM d")}
                                    </div>
                                    <div className="space-y-3">
                                        {group.reminders.map((reminder) => (
                                            <div key={reminder.id} className="flex justify-between items-start rounded-md border p-3">
                                                <div>
                                                    <div className="font-medium">{reminder.title}</div>
                                                    <div className="text-sm text-muted-foreground">{reminder.propertiesLabel}</div>
                                                </div>
                                                <div className="ml-3 flex items-center gap-2">
                                                    <Badge variant={reminder.badgeVariant}>{reminder.badgeLabel}</Badge>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon-xs"
                                                        aria-label={`Create bounty from reminder: ${reminder.title}`}
                                                        title="Create bounty from reminder"
                                                        onClick={() => router.push(`/tasks/new?reminder=${encodeURIComponent(reminder.id)}`)}
                                                    >
                                                        <Plus />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    </CardContent>
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
