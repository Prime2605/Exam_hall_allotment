"use client";
import React, { useState } from "react";

export default function AllotmentPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const runAllotment = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/allot", { method: "POST" });
            const data = await res.json();
            if (data.status === "success" && data.log) {
                setLogs(data.log);
            } else {
                setLogs(["❌ Failed: " + (data.message || "Unknown error")]);
            }
        } catch (e) {
            setLogs(["❌ Network Error"]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Allotment Process</h1>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready to Generate Seating Plan?</h2>
                <p className="text-gray-500 mb-8">
                    This will process all configured exams and students, and assign seats in the available halls.
                </p>

                <button
                    onClick={runAllotment}
                    disabled={loading}
                    className={`px-8 py-3 rounded-lg font-bold text-white transition-all
            ${loading ? "bg-gray-400 cursor-wait" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"}
          `}
                >
                    {loading ? "Running Algorithm..." : "Run Auto-Allotment"}
                </button>
            </div>

            {logs.length > 0 && (
                <div className="mt-8 bg-gray-900 rounded-xl p-6 shadow-lg font-mono text-sm text-green-400 overflow-hidden">
                    <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">Process Log</h3>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
