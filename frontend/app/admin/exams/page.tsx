"use client";
import React, { useEffect, useState } from "react";

interface Exam {
    id: number;
    date: string;
    session: string;
    subject_code: string;
    subject_name: string;
}

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [codeFilter, setCodeFilter] = useState("");
    const [sessionFilter, setSessionFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(100);

    useEffect(() => {
        fetchExams();
    }, [page, pageSize]);

    const fetchExams = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (codeFilter) params.append("subject_code", codeFilter);
        if (sessionFilter) params.append("session", sessionFilter);
        params.append("skip", String(page * pageSize));
        params.append("limit", String(pageSize));

        const res = await fetch(`/api/exams?${params.toString()}`);
        if (res.ok) {
            setExams(await res.json());
        }
        setLoading(false);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchExams();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Parsed Exams</h1>

            {/* Filter Bar */}
            <form onSubmit={handleFilter} className="mb-6 flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                    <input
                        type="text"
                        value={codeFilter}
                        onChange={(e) => setCodeFilter(e.target.value)}
                        placeholder="e.g. CS25"
                        className="w-full rounded-lg border-2 border-gray-400 shadow-sm focus:border-blue-600 focus:ring-blue-600 px-4 py-2 bg-white"
                    />
                </div>
                <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                    <select
                        value={sessionFilter}
                        onChange={(e) => setSessionFilter(e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-400 shadow-sm focus:border-blue-600 focus:ring-blue-600 px-4 py-2 bg-white"
                    >
                        <option value="">All</option>
                        <option value="FN">FN</option>
                        <option value="AN">AN</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                    Filter
                </button>
            </form>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {exams.map((e) => (
                            <tr key={e.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${e.session === "FN" ? "bg-yellow-100 text-yellow-800" : "bg-purple-100 text-purple-800"}`}>
                                        {e.session}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{e.subject_code}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{e.subject_name}</td>
                            </tr>
                        ))}
                        {!loading && exams.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No exams found. Upload a Timetable PDF first.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                        Showing {exams.length > 0 ? page * pageSize + 1 : 0} - {page * pageSize + exams.length}
                    </span>
                    <span className="text-gray-300">|</span>
                    <label className="text-sm text-gray-600">Per page:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                        className="rounded-md border-2 border-gray-400 px-2 py-1 text-sm bg-white focus:border-blue-600"
                    >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                        <option value={500}>500</option>
                    </select>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-5 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={exams.length < pageSize}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}
