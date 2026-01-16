"use client";
import React from "react";

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

interface SeatGridProps {
    seats: Seat[];
    highlightedSeat?: number | null;
    onSeatClick?: (seat: Seat) => void;
}

// Department color mapping
const deptColors: Record<string, { bg: string; border: string; text: string }> = {
    auto: { bg: "rgba(255, 107, 53, 0.3)", border: "#ff6b35", text: "#ff6b35" },
    civil: { bg: "rgba(20, 184, 166, 0.3)", border: "#14b8a6", text: "#14b8a6" },
    cse: { bg: "rgba(0, 102, 255, 0.3)", border: "#0066ff", text: "#66b3ff" },
    eee: { bg: "rgba(57, 255, 20, 0.3)", border: "#39ff14", text: "#39ff14" },
    ece: { bg: "rgba(0, 212, 255, 0.3)", border: "#00d4ff", text: "#00d4ff" },
    mech: { bg: "rgba(168, 85, 247, 0.3)", border: "#a855f7", text: "#a855f7" },
    cseds: { bg: "rgba(255, 105, 180, 0.3)", border: "#ff69b4", text: "#ff69b4" },
    it: { bg: "rgba(255, 215, 0, 0.3)", border: "#ffd700", text: "#ffd700" },
};

export default function SeatGrid({ seats, highlightedSeat, onSeatClick }: SeatGridProps) {
    const getSeatClasses = (seat: Seat) => {
        const baseClasses = "aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 border-2 p-1";

        if (seat.seatIndex === highlightedSeat) {
            return `${baseClasses} seat-highlighted`;
        }

        if (seat.student) {
            const color = seat.student.color?.toLowerCase() || "gray";
            return `${baseClasses} seat-${color}`;
        }

        return `${baseClasses} seat-empty`;
    };

    const getSeatStyle = (seat: Seat) => {
        if (seat.seatIndex === highlightedSeat) {
            return {
                background: "linear-gradient(135deg, #ffd700, #ffa500)",
                borderColor: "#ffd700",
                color: "#0a0a12",
                boxShadow: "0 0 30px #ffd700, 0 0 60px rgba(255, 215, 0, 0.4)",
            };
        }

        if (seat.student) {
            const color = seat.student.color?.toLowerCase() || "gray";
            const colorStyle = deptColors[color] || { bg: "rgba(100,100,100,0.3)", border: "#666", text: "#999" };
            return {
                background: `linear-gradient(135deg, ${colorStyle.bg}, ${colorStyle.bg.replace("0.3", "0.15")})`,
                borderColor: colorStyle.border,
                color: colorStyle.text,
            };
        }

        return {
            background: "rgba(18, 18, 30, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "var(--text-muted)",
        };
    };

    const getSeatLabel = (seat: Seat) => {
        if (!seat.student) return "—";
        return seat.student.department || seat.student.rollNo?.substring(2, 5) || "?";
    };

    const getSeatCode = (index: number) => {
        const row = Math.floor(index / 5) + 1;
        const col = (index % 5) + 1;
        return `R${row}C${col}`;
    };

    return (
        <div className="p-6">
            {/* Invigilator Desk */}
            <div className="invigilator-desk-bar text-center py-3 px-6 rounded-lg font-semibold text-xs uppercase tracking-widest mb-4">
                INVIGILATOR DESK
            </div>

            {/* 5x5 Seat Grid */}
            <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                {seats.map((seat) => (
                    <div
                        key={seat.seatIndex}
                        onClick={() => onSeatClick?.(seat)}
                        className={getSeatClasses(seat)}
                        style={getSeatStyle(seat)}
                    >
                        <div className="text-xs font-semibold text-center leading-tight">
                            {getSeatLabel(seat)}
                        </div>
                        <div className="text-[10px] opacity-60 mt-0.5">
                            {getSeatCode(seat.seatIndex)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center mt-6 pt-4 border-t border-white/10">
                {Object.entries(deptColors).map(([dept, colors]) => (
                    <div key={dept} className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <div
                            className="w-3 h-3 rounded seat-legend-color"
                            style={{ background: colors.bg, borderColor: colors.border }}
                        />
                        <span className="uppercase">{dept}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
