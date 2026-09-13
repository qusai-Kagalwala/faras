// client/src/pages/department/Dashboard.jsx
// Lean landing page (R-03) — replaces the old monolithic
// DepartmentDashboard.jsx. Shows real counts (how many reports at each
// approval stage) and school-wide analytics, plus quick links into the
// real feature pages (Report Review Queue, Teacher Lookup).

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { aiReportsApi } from '../../api/aiReports.api';
import { analyticsApi } from '../../api/analytics.api';

const QUICK_LINKS = NAV_ITEMS.department.slice(1); // everything except "Dashboard" itself

const STAGE_LABELS = {
  generated: 'Generated',
  under_review: 'Under Review',
  approved: 'Approved',
  dispatched: 'Dispatched',
};

function ScoreBar({ score }) {
  const percent = score ? (score / 5) * 100 : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function StageCounts() {
  const { token } = useAuth();
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiReportsApi
      .getAllReports(token)
      .then((res) => {
        const tally = { generated: 0, under_review: 0, approved: 0, dispatched: 0 };
        for (const r of res.data.reports) {
          if (tally[r.current_stage] !== undefined) tally[r.current_stage]++;
        }
        setCounts(tally);
      })
      .catch((err) => setError(err.message || 'Could not load report counts.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-sm text-text-secondary">Loading...</p>;
  if (error) return <p className="text-sm text-error">{error}</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(STAGE_LABELS).map(([stage, label]) => (
        <div key={stage} className="rounded-md border border-border p-4 text-center">
          <p className="text-2xl font-semibold text-primary">{counts[stage]}</p>
          <p className="text-xs text-text-tertiary">{label}</p>
        </div>
      ))}
    </div>
  );
}

function SystemOverview() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getDepartmentTrend(token)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || 'Could not load department analytics.'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section className="mb-4 rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">System Overview</h2>

      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-text-primary">Report Queue, by Stage</h3>
        <StageCounts />
      </div>

      {loading && <p className="text-sm text-text-secondary">Loading analytics...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      {data && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Weekly Trend</h3>
            {data.weeklyTrend.length === 0 && (
              <p className="text-sm text-text-tertiary">No feedback data yet.</p>
            )}
            <div className="space-y-2">
              {data.weeklyTrend.map((w) => (
                <div key={w.weekNumber}>
                  <div className="mb-1 flex justify-between text-xs text-text-secondary">
                    <span>Week {w.weekNumber}</span>
                    <span>{w.averageScore !== null ? `${w.averageScore} / 5` : '—'}</span>
                  </div>
                  <ScoreBar score={w.averageScore} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">Focus Area Breakdown</h3>
            {data.focusAreaBreakdown.length === 0 && (
              <p className="text-sm text-text-tertiary">No feedback data yet.</p>
            )}
            <div className="space-y-2">
              {data.focusAreaBreakdown.map((f) => (
                <div key={f.focusArea}>
                  <div className="mb-1 flex justify-between text-xs text-text-secondary">
                    <span>{f.focusArea}</span>
                    <span>{f.averageScore !== null ? `${f.averageScore} / 5` : '—'}</span>
                  </div>
                  <ScoreBar score={f.averageScore} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function QuickLinkCard({ label, path, description }) {
  return (
    <Link
      to={path}
      className="block rounded-lg border border-border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <h2 className="mb-1 font-display text-lg font-semibold text-dark-brown">{label}</h2>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </Link>
  );
}

export default function Dashboard() {
  return (
    <AppLayout title="Department Overview" navItems={NAV_ITEMS.department}>
      <main className="p-6">
        <SystemOverview />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((item) => (
            <QuickLinkCard
              key={item.path}
              label={item.label}
              path={item.path}
              description={item.description}
            />
          ))}
        </div>
      </main>
    </AppLayout>
  );
}