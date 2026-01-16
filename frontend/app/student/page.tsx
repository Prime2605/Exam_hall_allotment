"use client";
import React, { useState } from "react";

interface Allotment {
    subject_code: string;
    subject_name: string;
    date: string;
    session: string;
    hall_name: string;
    seat_number: number;
}

interface StudentResult {
    student: {
        name: string;
        reg_no: string;
        dept: string;
    };
    allotments: Allotment[];
}

export default function StudentPortal() {
    const [regNo, setRegNo] = useState("");
    const [result, setResult] = useState<StudentResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regNo) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`/api/search?reg_no=${regNo}`);
            if (res.ok) {
                setResult(await res.json());
            } else {
                const err = await res.json();
                setError(err.detail || "Student not found");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-blue-900">Student Exam Portal</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your register number to find your hall.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSearch}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="reg-no" className="sr-only">Register Number</label>
                            <input
                                id="reg-no"
                                name="reg-no"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg"
                                placeholder="Register Number (e.g. 2017103525)"
                                value={regNo}
                                onChange={(e) => setRegNo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? "Searching..." : "Find My Hall"}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Hall Ticket</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{result.student.name} ({result.student.reg_no})</p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                {result.allotments.map((allotment, idx) => (
                                    <div key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                                        <dt className="text-sm font-medium text-gray-500">
                                            {allotment.subject_code} <br />
                                            <span className="text-xs text-gray-400">{allotment.date} ({allotment.session})</span>
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                                            <span className="font-semibold text-blue-800">{allotment.hall_name}</span>
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Seat {allotment.seat_number}</span>
                                        </dd>
                                    </div>
                                ))}
                                {result.allotments.length === 0 && (
                                    <div className="px-4 py-5 text-sm text-gray-500 text-center">
                                        No exams scheduled yet.
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
