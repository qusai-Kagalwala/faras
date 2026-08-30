// client/src/pages/teacher/TeacherDashboard.jsx
import TopBar from '../../components/common/TopBar';

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-cream">
      <TopBar title="My Reports" />
      <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
            Latest Cycle
          </h2>
          <p className="text-sm text-text-secondary">
            Your approved feedback report will appear here once dispatched by the department.
          </p>
        </section>
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
            Historical Trend
          </h2>
          <p className="text-sm text-text-secondary">
            A trend of your scores and themes across cycles will appear here.
          </p>
        </section>
      </main>
    </div>
  );
}