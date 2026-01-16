"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/upload", label: "Upload Data", icon: "📤" },
    { href: "/admin/students", label: "View Students", icon: "👥" },
    { href: "/admin/exams", label: "View Exams", icon: "📅" },
    { href: "/admin/halls", label: "Manage Halls", icon: "🏛️" },
    { href: "/admin/allotment", label: "Run Allotment", icon: "⚡" },
    { href: "/admin/results", label: "View Results", icon: "📋" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 sidebar flex flex-col">
                {/* Brand */}
                <div className="sidebar-brand">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gradient">ExamFlow</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? "active" : ""}`}
                            >
                                <span className="icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
                    <Link
                        href="/student"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[rgba(0,212,255,0.05)] transition-all text-sm"
                    >
                        <span>🎓</span>
                        Student Portal
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto animate-fadeIn">
                    {children}
                </div>
            </main>
        </div>
    );
}
