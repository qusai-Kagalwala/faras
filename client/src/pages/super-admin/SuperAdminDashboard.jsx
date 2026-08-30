// client/src/pages/super-admin/SuperAdminDashboard.jsx
import TopBar from '../../components/common/TopBar';

function ConfigCard({ title, description }) {
  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm transition hover:shadow-md">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">{title}</h2>
      <p className="text-sm text-text-secondary">{description}</p>
    </section>
  );
}

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-cream">
      <TopBar title="System Configuration" />
      <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        <ConfigCard
          title="Classes & Subjects"
          description="Manage the academic structure — classes, subjects, and teacher assignments."
        />
        <ConfigCard
          title="Scheduling Engine"
          description="Generate and review the cohort rotation schedule for a class."
        />
        <ConfigCard
          title="Question Bank"
          description="Maintain the master feedback statement bank and focus areas."
        />
      </main>
    </div>
  );
}