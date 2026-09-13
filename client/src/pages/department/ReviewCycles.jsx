// client/src/pages/department/ReviewCycles.jsx
// REBUILT per explicit request: two clearly SEPARATE tabs instead of one
// ambiguous "Load Cycle" button doing double duty — "View Existing Cycle"
// (read-only, for a Group+week that already has a proposal/started cycle)
// and "Start New Cycle" (the propose -> toggle -> start flow, only for a
// Group+week with nothing yet). Every load state now shows an explicit
// message — nothing silently renders blank.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { reviewGroupsApi } from '../../api/reviewGroups.api';
import { reviewCycleApi } from '../../api/reviewCycle.api';
import { aiReportsApi } from '../../api/aiReports.api';

function GroupWeekPicker({ groups, groupId, setGroupId, week, setWeek }) {
  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
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
        value={week}
        onChange={(e) => setWeek(e.target.value)}
        placeholder="Week (1-22)"
        className="w-32 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        required
      />
    </div>
  );
}

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

function ClassRow({ token, groupId, week, classData }) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await aiReportsApi.generateTeacherReport(
        token,
        classData.teacherIts,
        `week-${week}-group-${groupId}`
      );
      setResult({ success: true, id: res.data.aiReportId });
    } catch (err) {
      setResult({ success: false, message: err.message || 'Could not generate report.' });
    } finally {
      setGenerating(false);
    }
  }

  const complete = classData.shared > 0 && classData.respondedCount === classData.shared;

  return (
    <div className="grid grid-cols-1 items-center gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
      <div>
        <p className="font-medium text-text-primary">{classData.className}</p>
        <p className="text-xs text-text-tertiary">{classData.teacherName || 'No teacher assigned'}</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-primary">{classData.shared}</p>
        <p className="text-xs text-text-tertiary">Shared</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-success">{classData.respondedCount}</p>
        <p className="text-xs text-text-tertiary">Responded</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-warning">{classData.pendingCount}</p>
        <p className="text-xs text-text-tertiary">Pending</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {complete && <span className="text-xs font-medium text-success">All submitted</span>}
        {result && (
          <span className={result.success ? 'text-xs text-success' : 'text-xs text-error'}>
            {result.success ? `Generated (#${result.id})` : result.message}
          </span>
        )}
        {classData.teacherIts && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── TAB 1: View an existing cycle (read-only) ─────────────────────────

function ViewExistingCycle({ token, groups }) {
  const [groupId, setGroupId] = useState('');
  const [week, setWeek] = useState('');
  const [proposals, setProposals] = useState(null);
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);

  async function handleView(e) {
    e.preventDefault();
    setError(null);
    setProposals(null);
    setClasses(null);
    setReminderResult(null);
    setLoading(true);
    try {
      const gid = parseInt(groupId, 10);
      const w = parseInt(week, 10);
      const propRes = await reviewCycleApi.getProposals(token, gid, w);
      setProposals(propRes.data.proposals);

      if (propRes.data.proposals.some((p) => p.status === 'started')) {
        const classRes = await reviewCycleApi.getProgressByClass(token, gid, w);
        setClasses(classRes.data.classes);
      }
    } catch (err) {
      setError(err.message || 'Could not load this cycle.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemind() {
    setReminding(true);
    setReminderResult(null);
    try {
      const res = await reviewCycleApi.sendReminders(token, parseInt(groupId, 10), parseInt(week, 10));
      setReminderResult(res.data);
    } catch (err) {
      setError(err.message || 'Could not send reminders.');
    } finally {
      setReminding(false);
    }
  }

  const started = proposals && proposals.some((p) => p.status === 'started');
  const totalPending = classes ? classes.reduce((sum, c) => sum + c.pendingCount, 0) : 0;

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        View Existing Cycle
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Pick a Group and week that already has a cycle to see its real progress — this is
        read-only and never creates anything new.
      </p>

      {groups && groups.length === 0 && (
        <p className="text-sm text-text-tertiary">
          You don&apos;t head any Review Groups yet — ask a Super Admin to create one for you.
        </p>
      )}

      {groups && groups.length > 0 && (
        <form onSubmit={handleView} className="mb-4">
          <GroupWeekPicker groups={groups} groupId={groupId} setGroupId={setGroupId} week={week} setWeek={setWeek} />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'View Cycle'}
          </button>
        </form>
      )}

      {error && (
        <div className="mb-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {proposals !== null && proposals.length === 0 && (
        <p className="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-sm text-warning">
          No cycle exists yet for this Group in Week {week}. Use &quot;Start New Cycle&quot; below
          to create one.
        </p>
      )}

      {proposals !== null && proposals.length > 0 && !started && (
        <div>
          <p className="mb-3 rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-sm text-warning">
            This cycle has been proposed but not started yet — {proposals.filter((p) => p.included).length}{' '}
            of {proposals.length} students currently included. Go to &quot;Start New Cycle&quot; with
            the same Group and week to finish including students and start it.
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {proposals.map((p) => (
              <div key={p.id} className="rounded-md border border-border px-3 py-2 text-sm">
                {p.student_name}{' '}
                <span className="text-xs text-text-tertiary">
                  ({p.source === 'algorithm' ? 'algorithm pick' : 'repeat candidate'} —{' '}
                  {p.included ? 'included' : 'not included'})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {started && classes === null && (
        <p className="text-sm text-text-secondary">Loading per-class progress...</p>
      )}

      {started && classes !== null && (
        <div>
          <p className="mb-3 text-sm text-success">
            This cycle has been started — {proposals.length} student(s) total.
          </p>

          {totalPending > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleRemind}
                disabled={reminding}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reminding ? 'Sending...' : `Send Reminder to All ${totalPending} Pending Student(s)`}
              </button>
              {reminderResult && (
                <p className="mt-2 text-sm text-success">
                  Sent {reminderResult.remindersSent} reminder(s).
                </p>
              )}
            </div>
          )}

          {classes.length === 0 && (
            <p className="text-sm text-text-tertiary">No classes found in scope.</p>
          )}

          <div className="space-y-2">
            {classes.map((c) => (
              <ClassRow
                key={c.classId}
                token={token}
                groupId={parseInt(groupId, 10)}
                week={parseInt(week, 10)}
                classData={c}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── TAB 2: Start a brand-new cycle ─────────────────────────────────────

function StartNewCycle({ token, groups }) {
  const [groupId, setGroupId] = useState('');
  const [week, setWeek] = useState('');
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState(null);
  const [proposing, setProposing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startResult, setStartResult] = useState(null);

  function loadProposals(gid, w) {
    reviewCycleApi
      .getProposals(token, gid, w)
      .then((res) => setProposals(res.data.proposals))
      .catch((err) => setError(err.message || 'Could not load proposals.'));
  }

  async function handlePropose(e) {
    e.preventDefault();
    setError(null);
    setStartResult(null);
    setProposing(true);
    try {
      const res = await reviewCycleApi.propose(token, parseInt(groupId, 10), parseInt(week, 10));
      if (res.data.proposals.some((p) => p.status === 'started')) {
        setError(
          'This Group already has a STARTED cycle for that week. Use "View Existing Cycle" instead.'
        );
        setProposals(null);
        return;
      }
      setProposals(res.data.proposals);
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
      const res = await reviewCycleApi.start(token, parseInt(groupId, 10), parseInt(week, 10));
      setStartResult(res.data);
      loadProposals(parseInt(groupId, 10), parseInt(week, 10));
    } catch (err) {
      setError(err.message || 'Could not start this cycle.');
    } finally {
      setStarting(false);
    }
  }

  const includedCount = proposals ? proposals.filter((p) => p.included).length : 0;
  const alreadyStarted = proposals && proposals.some((p) => p.status === 'started');

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">Start New Cycle</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Pick a Group and a week that has NOT been proposed yet. Algorithm-picked students (never
        reviewed under this Group before) are included by default — you can uncheck them. Repeat
        candidates (already reviewed) are opt-in.
      </p>

      {groups && groups.length > 0 && (
        <form onSubmit={handlePropose} className="mb-4">
          <GroupWeekPicker groups={groups} groupId={groupId} setGroupId={setGroupId} week={week} setWeek={setWeek} />
          <button
            type="submit"
            disabled={proposing}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {proposing ? 'Proposing...' : 'Propose Cycle'}
          </button>
        </form>
      )}

      {error && (
        <div className="mb-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {proposals && (
        <>
          <p className="mb-4 text-sm text-text-secondary">
            {includedCount} of {proposals.length} students currently included.
          </p>

          <div className="mb-4 max-h-96 space-y-2 overflow-y-auto">
            {proposals.map((p) => (
              <ProposalRow
                key={p.id}
                proposal={p}
                groupId={parseInt(groupId, 10)}
                token={token}
                onToggled={() => loadProposals(parseInt(groupId, 10), parseInt(week, 10))}
              />
            ))}
          </div>

          {alreadyStarted ? (
            <p className="text-sm text-success">This cycle has already been started.</p>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={starting || includedCount === 0}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting ? 'Starting...' : `Start Cycle (${includedCount} students)`}
            </button>
          )}

          {startResult && (
            <div className="mt-3 rounded-md border border-success/20 bg-success-bg px-3 py-2 text-sm text-success">
              Started — {startResult.inserted} student(s) added to the schedule
              {startResult.skipped > 0 && `, ${startResult.skipped} already had this subject this week`}.
              Go to &quot;View Existing Cycle&quot; to see live progress.
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function ReviewCycles() {
  const { token } = useAuth();
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('view');

  useEffect(() => {
    reviewGroupsApi
      .getGroups(token)
      .then((res) => setGroups(res.data.groups))
      .catch((err) => setError(err.message || 'Could not load your Review Groups.'));
  }, [token]);

  return (
    <AppLayout title="Review Cycles" navItems={NAV_ITEMS.department}>
      <main className="p-6">
        {error && (
          <div className="mb-4 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        {groups && groups.length > 1 && (
          <p className="mb-4 rounded-md bg-primary-muted px-3 py-2 text-sm text-text-primary">
            You head {groups.length} Review Groups.
          </p>
        )}

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === 'view'
                ? 'bg-primary text-white shadow-primary'
                : 'border border-border bg-white text-text-secondary hover:bg-cream-dark'
            }`}
          >
            View Existing Cycle
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('start')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === 'start'
                ? 'bg-primary text-white shadow-primary'
                : 'border border-border bg-white text-text-secondary hover:bg-cream-dark'
            }`}
          >
            Start New Cycle
          </button>
        </div>

        {groups === null && <p className="text-sm text-text-secondary">Loading your Groups...</p>}

        {groups && activeTab === 'view' && <ViewExistingCycle token={token} groups={groups} />}
        {groups && activeTab === 'start' && <StartNewCycle token={token} groups={groups} />}
      </main>
    </AppLayout>
  );
}