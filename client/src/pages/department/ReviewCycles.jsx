// client/src/pages/department/ReviewCycles.jsx
// The Department Head's actual review-cycle workflow: pick a Group and
// week, propose a cycle (algorithm + repeat candidates), toggle inclusion,
// then start it.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { reviewGroupsApi } from '../../api/reviewGroups.api';
import { reviewCycleApi } from '../../api/reviewCycle.api';

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

export default function ReviewCycles() {
  const { token } = useAuth();
  const [groups, setGroups] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [weekInput, setWeekInput] = useState('');
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

          {groups && groups.length > 0 && (
            <form onSubmit={handlePropose} className="flex flex-wrap gap-2">
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setProposals(null);
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
                placeholder="Week"
                className="w-24 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
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
          <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
              Week {weekInput} Proposal
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
                  onToggled={() => loadProposals(parseInt(selectedGroupId, 10), parseInt(weekInput, 10))}
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
      </main>
    </AppLayout>
  );
}