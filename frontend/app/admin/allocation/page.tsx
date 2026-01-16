"use client";

import { useEffect, useState } from "react";
import { FadeIn, StaggerContainer, CountUp, GlowCard } from "../../components/Animations";

interface ExamDate {
    date: string;
    session: string;
    display: string;
}

interface HallStats {
    hall_id: number;
    hall_name: string;
    block: string;
    capacity: number;
    filled: number;
    percentage: number;
}

interface AllocationSummary {
    total_halls: number;
    total_capacity: number;
    total_filled: number;
    overall_percentage: number;
}

interface SeatData {
    id: number;
    roll_no: string;
    name: string;
    department: string;
    seat_label: string;
    color: string;
}

export default function AllocationPage() {
    const [year, setYear] = useState<number>(2);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSession, setSelectedSession] = useState<string>("AN");
    const [examDates, setExamDates] = useState<ExamDate[]>([]);
    const [hallStats, setHallStats] = useState<HallStats[]>([]);
    const [summary, setSummary] = useState<AllocationSummary | null>(null);
    const [selectedHall, setSelectedHall] = useState<string | null>(null);
    const [hallGrid, setHallGrid] = useState<(SeatData | null)[][]>([]);
    const [loading, setLoading] = useState(false);
    const [allocating, setAllocating] = useState(false);

    // Fetch exam dates
    useEffect(() => {
        fetch(`/api/exams/dates?year=${year}`)
            .then(res => res.json())
            .then(data => {
                setExamDates(data);
                if (data.length > 0 && !selectedDate) {
                    setSelectedDate(data[0].date);
                    setSelectedSession(data[0].session);
                }
            })
            .catch(() => { });
    }, [year]);

    // Fetch hall stats
    useEffect(() => {
        setLoading(true);
        fetch(`/api/allocation/stats?year=${year}&date=${selectedDate}&session=${selectedSession}`)
            .then(res => res.json())
            .then(data => {
                setHallStats(data.halls || []);
                setSummary(data.summary);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [year, selectedDate, selectedSession]);

    // Fetch hall grid when selected
    useEffect(() => {
        if (selectedHall) {
            fetch(`/api/allocation/hall/${encodeURIComponent(selectedHall)}?year=${year}`)
                .then(res => res.json())
                .then(data => {
                    setHallGrid(data.grid || []);
                })
                .catch(() => { });
        }
    }, [selectedHall, year]);

    const runAllocation = async () => {
        setAllocating(true);
        try {
            const res = await fetch("/api/allocation/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: selectedDate, session: selectedSession, year })
            });
            const data = await res.json();
            alert(`✅ ${data.message}`);
            // Refresh stats
            const statsRes = await fetch(`/api/allocation/stats?year=${year}`);
            const statsData = await statsRes.json();
            setHallStats(statsData.halls || []);
            setSummary(statsData.summary);
        } catch {
            alert("❌ Allocation failed");
        } finally {
            setAllocating(false);
        }
    };

    const uniqueDates = [...new Set(examDates.map(e => e.date))];

    return (
        <div className="space-y-8">
            {/* Header */}
            <FadeIn>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                            Seat Allocation
                        </h1>
                        <p className="text-[var(--text-muted)]">
                            Live hall tracking & automatic seat assignment
                        </p>
                    </div>
                </div>
            </FadeIn>

            {/* Filters */}
            <FadeIn delay={0.1}>
                <div className="glass-card p-6 border border-[rgba(0,212,255,0.1)]">
                    <div className="flex flex-wrap gap-6 items-end">
                        {/* Year Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                Year
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setYear(1)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${year === 1
                                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                                        }`}
                                >
                                    1st Year
                                </button>
                                <button
                                    onClick={() => setYear(2)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${year === 2
                                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                                        }`}
                                >
                                    2nd Year
                                </button>
                            </div>
                        </div>

                        {/* Date Selector */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                Exam Date
                            </label>
                            <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                title="Select exam date"
                                aria-label="Exam date selector"
                                className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:border-cyan-500 outline-none min-w-[180px]"
                            >
                                {uniqueDates.map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))}
                            </select>
                        </div>

                        {/* Session Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                Session
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedSession("FN")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedSession === "FN"
                                        ? "bg-amber-500 text-white"
                                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                                        }`}
                                >
                                    🌅 FN
                                </button>
                                <button
                                    onClick={() => setSelectedSession("AN")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedSession === "AN"
                                        ? "bg-indigo-500 text-white"
                                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                                        }`}
                                >
                                    🌙 AN
                                </button>
                            </div>
                        </div>

                        {/* Auto-Allocate Button (Admin Only) */}
                        <div className="ml-auto">
                            <button
                                onClick={runAllocation}
                                disabled={allocating}
                                className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {allocating ? (
                                    <>
                                        <span className="animate-spin">⚙️</span>
                                        Allocating...
                                    </>
                                ) : (
                                    <>
                                        ⚡ Auto-Allocate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Summary Stats */}
            {summary && (
                <StaggerContainer stagger={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <GlowCard className="stat-card text-center p-4">
                        <p className="text-3xl font-bold text-[var(--text-primary)]">
                            <CountUp end={summary.total_halls} duration={1} />
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Total Halls</p>
                    </GlowCard>
                    <GlowCard className="stat-card text-center p-4">
                        <p className="text-3xl font-bold text-[var(--text-primary)]">
                            <CountUp end={summary.total_capacity} duration={1} />
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Total Capacity</p>
                    </GlowCard>
                    <GlowCard className="stat-card text-center p-4">
                        <p className="text-3xl font-bold text-green-400">
                            <CountUp end={summary.total_filled} duration={1} />
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Students Allocated</p>
                    </GlowCard>
                    <GlowCard className="stat-card text-center p-4">
                        <p className="text-3xl font-bold text-cyan-400">
                            <CountUp end={summary.overall_percentage} duration={1} suffix="%" />
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Fill Rate</p>
                    </GlowCard>
                </StaggerContainer>
            )}

            {/* Hall Cards Grid */}
            <FadeIn delay={0.3}>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                    Hall Status
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {hallStats.filter(h => h.filled > 0 || h.percentage > 0).slice(0, 20).map((hall) => (
                        <div
                            key={hall.hall_id}
                            onClick={() => setSelectedHall(hall.hall_name)}
                            className={`glass-card p-4 cursor-pointer transition-all hover:scale-105 border-2 ${selectedHall === hall.hall_name
                                ? "border-cyan-500"
                                : "border-transparent hover:border-[rgba(0,212,255,0.3)]"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-[var(--text-primary)]">{hall.hall_name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${hall.percentage >= 80 ? "bg-green-500/20 text-green-400" :
                                    hall.percentage >= 50 ? "bg-yellow-500/20 text-yellow-400" :
                                        hall.percentage > 0 ? "bg-orange-500/20 text-orange-400" :
                                            "bg-gray-500/20 text-gray-400"
                                    }`}>
                                    {hall.percentage}%
                                </span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-2">{hall.block}</p>
                            <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500 w-[${hall.percentage}%]`}
                                />
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                {hall.filled}/{hall.capacity} seats
                            </p>
                        </div>
                    ))}
                </div>
            </FadeIn>

            {/* 5x5 Seat Grid Modal */}
            {selectedHall && hallGrid.length > 0 && (
                <FadeIn delay={0.2}>
                    <div className="glass-card p-6 border border-cyan-500/30">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                                🏛️ {selectedHall} - Seat Layout
                            </h2>
                            <button
                                onClick={() => setSelectedHall(null)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                                ✕ Close
                            </button>
                        </div>

                        {/* Department Legend */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {[
                                { abbr: "CSE", color: "#3B82F6" },
                                { abbr: "IT", color: "#F59E0B" },
                                { abbr: "ECE", color: "#06B6D4" },
                                { abbr: "EEE", color: "#10B981" },
                                { abbr: "MECH", color: "#8B5CF6" },
                                { abbr: "CIVIL", color: "#F97316" },
                                { abbr: "AUTO", color: "#EC4899" },
                            ].map(d => (
                                <div key={d.abbr} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: d.color }} />
                                    <span className="text-xs text-[var(--text-muted)]">{d.abbr}</span>
                                </div>
                            ))}
                        </div>

                        {/* 5x5 Grid */}
                        <div className="flex justify-center">
                            <div className="grid grid-cols-5 gap-3">
                                {hallGrid.flat().map((seat, index) => (
                                    <div
                                        key={index}
                                        className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${seat
                                            ? "hover:scale-110 cursor-pointer shadow-lg"
                                            : "bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-color)]"
                                            }`}
                                        style={{
                                            backgroundColor: seat ? seat.color : undefined,
                                            color: seat ? "white" : undefined
                                        }}
                                        title={seat ? `${seat.name}\n${seat.roll_no}` : "Empty"}
                                    >
                                        {seat ? (
                                            <>
                                                <span className="font-bold">{seat.seat_label}</span>
                                                <span className="text-[10px] opacity-80 truncate max-w-full px-1">
                                                    {seat.roll_no}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[var(--text-muted)]">—</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                            Zigzag Pattern: 13 + 12 = 25 seats per hall
                        </p>
                    </div>
                </FadeIn>
            )}
        </div>
    );
}
