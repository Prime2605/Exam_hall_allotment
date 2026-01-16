export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Halls</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Students Parsed</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Upcoming Exams</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100 text-blue-800">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    👋 Welcome to the Management System
                </h3>
                <p className="mt-2 text-blue-700 leading-relaxed">
                    Start by uploading your <strong>Timetable</strong> and <strong>Student List</strong> PDFs in the 'Upload Data' section. Then configure your Exam Halls.
                </p>
            </div>
        </div>
    );
}
