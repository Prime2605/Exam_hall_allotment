"use client";
import React, { useEffect, useState } from "react";

interface Student {
    id: number;
    reg_no: string;
    name: string;
    department: string;
    year: string;
    subjects_registered: string[];
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    useEffect(() => {
        fetchStudents();
    }, [page, pageSize]);

    const fetchStudents = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (deptFilter) params.append("department", deptFilter);
        if (subjectFilter) params.append("subject_code", subjectFilter);
        params.append("skip", String(page * pageSize));
        params.append("limit", String(pageSize));

        const res = await fetch(`/api/students?${params.toString()}`);
        if (res.ok) {
            setStudents(await res.json());
        }
        setLoading(false);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchStudents();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Parsed Students</h1>

            {/* Filter Bar */}
            <form onSubmit={handleFilter} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search (Reg No / Name)</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="e.g. 731125104003"
                        className="w-full rounded-lg border-2 border-gray-400 shadow-sm focus:border-blue-600 focus:ring-blue-600 px-4 py-2 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                        type="text"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full rounded-lg border-2 border-gray-400 shadow-sm focus:border-blue-600 focus:ring-blue-600 px-4 py-2 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                    <input
                        type="text"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        placeholder="e.g. CS25C01"
                        className="w-full rounded-lg border-2 border-gray-400 shadow-sm focus:border-blue-600 focus:ring-blue-600 px-4 py-2 bg-white"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md h-[44px]"
                >
                    Apply Filters
                </button>
            </form>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.reg_no}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.department}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-1 max-w-md">
                                        {s.subjects_registered.map((sub) => (
                                            <span key={sub} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">{sub}</span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && students.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No students found. Try adjusting filters or upload a Student List PDF first.
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
                        Showing {students.length > 0 ? page * pageSize + 1 : 0} - {page * pageSize + students.length}
                    </span>
                    <span className="text-gray-300">|</span>
                    <label className="text-sm text-gray-600">Per page:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                        className="rounded-md border-2 border-gray-400 px-2 py-1 text-sm bg-white focus:border-blue-600"
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
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
                        disabled={students.length < pageSize}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}
