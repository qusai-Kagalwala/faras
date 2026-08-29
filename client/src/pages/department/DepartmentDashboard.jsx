// client/src/pages/department/DepartmentDashboard.jsx
export default function DepartmentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Report Review</h1>
      </header>
      <main className="p-6">
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium text-gray-800">Pending Approval</h2>
          <p className="text-gray-600">
            Reports awaiting review will appear here, alongside unfiltered admin data.
          </p>
        </section>
      </main>
    </div>
  );
}