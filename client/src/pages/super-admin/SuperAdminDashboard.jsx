// client/src/pages/super-admin/SuperAdminDashboard.jsx
export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">System Configuration</h1>
      </header>
      <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium text-gray-800">Classes & Subjects</h2>
        </section>
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium text-gray-800">Scheduling Engine</h2>
        </section>
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium text-gray-800">Question Bank</h2>
        </section>
      </main>
    </div>
  );
}