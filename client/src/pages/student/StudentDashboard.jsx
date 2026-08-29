// client/src/pages/student/StudentDashboard.jsx
// Mobile-first per NFR-U-01. Never render teacher name/ITS here or in any
// child component — subject only (FR-SP-02).

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">This Week's Feedback</h1>
        <p className="text-sm text-gray-500">Subject: Science</p>
      </header>
      <main className="rounded-lg bg-white p-4 shadow-sm">
        <p className="text-gray-600">Survey will appear here.</p>
      </main>
    </div>
  );
}