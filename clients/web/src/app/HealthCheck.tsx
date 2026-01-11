"use client";

import { useEffect, useState } from "react";

interface HealthCheckProps {
    apiUrl: string;
}

export default function HealthCheck({ apiUrl }: HealthCheckProps) {
    const [health, setHealth] = useState<Record<string, string> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkHealth() {
            try {
                const res = await fetch(`${apiUrl}/health`);
                if (!res.ok) {
                    throw new Error(`Health check failed: ${res.statusText}`);
                }
                const data = await res.json();
                setHealth(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        checkHealth();
    }, [apiUrl]);

    return (
        <div className="w-full p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Backend Status</h2>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-24">API URL:</span>
                    <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-300 break-all">
                        {apiUrl}
                    </code>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-24">Health:</span>
                    {loading ? (
                        <span className="flex items-center gap-2 text-slate-400 italic">
                            <div className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse"></div>
                            Checking...
                        </span>
                    ) : error ? (
                        <span className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                            <div className="w-3 h-3 bg-red-600 dark:bg-red-400 rounded-full"></div>
                            Error: {error}
                        </span>
                    ) : health ? (
                        <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                            <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            Healthy
                        </span>
                    ) : null}
                </div>

                {health && (
                    <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 overflow-auto">
                            {JSON.stringify(health, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
