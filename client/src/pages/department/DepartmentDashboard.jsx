// client/src/pages/department/DepartmentDashboard.jsx
import { useState, useEffect } from 'react';
import TopBar from '../../components/common/TopBar';
import StageBadge from '../../components/common/StageBadge';
import { useAuth } from '../../context/AuthContext';
import { mappingApi } from '../../api/mapping.api';
import { aiReportsApi } from '../../api/aiReports.api';
import { approvalApi } from '../../api/approval.api';

const NEXT_STAGE = {
  generated: 'under_review',
  under_review: 'approved',
  approved: 'dispatched',
};

function TeacherLookupCard() {
  const { token } = useAuth();
  const [teacherIts, setTeacherIts] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await mappingApi.getTeacherFeedback(token, teacherIts.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Could not load feedback for this teacher.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">
        Teacher Feedback Lookup
      </h2>

      <form onSubmit={handleLookup} className="mb-4 flex gap-2">
        <input
          type="text"
          value={teacherIts}
          onChange={(e) => setTeacherIts(e.target.value)}
          placeholder="8-digit Teacher ITS Number"
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Loading...' : 'Look Up'}
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {result && (
        <div>
          <p className="mb-3 text-sm text-text-secondary">
            <span className="font-medium text-dark-brown">{result.teacherName}</span> —{' '}
            {result.totalResponsesMapped} response(s) mapped
          </p>

          {result.categorizedFeedback.length === 0 && (
            <p className="text-sm text-text-tertiary">No feedback recorded for this teacher yet.</p>
          )}

          <div className="space-y-3">
            {result.categorizedFeedback.map((f) => (
              <div key={f.focusArea} className="rounded-md border border-border p-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-text-primary">{f.focusArea}</span>
                  <span className="text-text-secondary">
                    {f.averageScore !== null ? `${f.averageScore} / 5` : 'No score data'}
                  </span>
                </div>
                {f.representativeQuotes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm italic text-text-tertiary">
                    {f.representativeQuotes.map((q, i) => (
                      <li key={i}>&ldquo;{q}&rdquo;</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ReportRow({ report, token, onAdvanced }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [signOffNote, setSignOffNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleExpand() {
    if (!expanded && !detail) {
      try {
        const res = await aiReportsApi.getReportDetail(token, report.id);
        setDetail(res.data);
      } catch (err) {
        setError(err.message || 'Could not load report detail.');
      }
    }
    setExpanded((e) => !e);
  }

  async function handleAdvance() {
    const nextStage = NEXT_STAGE[report.current_stage];
    if (!nextStage) return;

    setError(null);
    setBusy(true);
    try {
      await approvalApi.advance(
        token,
        report.id,
        nextStage,
        nextStage === 'dispatched' ? signOffNote : undefined
      );
      onAdvanced();
    } catch (err) {
      setError(err.message || 'Could not advance this report.');
    } finally {
      setBusy(false);
    }
  }

  const nextStage = NEXT_STAGE[report.current_stage];

  return (
    <div className="rounded-md border border-border p-4">
      <button
        type="button"
        onClick={handleExpand}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm">
          <span className="font-medium text-text-primary">
            {report.track === 'admin' ? 'Department-wide' : `Teacher ${report.teacher_its}`}
          </span>{' '}
          <span className="text-text-tertiary">— {report.cycle_id}</span>
        </span>
        <StageBadge stage={report.current_stage} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 text-sm">
          {error && <p className="text-error">{error}</p>}

          {detail && report.track === 'teacher' && (
            <>
              <div>
                <p className="mb-1 font-medium text-text-primary">Strengths</p>
                <ul className="list-disc pl-5 text-text-secondary">
                  {detail.report_json.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 font-medium text-text-primary">Concerns</p>
                <ul className="list-disc pl-5 text-text-secondary">
                  {detail.report_json.concerns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 font-medium text-text-primary">Recommendations</p>
                <ul className="list-disc pl-5 text-text-secondary">
                  {detail.report_json.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {detail && report.track === 'admin' && (
            <>
              <div>
                <p className="mb-1 font-medium text-text-primary">Macro Action Pointers</p>
                <ul className="list-disc pl-5 text-text-secondary">
                  {detail.report_json.macroActionPointers.map((a, i) => (
                    <li key={i}>
                      <span className="font-medium">{a.theme}:</span> {a.description}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 font-medium text-text-primary">Department Trends</p>
                <ul className="list-disc pl-5 text-text-secondary">
                  {detail.report_json.departmentTrends.map((t, i) => (
                    <li key={i}>
                      <span className="font-medium">[{t.direction}]</span> {t.description}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {nextStage === 'dispatched' && (
            <div>
              <label className="mb-1 block text-xs text-text-tertiary" htmlFor={`note-${report.id}`}>
                Sign-off note (required to dispatch)
              </label>
              <textarea
                id={`note-${report.id}`}
                value={signOffNote}
                onChange={(e) => setSignOffNote(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {nextStage && (
            <button
              type="button"
              onClick={handleAdvance}
              disabled={busy || (nextStage === 'dispatched' && signOffNote.trim().length === 0)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Working...' : `Advance to ${nextStage.replace('_', ' ')}`}
            </button>
          )}
          {!nextStage && (
            <p className="text-xs text-text-tertiary">This report has been fully dispatched.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ReportQueueCard() {
  const { token } = useAuth();
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    aiReportsApi
      .getAllReports(token)
      .then((res) => setReports(res.data.reports))
      .catch((err) => setError(err.message || 'Could not load reports.'));
  }

  useEffect(load, [token]);

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">Report Review Queue</h2>

      {error && <p className="text-sm text-error">{error}</p>}
      {reports && reports.length === 0 && (
        <p className="text-sm text-text-secondary">
          No reports yet — generated reports will appear here for review.
        </p>
      )}
      {reports && reports.length > 0 && (
        <div className="space-y-2">
          {reports.map((r) => (
            <ReportRow key={r.id} report={r} token={token} onAdvanced={load} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function DepartmentDashboard() {
  return (
    <div className="min-h-screen bg-cream">
      <TopBar title="Report Review" />
      <main className="space-y-4 p-6">
        <ReportQueueCard />
        <TeacherLookupCard />
      </main>
    </div>
  );
}