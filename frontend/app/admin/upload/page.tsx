"use client";
import React, { useState, useRef } from "react";

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const timetableRef = useRef<HTMLInputElement>(null);
    const studentRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (type: "timetable" | "students", files: FileList | null) => {
        if (!files || files.length === 0) return;
        setLoading(true);

        const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
        setMessage(`Uploading ${files.length} file(s) (${(totalSize / 1024 / 1024).toFixed(2)} MB)... This may take a moment.`);

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append("files", file);
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 min timeout

            const res = await fetch(`/api/upload/${type}`, {
                method: "POST",
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = await res.json();

            if (res.ok) {
                setMessage(`✅ Successfully parsed ${type}: ${data.parsed_count} records found, ${data.saved_count || 0} new saved.`);
            } else {
                setMessage(`❌ Error: ${data.message || 'Unknown error'}`);
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                setMessage("❌ Upload timed out. Try uploading fewer files at once.");
            } else {
                setMessage("❌ Upload failed. Check if the backend server is running.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Data</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.startsWith("✅") ? "bg-green-100 text-green-800" : message.startsWith("❌") ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timetable Upload */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Exam Timetable PDFs</h2>
                    <p className="text-gray-600 mb-4 text-sm">Upload one or more timetable PDFs (AUCR2017, AUCR2021, AUCR2025, etc.)</p>
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
                        className={`block w-full py-3 px-4 text-center rounded-lg cursor-pointer font-semibold transition ${loading ? "bg-gray-300 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                        {loading ? "Uploading..." : "Select Timetable PDF(s)"}
                    </label>
                </div>

                {/* Student List Upload */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Student List PDFs</h2>
                    <p className="text-gray-600 mb-4 text-sm">Upload one or more student registration preview PDFs</p>
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
                        className={`block w-full py-3 px-4 text-center rounded-lg cursor-pointer font-semibold transition ${loading ? "bg-gray-300 text-gray-500" : "bg-green-600 text-white hover:bg-green-700"}`}
                    >
                        {loading ? "Uploading..." : "Select Student PDF(s)"}
                    </label>
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <strong>Tip:</strong> You can select multiple PDF files at once using Ctrl+Click or Shift+Click.
            </div>
        </div>
    );
}
