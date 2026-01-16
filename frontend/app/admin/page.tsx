"use client";

import { useEffect, useState } from "react";

interface Stats {
    halls: number;
    students: number;
    exams: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ halls: 0, students: 0, exams: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [hallsRes, studentsRes, examsRes] = await Promise.all([
                    fetch("/api/halls"),
                    fetch("/api/students?limit=1"),
                    fetch("/api/exams?limit=1")
                ]);

                const halls = hallsRes.ok ? await hallsRes.json() : [];
                // We'll just count what we can for now
                setStats({
                    halls: Array.isArray(halls) ? halls.length : 0,
                    students: studentsRes.ok ? (await studentsRes.json()).length || 0 : 0,
                    exams: examsRes.ok ? (await examsRes.json()).length || 0 : 0
                });
            } catch {
                // Silent fail, stats will show 0
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
                <p className="text-[var(--text-muted)]">Overview of your exam management system</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Halls Card */}
                <div className="stat-card">
                    <div className="icon bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-400">
                        🏛️
                    </div>
                    <div className="value">{loading ? "..." : stats.halls}</div>
                    <div className="label">Exam Halls</div>
                </div>

                {/* Students Card */}
                <div className="stat-card">
                    <div className="icon bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 text-cyan-400">
                        👥
                    </div>
                    <div className="value">{loading ? "..." : stats.students > 0 ? `${stats.students}+` : "0"}</div>
                    <div className="label">Students Parsed</div>
                </div>

                {/* Exams Card */}
                <div className="stat-card">
                    <div className="icon bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400">
                        📅
                    </div>
                    <div className="value">{loading ? "..." : stats.exams > 0 ? `${stats.exams}+` : "0"}</div>
                    <div className="label">Exams Scheduled</div>
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="glass-card p-6" style={{ background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)" }}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                        👋
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            Welcome to ExamFlow
                        </h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                            Get started by uploading your exam <strong className="text-[var(--accent-primary)]">Timetable PDFs</strong> and <strong className="text-[var(--accent-primary)]">Student Registration PDFs</strong> in the Upload section. Then configure your exam halls and run the auto-allotment algorithm.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a href="/admin/upload" className="btn btn-primary text-sm">
                                <span>📤</span>
                                Upload Data
                            </a>
                            <a href="/admin/halls" className="btn btn-secondary text-sm">
                                <span>🏛️</span>
                                Configure Halls
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/admin/allotment" className="glass-card p-5 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                            ⚡
                        </div>
                        <div>
                            <div className="font-medium text-[var(--text-primary)]">Run Auto-Allotment</div>
                            <div className="text-sm text-[var(--text-muted)]">Generate seating plan automatically</div>
                        </div>
                    </a>
                    <a href="/admin/results" className="glass-card p-5 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <div>
                            <div className="font-medium text-[var(--text-primary)]">View & Export Results</div>
                            <div className="text-sm text-[var(--text-muted)]">Download PDF or Excel reports</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
