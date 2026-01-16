"use client";
import React, { useState, useEffect } from "react";

interface Hall {
    id: number;
    name: string;
    capacity: number;
}

export default function HallManagementPage() {
    const [halls, setHalls] = useState<Hall[]>([]);
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = async () => {
        const res = await fetch("/api/halls");
        if (res.ok) {
            setHalls(await res.json());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/halls", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, capacity: parseInt(capacity) }),
        });

        if (res.ok) {
            setName("");
            setCapacity("");
            fetchHalls();
        } else {
            alert("Failed to create hall");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure?")) {
            await fetch(`/api/halls/${id}`, { method: "DELETE" });
            fetchHalls();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Exam Halls</h1>

            {/* Add Hall Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Hall</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hall Name / Number</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                            placeholder="e.g. Room 101"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border"
                            placeholder="30"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                    >
                        Add Hall
                    </button>
                </form>
            </div>

            {/* Halls List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {halls.map((hall) => (
                            <tr key={hall.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hall.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hall.capacity} Seats</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(hall.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {halls.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    No halls configured yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
