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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = async () => {
        setLoading(true);
        const res = await fetch("/api/halls");
        if (res.ok) {
            setHalls(await res.json());
        }
        setLoading(false);
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
        if (confirm("Are you sure you want to delete this hall?")) {
            await fetch(`/api/halls/${id}`, { method: "DELETE" });
            fetchHalls();
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Manage Halls</h1>
                <p className="text-[var(--text-muted)]">Configure exam halls and their seating capacity</p>
            </div>

            {/* Add Hall Form */}
            <div className="glass-card p-6 mb-8">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span>➕</span> Add New Hall
                </h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className="label">Hall Name / Number</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            placeholder="e.g. Room 101, Hall A"
                        />
                    </div>
                    <div className="w-40">
                        <label className="label">Capacity</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="input"
                            placeholder="e.g. 30"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <span>🏛️</span>
                        Add Hall
                    </button>
                </form>
            </div>

            {/* Halls Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Hall Name</th>
                            <th>Capacity</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {halls.map((hall) => (
                            <tr key={hall.id}>
                                <td className="font-medium text-[var(--text-primary)]">{hall.name}</td>
                                <td>
                                    <span className="badge badge-primary">{hall.capacity} Seats</span>
                                </td>
                                <td className="text-right">
                                    <button
                                        onClick={() => handleDelete(hall.id)}
                                        className="text-[var(--accent-danger)] hover:text-red-400 text-sm font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && halls.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-12 text-[var(--text-muted)]">
                                    <div className="text-4xl mb-3">🏛️</div>
                                    No halls configured yet. Add your first hall above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
