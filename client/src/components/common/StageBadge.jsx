// client/src/components/common/StageBadge.jsx
// Report-status badge colors, per FARAS_Design_System_v1_1_corrected.md —
// maps each report_approvals stage onto existing semantic/brand tokens.
// Shared between Teacher and Department dashboards.

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

export default function StageBadge({ stage }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STAGE_STYLES[stage] || 'bg-cream-dark text-text-secondary'}`}
    >
      {STAGE_LABELS[stage] || stage}
    </span>
  );
}