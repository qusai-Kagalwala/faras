// client/src/pages/department/ReviewCycles.jsx
// The Department Head's actual review-cycle workflow: pick a Group and
// week, propose a cycle (algorithm + repeat candidates), toggle inclusion,
// start it, track real response progress, remind pending students, and
// generate AI reports for the teachers involved — all from one page.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { reviewGroupsApi } from '../../api/reviewGroups.api';
import { reviewCycleApi } from '../../api/reviewCycle.api';
import { aiReportsApi } from '../../api/aiReports.api';

function ProposalRow({ proposal, groupId, token, onToggled }) {
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);
    try {
      await reviewCycleApi.toggleProposal(token, groupId, proposal.id, !proposal.included);
      onToggled();
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
      <span className="text-text-primary">
        {proposal.student_name}{' '}
        <span className="text-xs text-text-tertiary">
          ({proposal.source === 'algorithm' ? 'algorithm pick' : 'repeat candidate'})
        </span>
      </span>
      <input
        type="checkbox"
        checked={proposal.included}
        disabled={busy || proposal.status === 'started'}
        onChange={handleToggle}
      />
    </label>
  );
}

function ProgressSection({ token, groupId, week }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [reminding, setReminding] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);

  function load() {
    reviewCycleApi
      .getProgress(token, groupId, week)
      .then((res) => setProgress(res.data))
      .catch((err) => setError(err.message || 'Could not load progress.'));
  }

  useEffect(load, [token, groupId, week]);

  async function handleRemind() {
    setReminding(true);
    setReminderResult(null);
    try {
      const res = await reviewCycleApi.sendReminders(token, groupId, week);
      setReminderResult(res.data);
    } catch (err) {
      setError(err.message || 'Could not send reminders.');
    } finally {
      setReminding(false);
    }
  }

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (!progress) return <p className="text-sm text-text-secondary">Loading progress...</p>;

  return (
    <section className="mb-4 rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Response Progress — Week {week}
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        How many students this cycle was shared with, and how many have actually responded.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-md border border-border p-4 text-center">
          <p className="text-2xl font-semibold text-primary">{progress.shared}</p>
          <p className="text-xs text-text-tertiary">Shared</p>
        </div>
        <div className="rounded-md border border-border p-4 text-center">
          <p className="text-2xl font-semibold text-success">{progress.respondedCount}</p>
          <p className="text-xs text-text-tertiary">Responded</p>
        </div>
        <div className="rounded-md border border-border p-4 text-center">
          <p className="text-2xl font-semibold text-warning">{progress.pendingCount}</p>
          <p className="text-xs text-text-tertiary">Pending</p>
        </div>
      </div>

      {progress.pendingCount > 0 && (
        <>
          <button
            type="button"
            onClick={handleRemind}
            disabled={reminding}
            className="mb-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reminding ? 'Sending...' : `Send Reminder to ${progress.pendingCount} Pending Student(s)`}
          </button>
          {reminderResult && (
            <p className="text-sm text-success">
              Sent {reminderResult.remindersSent} reminder(s).
            </p>
          )}
        </>
      )}
    </section>
  );
}

function TeachersSection({ token, groupId, week }) {
  const [teachers, setTeachers] = useState(null);
  const [error, setError] = useState(null);
  const [generatingIts, setGeneratingIts] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => {
    reviewCycleApi
      .getTeachers(token, groupId)
      .then((res) => setTeachers(res.data.teachers))
      .catch((err) => setError(err.message || 'Could not load teachers.'));
  }, [token, groupId]);

  async function handleGenerate(teacherIts) {
    setGeneratingIts(teacherIts);
    try {
      const res = await aiReportsApi.generateTeacherReport(
        token,
        teacherIts,
        `week-${week}-group-${groupId}`
      );
      setResults((prev) => ({ ...prev, [teacherIts]: { success: true, id: res.data.aiReportId } }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [teacherIts]: { success: false, message: err.message || 'Could not generate report.' },
      }));
    } finally {
      setGeneratingIts(null);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Teachers in This Group
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Generate an AI report for any teacher once their class has real responses. New reports
        appear in the Report Review Queue.
      </p>

      {error && <p className="text-sm text-error">{error}</p>}
      {teachers && teachers.length === 0 && (
        <p className="text-sm text-text-tertiary">No teachers found for this Group.</p>
      )}

      <div className="space-y-2">
        {teachers &&
          teachers.map((t) => (
            <div
              key={t.its_number}
              className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
            >
              <span>
                <span className="font-medium text-text-primary">{t.name}</span>{' '}
                <span className="text-text-tertiary">— {t.class_name}</span>
              </span>
              <div className="flex items-center gap-2">
                {results[t.its_number] && (
                  <span
                    className={results[t.its_number].success ? 'text-xs text-success' : 'text-xs text-error'}
                  >
                    {results[t.its_number].success
                      ? `Generated (#${results[t.its_number].id})`
                      : results[t.its_number].message}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleGenerate(t.its_number)}
                  disabled={generatingIts === t.its_number}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generatingIts === t.its_number ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

export default function ReviewCycles() {
  const { token } = useAuth();
  const [groups, setGroups] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [weekInput, setWeekInput] = useState('');
  const [activeWeek, setActiveWeek] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState(null);
  const [proposing, setProposing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startResult, setStartResult] = useState(null);

  useEffect(() => {
    reviewGroupsApi
      .getGroups(token)
      .then((res) => setGroups(res.data.groups))
      .catch((err) => setError(err.message || 'Could not load your Review Groups.'));
  }, [token]);

  function loadProposals(groupId, week) {
    reviewCycleApi
      .getProposals(token, groupId, week)
      .then((res) => setProposals(res.data.proposals))
      .catch((err) => setError(err.message || 'Could not load proposals.'));
  }

  async function handlePropose(e) {
    e.preventDefault();
    setError(null);
    setStartResult(null);
    setProposing(true);
    try {
      const res = await reviewCycleApi.propose(
        token,
        parseInt(selectedGroupId, 10),
        parseInt(weekInput, 10)
      );
      setProposals(res.data.proposals);
      setActiveWeek(parseInt(weekInput, 10));
    } catch (err) {
      setError(err.message || 'Could not propose this cycle.');
    } finally {
      setProposing(false);
    }
  }

  async function handleStart() {
    setError(null);
    setStarting(true);
    try {
      const res = await reviewCycleApi.start(
        token,
        parseInt(selectedGroupId, 10),
        parseInt(weekInput, 10)
      );
      setStartResult(res.data);
      loadProposals(parseInt(selectedGroupId, 10), parseInt(weekInput, 10));
    } catch (err) {
      setError(err.message || 'Could not start this cycle.');
    } finally {
      setStarting(false);
    }
  }

  const includedCount = proposals ? proposals.filter((p) => p.included).length : 0;
  const alreadyStarted = proposals && proposals.length > 0 && proposals[0].status === 'started';

  return (
    <AppLayout title="Review Cycles" navItems={NAV_ITEMS.department}>
      <main className="p-6">
        <section className="mb-4 rounded-lg border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
            Create Review Cycle
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            Choose your Group and a week. Algorithm-picked students (not yet reviewed under this
            Group) are included by default — you can uncheck them. Repeat candidates (already
            reviewed before) are opt-in.
          </p>

          {error && (
            <div className="mb-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}

          {groups && groups.length === 0 && (
            <p className="text-sm text-text-tertiary">
              You don&apos;t head any Review Groups yet — ask a Super Admin to create one for you.
            </p>
          )}

          {groups && groups.length > 1 && (
            <p className="mb-2 rounded-md bg-primary-muted px-3 py-2 text-xs text-text-primary">
              You head {groups.length} Review Groups — select which one below before proposing a
              cycle.
            </p>
          )}

          {groups && groups.length > 0 && (
            <form onSubmit={handlePropose} className="flex flex-wrap gap-2">
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setProposals(null);
                  setActiveWeek(null);
                }}
                className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                required
              >
                <option value="">Select your Group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.subject_name})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={22}
                value={weekInput}
                onChange={(e) => setWeekInput(e.target.value)}
                placeholder="Week (1-22)"
                className="w-32 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={proposing}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {proposing ? 'Proposing...' : 'Propose Cycle'}
              </button>
            </form>
          )}
        </section>

        {proposals && (
          <section className="mb-4 rounded-lg border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
              Week {activeWeek} Proposal
            </h2>
            <p className="mb-4 text-sm text-text-secondary">
              {includedCount} of {proposals.length} students currently included.
            </p>

            {proposals.length === 0 && (
              <p className="text-sm text-text-tertiary">
                No students in scope for this subject yet.
              </p>
            )}

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {proposals.map((p) => (
                <ProposalRow
                  key={p.id}
                  proposal={p}
                  groupId={parseInt(selectedGroupId, 10)}
                  token={token}
                  onToggled={() => loadProposals(parseInt(selectedGroupId, 10), activeWeek)}
                />
              ))}
            </div>

            {alreadyStarted ? (
              <p className="mt-4 text-sm text-success">This cycle has already been started.</p>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={starting || includedCount === 0}
                className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starting ? 'Starting...' : `Start Cycle (${includedCount} students)`}
              </button>
            )}

            {startResult && (
              <div className="mt-3 rounded-md border border-success/20 bg-success-bg px-3 py-2 text-sm text-success">
                Started — {startResult.inserted} student(s) added to the schedule
                {startResult.skipped > 0 && `, ${startResult.skipped} already had this subject this week`}.
              </div>
            )}
          </section>
        )}

        {alreadyStarted && activeWeek && (
          <>
            <ProgressSection token={token} groupId={parseInt(selectedGroupId, 10)} week={activeWeek} />
            <TeachersSection token={token} groupId={parseInt(selectedGroupId, 10)} week={activeWeek} />
          </>
        )}
      </main>
    </AppLayout>
  );
}