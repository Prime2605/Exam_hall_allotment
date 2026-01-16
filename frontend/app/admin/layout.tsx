import Link from "next/link";
import React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-blue-800 tracking-tight">Admin</h2>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                        Dashboard
                    </Link>
                    <Link href="/admin/upload" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                        Upload Data
                    </Link>
                    <Link href="/admin/students" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                        View Students
                    </Link>
                    <Link href="/admin/exams" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                        View Exams
                    </Link>
                    <Link href="/admin/halls" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                        Manage Halls
                    </Link>
                    <Link href="/admin/allotment" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                        Start Allotment
                    </Link>
                    <Link href="/admin/results" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                        View Results
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
