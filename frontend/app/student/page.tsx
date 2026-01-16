"use client";
import React, { useState } from "react";
import Link from "next/link";

interface Allotment {
    subject_code: string;
    subject_name: string;
    date: string;
    session: string;
    hall_name: string;
    seat_number: number;
}

interface StudentResult {
    student: {
        name: string;
        reg_no: string;
        dept: string;
    };
    allotments: Allotment[];
}

export default function StudentPortal() {
    const [regNo, setRegNo] = useState("");
    const [result, setResult] = useState<StudentResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regNo) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`/api/search?reg_no=${regNo}`);
            if (res.ok) {
                setResult(await res.json());
            } else {
                const err = await res.json();
                setError(err.detail || "Student not found");
            }
        } catch {
            setError("Network error - please try again");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md animate-fadeIn">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-purple-500/20 mb-4">
                        <span className="text-3xl">🎓</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Find Your Seat</h1>
                    <p className="text-[var(--text-muted)]">Enter your register number to view your exam hall allocation</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="glass-card p-6 mb-6">
                    <div className="mb-4">
                        <label htmlFor="reg-no" className="label">Register Number</label>
                        <input
                            id="reg-no"
                            type="text"
                            required
                            className="input text-lg py-4"
                            placeholder="e.g. 731125104003"
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn w-full py-4 text-base ${loading ? "bg-gray-600 cursor-wait" : "btn-primary"}`}
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Searching...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Find My Hall
                            </>
                        )}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="alert alert-error mb-6">
                        <span className="text-xl">✕</span>
                        {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="glass-card overflow-hidden animate-slideUp">
                        {/* Student Info Header */}
                        <div className="p-6 border-b border-[rgba(255,255,255,0.05)]" style={{ background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)" }}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                    👤
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">{result.student.name}</h2>
                                    <p className="text-sm text-[var(--text-muted)]">{result.student.reg_no} • {result.student.dept}</p>
                                </div>
                            </div>
                        </div>

                        {/* Allocations */}
                        <div className="divide-y divide-[rgba(255,255,255,0.03)]">
                            {result.allotments.map((allot, idx) => (
                                <div key={idx} className="p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="font-mono text-sm text-[var(--accent-primary)] mb-1">{allot.subject_code}</div>
                                            <div className="text-[var(--text-primary)] font-medium mb-2">{allot.subject_name}</div>
                                            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                                                <span>📅 {allot.date}</span>
                                                <span className={`badge text-xs ${allot.session === "FN" ? "badge-warning" : "badge-secondary"}`}>
                                                    {allot.session}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="badge badge-primary mb-2">{allot.hall_name}</div>
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-[var(--accent-primary)]">{allot.seat_number}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {result.allotments.length === 0 && (
                                <div className="p-8 text-center text-[var(--text-muted)]">
                                    <div className="text-3xl mb-2">📋</div>
                                    No seat allocations yet. Check back after allotment is run.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
