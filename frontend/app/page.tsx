import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fadeIn">
        {/* Logo/Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-purple-500/25">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          <span className="text-gradient">ExamFlow</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-md mx-auto">
          Intelligent exam hall seat allocation for university examinations
        </p>

        {/* Navigation Cards */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Student Portal */}
          <Link href="/student" className="group">
            <div className="glass-card px-8 py-6 w-72 text-left hover:border-cyan-500/30">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎓
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Student Portal</h2>
                  <p className="text-sm text-[var(--text-muted)]">Find your seat</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Enter your registration number to instantly find your exam hall and seat assignment.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[var(--accent-primary)] text-sm font-medium">
                Search Now
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Admin Dashboard */}
          <Link href="/admin" className="group">
            <div className="glass-card px-8 py-6 w-72 text-left hover:border-purple-500/30" style={{ background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(30, 30, 50, 0.7) 100%)" }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Admin Dashboard</h2>
                  <p className="text-sm text-[var(--text-muted)]">Manage allotments</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Upload data, configure halls, run the allocation algorithm, and generate reports.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[var(--accent-secondary)] text-sm font-medium">
                Open Dashboard
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-16 text-sm text-[var(--text-muted)]">
          Built for Anna University Examinations
        </p>
      </div>
    </div>
  );
}
