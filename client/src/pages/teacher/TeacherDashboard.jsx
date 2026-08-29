// client/src/pages/teacher/TeacherDashboard.jsx
// Desktop-first per NFR-U-03, with responsive fallback.

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">My Reports</h1>
      </header>
      <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium text-gray-800">Latest Cycle</h2>
          <p className="text-gray-600">Approved reports will appear here.</p>
        </section>
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium text-gray-800">Historical Trend</h2>
          <p className="text-gray-600">Score trend chart will appear here.</p>
        </section>
      </main>
    </div>
  );
}