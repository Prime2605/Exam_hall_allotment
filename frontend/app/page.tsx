import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-blue-800 tracking-tight">Exam Hall Allotment</h1>
      <div className="flex gap-8">
        <Link
          href="/student"
          className="px-8 py-4 bg-white shadow-lg rounded-xl flex flex-col items-center hover:shadow-xl transition-shadow border border-gray-100"
        >
          <span className="text-xl font-semibold text-gray-700">Student Portal</span>
          <span className="text-sm text-gray-500 mt-2">Find your seat</span>
        </Link>

        <Link
          href="/admin"
          className="px-8 py-4 bg-blue-600 shadow-lg rounded-xl flex flex-col items-center hover:bg-blue-700 transition-colors text-white"
        >
          <span className="text-xl font-semibold">Admin Dashboard</span>
          <span className="text-sm text-white/80 mt-2">Manage Allotments</span>
        </Link>
      </div>
    </div>
  );
}
