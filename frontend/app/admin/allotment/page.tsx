"use client";
import React, { useState } from "react";

export default function AllotmentPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const runAllotment = async () => {
        setLoading(true);
        setLogs([]);
        try {
            const res = await fetch("/api/allot", { method: "POST" });
            const data = await res.json();
            if (data.status === "success" && data.log) {
                setLogs(data.log);
            } else {
                setLogs(["❌ Failed: " + (data.message || "Unknown error")]);
            }
        } catch {
            setLogs(["❌ Network Error - Check if backend is running"]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Run Allotment</h1>
                <p className="text-[var(--text-muted)]">Execute the automatic seat allocation algorithm</p>
            </div>

            {/* Action Card */}
            <div className="glass-card p-8 text-center mb-8" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 30, 50, 0.7) 100%)" }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center text-4xl">
                    ⚡
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    Ready to Generate Seating Plan?
                </h2>
                <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                    This will process all configured exams and students, and automatically assign seats in the available halls ensuring no adjacent same-subject conflicts.
                </p>

                <button
                    onClick={runAllotment}
                    disabled={loading}
                    className={`btn text-lg px-10 py-4 ${loading ? "bg-gray-600 cursor-wait" : "btn-success animate-pulse-glow"}`}
                >
                    {loading ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            Running Algorithm...
                        </>
                    ) : (
                        <>
                            <span>🚀</span>
                            Run Auto-Allotment
                        </>
                    )}
                </button>
            </div>

            {/* Terminal Log */}
            {logs.length > 0 && (
                <div className="terminal">
                    <div className="terminal-header">
                        <div className="terminal-dot bg-red-500"></div>
                        <div className="terminal-dot bg-yellow-500"></div>
                        <div className="terminal-dot bg-green-500"></div>
                        <span className="text-[var(--text-muted)] text-sm ml-3 font-medium">Allotment Log</span>
                    </div>
                    <div className="terminal-body">
                        {logs.map((log, i) => (
                            <div key={i} className="py-0.5">{log}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                            <div className="font-medium text-[var(--text-primary)] text-sm">Prerequisites</div>
                            <div className="text-xs text-[var(--text-muted)]">Students, Exams & Halls configured</div>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔀</span>
                        <div>
                            <div className="font-medium text-[var(--text-primary)] text-sm">Algorithm</div>
                            <div className="text-xs text-[var(--text-muted)]">No same subjects sit adjacent</div>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <div className="font-medium text-[var(--text-primary)] text-sm">Output</div>
                            <div className="text-xs text-[var(--text-muted)]">View results in Results page</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
