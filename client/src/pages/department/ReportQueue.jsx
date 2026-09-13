// client/src/pages/department/ReportQueue.jsx
// Extracted from the old monolithic DepartmentDashboard.jsx (R-03).
// Content unchanged from the original ReportRow + ReportQueueCard.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import StageBadge from '../../components/common/StageBadge';
import { useAuth } from '../../context/AuthContext';
import { aiReportsApi } from '../../api/aiReports.api';
import { approvalApi } from '../../api/approval.api';

const NEXT_STAGE = {
  generated: 'under_review',
  under_review: 'approved',
  approved: 'dispatched',
};

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

export default function ReportQueue() {
  return (
    <AppLayout title="Report Review Queue" navItems={NAV_ITEMS.department}>
      <main className="p-6">
        <ReportQueueCard />
      </main>
    </AppLayout>
  );
}