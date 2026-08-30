// client/src/pages/department/DepartmentDashboard.jsx
import TopBar from '../../components/common/TopBar';

// Report-status badge colors, per FARAS_Design_System_v1_1_corrected.md —
// maps each report_approvals stage onto existing semantic/brand tokens
// rather than inventing new ones. Reused wherever a report's stage is shown.
const STAGE_STYLES = {
  generated: 'bg-cream-dark text-text-secondary',
  under_review: 'bg-warning-bg text-warning',
  approved: 'bg-success-bg text-success',
  dispatched: 'bg-primary-muted text-primary',
};

const STAGE_LABELS = {
  generated: 'Generated',
  under_review: 'Under Review',
  approved: 'Approved',
  dispatched: 'Dispatched',
};

function StageBadge({ stage }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STAGE_STYLES[stage]}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

export default function DepartmentDashboard() {
  return (
    <div className="min-h-screen bg-cream">
      <TopBar title="Report Review" />
      <main className="p-6">
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">
            Pending Approval
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            Reports awaiting review will appear here, alongside unfiltered admin data.
          </p>
          <div className="flex gap-2">
            <StageBadge stage="generated" />
            <StageBadge stage="under_review" />
            <StageBadge stage="approved" />
            <StageBadge stage="dispatched" />
          </div>
        </section>
      </main>
    </div>
  );
}