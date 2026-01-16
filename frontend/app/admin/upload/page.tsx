"use client";
import React, { useState, useRef } from "react";

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
    const timetableRef = useRef<HTMLInputElement>(null);
    const studentRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (type: "timetable" | "students", files: FileList | null) => {
        if (!files || files.length === 0) return;
        setLoading(true);

        const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
        setMessage({ type: "info", text: `Uploading ${files.length} file(s) (${(totalSize / 1024 / 1024).toFixed(2)} MB)...` });

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append("files", file);
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 180000);

            const res = await fetch(`/api/upload/${type}`, {
                method: "POST",
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: `Successfully parsed ${type}: ${data.parsed_count} records found, ${data.saved_count || 0} new saved.` });
            } else {
                setMessage({ type: "error", text: data.message || "Unknown error occurred" });
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                setMessage({ type: "error", text: "Upload timed out. Try uploading fewer files at once." });
            } else {
                setMessage({ type: "error", text: "Upload failed. Check if the backend server is running." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Upload Data</h1>
                <p className="text-[var(--text-muted)]">Upload exam timetables and student registration PDFs</p>
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`alert mb-6 ${message.type === "success" ? "alert-success" : message.type === "error" ? "alert-error" : "alert-info"}`}>
                    <span className="text-xl">
                        {message.type === "success" ? "✓" : message.type === "error" ? "✕" : "⏳"}
                    </span>
                    {message.text}
                </div>
            )}

            {/* Upload Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timetable Upload */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center text-2xl">
                            📅
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Exam Timetable</h2>
                            <p className="text-sm text-[var(--text-muted)]">AUCR2017, AUCR2021, AUCR2025</p>
                        </div>
                    </div>

                    <input
                        type="file"
                        accept=".pdf"
                        multiple
                        ref={timetableRef}
                        onChange={(e) => handleUpload("timetable", e.target.files)}
                        disabled={loading}
                        className="hidden"
                        id="timetable-upload"
                    />
                    <label
                        htmlFor="timetable-upload"
                        className={`upload-zone block ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <div className="text-4xl mb-3">📄</div>
                        <div className="font-medium text-[var(--text-primary)] mb-1">
                            {loading ? "Uploading..." : "Click to select PDF(s)"}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                            or drag and drop files here
                        </div>
                    </label>
                </div>

                {/* Student List Upload */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center text-2xl">
                            👥
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Student Registrations</h2>
                            <p className="text-sm text-[var(--text-muted)]">Registration preview PDFs</p>
                        </div>
                    </div>

                    <input
                        type="file"
                        accept=".pdf"
                        multiple
                        ref={studentRef}
                        onChange={(e) => handleUpload("students", e.target.files)}
                        disabled={loading}
                        className="hidden"
                        id="student-upload"
                    />
                    <label
                        htmlFor="student-upload"
                        className={`upload-zone block ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <div className="text-4xl mb-3">📋</div>
                        <div className="font-medium text-[var(--text-primary)] mb-1">
                            {loading ? "Uploading..." : "Click to select PDF(s)"}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                            or drag and drop files here
                        </div>
                    </label>
                </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 glass-card p-4 flex items-center gap-3">
                <span className="text-xl">💡</span>
                <span className="text-sm text-[var(--text-secondary)]">
                    <strong>Tip:</strong> Select multiple PDF files at once using Ctrl+Click or Shift+Click. Large uploads may take a few moments to process.
                </span>
            </div>
        </div>
    );
}
