// client/src/pages/teacher/TeacherDashboard.jsx
import { useState, useEffect } from 'react';
import TopBar from '../../components/common/TopBar';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analytics.api';

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