"use client";
import React from "react";

interface Student {
    regNo: string;
    rollNo: string;
    name: string;
    department: string;
    yearOfStudy: number;
    hall: string | null;
    block: string | null;
    seatCode: string | null;
    row: number | null;
    col: number | null;
}

interface ExamPassProps {
    student: Student | null;
}

export default function ExamPass({ student }: ExamPassProps) {
    if (!student) {
        return (
            <div className="glass-card p-6 text-center text-[var(--text-muted)]">
                <div className="text-4xl mb-3">🎫</div>
                <div className="font-medium">No student selected</div>
                <div className="text-sm">Search for a student to see their exam pass</div>
            </div>
        );
    }

    return (
        <div className="exam-pass rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
            {/* Header */}
            <div className="exam-pass-header p-4 text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest">GCE Erode</h3>
                <p className="text-xs opacity-80 mt-1">Anna University Exams - Nov/Dec 2025</p>
            </div>

            {/* Body */}
            <div className="p-5">
                {/* Student Info */}
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-muted)]">Reg No</span>
                    <span className="font-semibold font-mono">{student.regNo}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-muted)]">Name</span>
                    <span className="font-semibold">{student.rollNo} - {student.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                    <span className="text-[var(--text-muted)]">Department</span>
                    <span className="font-semibold">{student.department} (Year {student.yearOfStudy})</span>
                </div>

                {/* Venue */}
                {student.hall && (
                    <div className="exam-pass-venue rounded-lg p-4 mb-4 text-center">
                        <div className="text-[10px] uppercase text-[var(--text-muted)]">Exam Venue</div>
                        <div className="exam-pass-venue-text text-lg font-bold mt-1">
                            {student.block}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Hall {student.hall}</div>
                    </div>
                )}

                {/* Seat */}
                {student.seatCode && (
                    <div className="exam-pass-seat-box rounded-lg p-4 text-center">
                        <div className="text-[10px] uppercase text-[var(--text-muted)]">Seat Number</div>
                        <div className="exam-pass-seat-number text-4xl font-bold mt-2">
                            {student.seatCode}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                            Row {student.row}, Column {student.col}
                        </div>
                    </div>
                )}

                {/* QR Section */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dashed border-white/10">
                    <div className="exam-pass-qr w-12 h-12 rounded-lg flex items-center justify-center text-[10px] text-gray-700">
                        QR
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                        <span className="exam-pass-verify font-semibold">Scan to verify</span>
                        <br />
                        Show this pass at entrance
                    </div>
                </div>
            </div>
        </div>
    );
}
