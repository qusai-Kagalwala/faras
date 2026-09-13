// client/src/pages/super-admin/Dashboard.jsx
// Lean landing page (R-02) — a real summary (current cycle + department-
// wide analytics, both already permitted for Super Admin server-side) plus
// quick links into the real feature pages, matching WAMAS's real pattern.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { cycleApi } from '../../api/cycle.api';
import { analyticsApi } from '../../api/analytics.api';

const QUICK_LINKS = NAV_ITEMS.super_admin.slice(1); // everything except "Dashboard" itself

function ScoreBar({ score }) {
  const percent = score ? (score / 5) * 100 : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function SystemOverview() {
  const { token } = useAuth();
  const [cycle, setCycle] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([cycleApi.getCurrentCycle(token), analyticsApi.getDepartmentTrend(token)])
      .then(([cycleRes, analyticsRes]) => {
        setCycle(cycleRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch((err) => setError(err.message || 'Could not load the system overview.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <section className="mb-4 rounded-lg border border-border bg-white p-6 shadow-sm">
        <p className="text-sm text-text-secondary">Loading overview...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-4 rounded-lg border border-error/20 bg-error-bg p-6 text-sm text-error shadow-sm">
        {error}
      </section>
    );
  }

  return (
    <section className="mb-4 rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">System Overview</h2>

      <p className="mb-4 rounded-md bg-primary-muted px-4 py-3 text-sm text-text-primary">
        Currently on <span className="font-semibold text-primary">Week {cycle.currentWeek}</span>{' '}
        of 22, academic year <span className="font-semibold text-primary">{cycle.academicYear} AH</span>
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-text-primary">Weekly Trend (School-Wide)</h3>
          {analytics.weeklyTrend.length === 0 && (
            <p className="text-sm text-text-tertiary">No feedback data yet.</p>
          )}
          <div className="space-y-2">
            {analytics.weeklyTrend.map((w) => (
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
          {analytics.focusAreaBreakdown.length === 0 && (
            <p className="text-sm text-text-tertiary">No feedback data yet.</p>
          )}
          <div className="space-y-2">
            {analytics.focusAreaBreakdown.map((f) => (
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
    <AppLayout title="System Configuration" navItems={NAV_ITEMS.super_admin}>
      <main className="p-6">
        <SystemOverview />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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