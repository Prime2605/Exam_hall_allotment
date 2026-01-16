"use client";
import React, { useEffect, useState } from "react";

interface Allotment {
    id: number;
    student_reg: string;
    student_name: string;
    exam_subject: string;
    exam_date: string;
    hall_name: string;
    seat_number: number;
}

export default function ResultsPage() {
    const [data, setData] = useState<Allotment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const res = await fetch("/api/allotments");
            if (res.ok) {
                setData(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Allotment Results</h1>
                <div className="space-x-4">
                    <a href="/api/reports/excel" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium hover:no-underline">Download Excel</a>
                    <a href="/api/reports/pdf" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium hover:no-underline">Download PDF</a>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.student_reg}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.student_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{row.exam_subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.exam_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-blue-600">{row.hall_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 bg-gray-50 text-center font-bold">
                                    {row.seat_number}
                                </td>
                            </tr>
                        ))}
                        {!loading && data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No allotments found. Run the allotment process first.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
