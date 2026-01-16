"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FadeIn, MagneticButton } from "../components/Animations";
import { GradientMesh, NoiseTexture, SpotlightCursor } from "../components/Effects";
import SeatGrid from "../components/SeatGrid";
import ExamPass from "../components/ExamPass";
import BlockCards from "../components/BlockCards";

interface Block {
    key: string;
    name: string;
    icon: string;
    color: string;
    halls: string[];
    filled?: number;
    total?: number;
}

interface Hall {
    name: string;
    blockKey: string;
    filled: number;
    capacity: number;
    departments: string[];
}

interface Student {
    regNo: string;
    rollNo: string;
    name: string;
    department: string;
    color: string;
    yearOfStudy: number;
    hall: string | null;
    block: string | null;
    blockKey?: string | null;
    seat: number | null;
    seatCode: string | null;
    row: number | null;
    col: number | null;
}

interface Seat {
    seatIndex: number;
    student: {
        rollNo: string;
        name: string;
        department: string;
        color: string;
        regNo: string;
    } | null;
}

interface ExamDate {
    date: string;
    session: string;
    display: string;
}

export default function StudentPortal() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [activeBlock, setActiveBlock] = useState<string | null>(null);
    const [activeHall, setActiveHall] = useState<string | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [highlightedSeat, setHighlightedSeat] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // NEW: Year and Date/Session filters (read-only view)
    const [year, setYear] = useState<number>(2);
    const [examDates, setExamDates] = useState<ExamDate[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSession, setSelectedSession] = useState<string>("AN");

    // Load blocks on mount
    useEffect(() => {
        loadBlocks();
    }, []);

    // Load exam dates 
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


    // Load halls when block changes
    useEffect(() => {
        if (activeBlock) {
            loadHalls(activeBlock);
        }
    }, [activeBlock]);

    // Load seats when hall changes
    useEffect(() => {
        if (activeHall) {
            loadSeats(activeHall);
        }
    }, [activeHall]);

    const loadBlocks = async () => {
        try {
            const res = await fetch("/api/blocks");
            const data = await res.json();
            if (data.blocks) {
                setBlocks(data.blocks);
                if (data.blocks.length > 0) {
                    setActiveBlock(data.blocks[0].key);
                }
            }
        } catch (err) {
            console.error("Failed to load blocks:", err);
        }
    };

    const loadHalls = async (blockKey: string) => {
        try {
            const res = await fetch(`/api/halls?block=${blockKey}`);
            const data = await res.json();
            if (data.halls) {
                setHalls(data.halls);
                if (data.halls.length > 0) {
                    setActiveHall(data.halls[0].name);
                }
            }
        } catch (err) {
            console.error("Failed to load halls:", err);
        }
    };

    const loadSeats = async (hallName: string) => {
        try {
            const res = await fetch(`/api/halls/${encodeURIComponent(hallName)}/seats`);
            const data = await res.json();
            if (data.seats) {
                const formattedSeats: Seat[] = data.seats.map((s: any, index: number) => ({
                    seatIndex: index,
                    student: s ? {
                        rollNo: s.rollNo,
                        name: s.name,
                        department: s.department,
                        color: s.color,
                        regNo: s.regNo,
                    } : null,
                }));
                setSeats(formattedSeats);
            }
        } catch (err) {
            console.error("Failed to load seats:", err);
        }
    };

    const handleSearch = async (e: React.FormEvent | React.KeyboardEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/students/${encodeURIComponent(searchQuery.trim())}`);
            if (res.ok) {
                const student = await res.json();
                if (student && student.hall) {
                    setSelectedStudent(student);
                    // Navigate to student's block and hall
                    const targetBlockKey = student.blockKey
                        || blocks.find(b => b.name === student.block)?.key
                        || null;

                    if (targetBlockKey) {
                        setActiveBlock(targetBlockKey);
                    }
                    setTimeout(() => {
                        setActiveHall(student.hall);
                        setHighlightedSeat(student.seat);
                    }, 300);
                } else {
                    setError(student ? "Student not assigned yet. Ask admin to run allocation." : "Student not found");
                    setSelectedStudent(null);
                }
            } else {
                setError("Student not found");
                setSelectedStudent(null);
            }
        } catch {
            setError("Network error - please try again");
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = (seat: Seat) => {
        if (seat.student) {
            setSelectedStudent({
                regNo: seat.student.regNo,
                rollNo: seat.student.rollNo,
                name: seat.student.name,
                department: seat.student.department,
                color: seat.student.color,
                yearOfStudy: 0,
                hall: activeHall,
                block: blocks.find(b => b.key === activeBlock)?.name || null,
                seat: seat.seatIndex,
                seatCode: `R${Math.floor(seat.seatIndex / 5) + 1}C${(seat.seatIndex % 5) + 1}`,
                row: Math.floor(seat.seatIndex / 5) + 1,
                col: (seat.seatIndex % 5) + 1,
            });
            setHighlightedSeat(seat.seatIndex);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Premium Background */}
            <GradientMesh />
            <SpotlightCursor />
            <NoiseTexture opacity={0.02} />

            {/* Header */}
            <header className="student-header sticky top-0 z-50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                            <span className="text-xl">🎓</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                                GCE ERODE
                            </h1>
                            <p className="text-xs text-[var(--text-muted)]">Student Portal</p>
                        </div>
                    </Link>

                    {/* Search */}
                    <div className="flex-1 max-w-md mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by Reg No (e.g., 731125106001)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyUp={handleSearch}
                                className="w-full py-3 px-4 pl-12 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none text-sm"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                            {loading && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin">⏳</span>
                            )}
                        </div>
                        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                    </div>

                    <Link href="/admin" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                        Admin →
                    </Link>
                </div>
            </header>

            {/* Filter Bar (Read-Only for Students) */}
            <div className="bg-[var(--bg-tertiary)]/80 backdrop-blur-sm border-b border-white/5 sticky top-[72px] z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
                    {/* Year Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">Year:</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setYear(1)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${year === 1
                                        ? "bg-cyan-500 text-white"
                                        : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                                    }`}
                            >
                                1st
                            </button>
                            <button
                                onClick={() => setYear(2)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${year === 2
                                        ? "bg-cyan-500 text-white"
                                        : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                                    }`}
                            >
                                2nd
                            </button>
                        </div>
                    </div>

                    {/* Date Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">Date:</span>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            title="Select exam date"
                            aria-label="Exam date selector"
                            className="px-3 py-1 rounded-md text-xs bg-white/5 text-[var(--text-primary)] border border-white/10 focus:border-cyan-500 outline-none"
                        >
                            {[...new Set(examDates.map(e => e.date))].map(date => (
                                <option key={date} value={date}>{date}</option>
                            ))}
                        </select>
                    </div>

                    {/* Session Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">Session:</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setSelectedSession("FN")}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${selectedSession === "FN"
                                        ? "bg-amber-500 text-white"
                                        : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                                    }`}
                            >
                                🌅 FN
                            </button>
                            <button
                                onClick={() => setSelectedSession("AN")}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${selectedSession === "AN"
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                                    }`}
                            >
                                🌙 AN
                            </button>
                        </div>
                    </div>

                    <div className="text-xs text-[var(--text-muted)] ml-auto">
                        📅 Nov/Dec 2025 Exams
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
                {/* Block Cards */}
                <FadeIn>
                    <BlockCards
                        blocks={blocks}
                        activeBlock={activeBlock}
                        onBlockSelect={setActiveBlock}
                    />
                </FadeIn>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
                    {/* Hall List */}
                    <FadeIn delay={0.1}>
                        <div className="glass-card p-4">
                            <h3 className="hall-dept-text text-xs font-semibold uppercase tracking-widest mb-3">
                                🏛 Halls
                            </h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {halls.map((hall) => {
                                    const pct = Math.round((hall.filled / hall.capacity) * 100);
                                    return (
                                        <div
                                            key={hall.name}
                                            onClick={() => setActiveHall(hall.name)}
                                            className={`hall-card p-3 rounded-lg cursor-pointer transition-all border-2 ${activeHall === hall.name ? "border-[#ffd700]" : "border-transparent hover:border-cyan-500/30"
                                                }`}
                                        >
                                            <div className="font-semibold text-sm">{hall.name}</div>
                                            <div className="hall-dept-text text-xs mt-1">
                                                {hall.departments?.join(" + ") || "Empty"}
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)] mt-1">
                                                {hall.filled}/{hall.capacity} seats
                                            </div>
                                            <div className="h-1 bg-gray-800 rounded mt-2 overflow-hidden">
                                                <div
                                                    className="hall-progress-bar h-full rounded"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </FadeIn>

                    {/* Seat Grid */}
                    <FadeIn delay={0.2}>
                        <div className="glass-card">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">{activeHall || "Select a Hall"}</h2>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {activeBlock ? `${blocks.find(b => b.key === activeBlock)?.name || ''} | 25 Seats` : ''}
                                    </p>
                                </div>
                            </div>
                            <SeatGrid
                                seats={seats}
                                highlightedSeat={highlightedSeat}
                                onSeatClick={handleSeatClick}
                            />
                        </div>
                    </FadeIn>

                    {/* Right Panel - Exam Pass */}
                    <FadeIn delay={0.3}>
                        <div className="space-y-4">
                            <ExamPass student={selectedStudent} />
                        </div>
                    </FadeIn>
                </div>
            </main>
        </div>
    );
}
