// client/src/pages/teacher/TeacherDashboard.jsx
import { useState, useEffect } from 'react';
import TopBar from '../../components/common/TopBar';
import StageBadge from '../../components/common/StageBadge';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analytics.api';
import { aiReportsApi } from '../../api/aiReports.api';

function ScoreBar({ score }) {
  const percent = score ? (score / 5) * 100 : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ReportCard({ report }) {
  const [expanded, setExpanded] = useState(false);
  const rj = report.report_json;

  return (
    <div className="rounded-md border border-border p-4">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-medium text-text-primary">{report.cycle_id}</span>
        <StageBadge stage={report.current_stage} />
      </button>

      {expanded && report.current_stage !== 'dispatched' && (
        <p className="mt-3 text-sm text-text-tertiary">
          This report is still being reviewed by the department. It will appear here in full once
          dispatched.
        </p>
      )}

      {expanded && report.current_stage === 'dispatched' && rj && (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="mb-1 font-medium text-text-primary">Strengths</p>
            <ul className="list-disc pl-5 text-text-secondary">
              {rj.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 font-medium text-text-primary">Areas to Watch</p>
            <ul className="list-disc pl-5 text-text-secondary">
              {rj.concerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 font-medium text-text-primary">Recommendations</p>
            <ul className="list-disc pl-5 text-text-secondary">
              {rj.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 font-medium text-text-primary">By Focus Area</p>
            <div className="space-y-2">
              {rj.categorizedFeedback.map((f) => (
                <div key={f.focusArea}>
                  <div className="flex justify-between text-xs text-text-secondary">
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
    </div>
  );
}

function MyReportsSection({ token, itsNumber }) {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    aiReportsApi
      .getTeacherReports(token, itsNumber)
      .then((res) => setReports(res.data.reports))
      .catch((err) => setError(err.message || 'Could not load your reports.'));
  }, [token, itsNumber]);

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm md:col-span-2">
      <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">My Reports</h2>

      {error && <p className="text-sm text-error">{error}</p>}
      {reports && reports.length === 0 && (
        <p className="text-sm text-text-secondary">
          No reports yet — one will appear here once generated for a cycle.
        </p>
      )}
      {reports && reports.length > 0 && (
        <div className="space-y-2">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function TeacherDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    analyticsApi
      .getTeacherTrend(token, user.itsNumber)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || 'Could not load your analytics.'))
      .finally(() => setLoading(false));
  }, [token, user]);

  return (
    <div className="min-h-screen bg-cream">
      <TopBar title="My Reports" />
      <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        {user && <MyReportsSection token={token} itsNumber={user.itsNumber} />}

        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">
            Weekly Trend
          </h2>

          {loading && <p className="text-sm text-text-secondary">Loading...</p>}
          {error && <p className="text-sm text-error">{error}</p>}

          {data && data.weeklyTrend.length === 0 && (
            <p className="text-sm text-text-secondary">
              No feedback data yet — your trend will appear here once students submit responses.
            </p>
          )}

          {data && data.weeklyTrend.length > 0 && (
            <div className="space-y-3">
              {data.weeklyTrend.map((w) => (
                <div key={w.weekNumber}>
                  <div className="mb-1 flex justify-between text-xs text-text-secondary">
                    <span>Week {w.weekNumber}</span>
                    <span>{w.averageScore !== null ? `${w.averageScore} / 5` : 'No score data'}</span>
                  </div>
                  <ScoreBar score={w.averageScore} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">
            Focus Areas
          </h2>

          {data && data.focusAreaBreakdown.length === 0 && (
            <p className="text-sm text-text-secondary">
              A breakdown by theme will appear here once feedback comes in.
            </p>
          )}

          {data && data.focusAreaBreakdown.length > 0 && (
            <div className="space-y-3">
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
          )}
        </section>
      </main>
    </div>
  );
}