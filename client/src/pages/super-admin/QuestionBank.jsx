// client/src/pages/super-admin/QuestionBank.jsx
// Extracted from the old monolithic SuperAdminDashboard.jsx (R-02).
// Content is unchanged from the original QuestionBankCard + WeekFocusPlanCard.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { questionsApi } from '../../api/questions.api';

function QuestionBankCard() {
  const { token } = useAuth();
  const [statements, setStatements] = useState(null);
  const [focusArea, setFocusArea] = useState('');
  const [statementText, setStatementText] = useState('');
  const [type, setType] = useState('likert');
  const [needsReworded, setNeedsReworded] = useState(false);
  const [rewordedStatement, setRewordedStatement] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadStatements() {
    questionsApi
      .getStatements(token)
      .then((res) => setStatements(res.data.statements))
      .catch((err) => setError(err.message || 'Could not load the statement bank.'));
  }

  useEffect(loadStatements, [token]);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await questionsApi.createStatement(token, {
        focusArea: focusArea.trim(),
        statement: statementText.trim(),
        type,
        needsReworded,
        rewordedStatement: needsReworded ? rewordedStatement.trim() : null,
      });
      setFocusArea('');
      setStatementText('');
      setType('likert');
      setNeedsReworded(false);
      setRewordedStatement('');
      loadStatements();
    } catch (err) {
      setError(err.message || 'Could not add this statement.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await questionsApi.deleteStatement(token, id);
      loadStatements();
    } catch (err) {
      setError(err.message || 'Could not delete this statement.');
    }
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm [column-span:all]">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">Question Bank</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Maintain the master feedback statement bank. Even-week rewording (FR-SUR-04) requires a
        reworded version whenever it&apos;s enabled.
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="mb-4 space-y-2 rounded-md border border-border p-3">
        <input
          type="text"
          value={focusArea}
          onChange={(e) => setFocusArea(e.target.value)}
          placeholder="Focus area"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <textarea
          value={statementText}
          onChange={(e) => setStatementText(e.target.value)}
          placeholder="Statement text"
          rows={2}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="likert">Likert (5-point scale)</option>
            <option value="free_text">Free text</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={needsReworded}
              onChange={(e) => setNeedsReworded(e.target.checked)}
            />
            Needs even-week rewording
          </label>
        </div>
        {needsReworded && (
          <textarea
            value={rewordedStatement}
            onChange={(e) => setRewordedStatement(e.target.value)}
            placeholder="Reworded version (used on even weeks)"
            rows={2}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            required
          />
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Statement'}
        </button>
      </form>

      {statements && (
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {statements.length === 0 && (
            <p className="text-sm text-text-tertiary">No statements in the bank yet.</p>
          )}
          {statements.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border p-3 text-sm"
            >
              <div>
                <p className="text-xs font-medium text-primary">{s.focus_area}</p>
                <p className="text-text-primary">{s.statement}</p>
                {s.needs_reworded && (
                  <p className="mt-1 text-xs italic text-text-tertiary">
                    Even week: {s.reworded_statement}
                  </p>
                )}
                <p className="mt-1 text-xs text-text-tertiary">{s.type}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="shrink-0 text-xs text-error underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WeekFocusPlanCard() {
  const { token } = useAuth();
  const [allFocusAreas, setAllFocusAreas] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [activeFocusAreas, setActiveFocusAreas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    questionsApi
      .getStatements(token)
      .then((res) => {
        const distinct = Array.from(new Set(res.data.statements.map((s) => s.focus_area))).sort();
        setAllFocusAreas(distinct);
      })
      .catch((err) => setError(err.message || 'Could not load focus areas.'))
      .finally(() => setLoading(false));
  }, [token]);

  function handleSelectWeek(e) {
    const week = e.target.value;
    setSelectedWeek(week);
    setError(null);
    if (!week) {
      setActiveFocusAreas([]);
      return;
    }
    questionsApi
      .getWeekFocusPlan(token)
      .then((res) => {
        const entry = res.data.plan.find((p) => p.weekNumber === parseInt(week, 10));
        setActiveFocusAreas(entry ? entry.focusAreas : []);
      })
      .catch((err) => setError(err.message || "Could not load this week's focus plan."));
  }

  function toggleFocusArea(focusArea) {
    setActiveFocusAreas((prev) =>
      prev.includes(focusArea) ? prev.filter((f) => f !== focusArea) : [...prev, focusArea]
    );
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await questionsApi.setWeekFocusAreas(token, parseInt(selectedWeek, 10), activeFocusAreas);
    } catch (err) {
      setError(err.message || "Could not save this week's focus plan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
          Week Focus Plan
        </h2>
        <p className="text-sm text-text-secondary">Loading...</p>
      </section>
    );
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Week Focus Plan
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Choose which focus areas are active for a given week (FR-SUR-02). A week can have more
        than one active focus area.
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      <select
        value={selectedWeek}
        onChange={handleSelectWeek}
        className="mb-3 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
      >
        <option value="">Select a week...</option>
        {Array.from({ length: 22 }, (_, i) => i + 1).map((w) => (
          <option key={w} value={w}>
            Week {w}
          </option>
        ))}
      </select>

      {selectedWeek && allFocusAreas && (
        <>
          <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
            {allFocusAreas.length === 0 && (
              <p className="text-sm text-text-tertiary">
                No focus areas exist yet — add statements to the Question Bank first.
              </p>
            )}
            {allFocusAreas.map((focusArea) => (
              <label
                key={focusArea}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="text-text-primary">{focusArea}</span>
                <input
                  type="checkbox"
                  checked={activeFocusAreas.includes(focusArea)}
                  onChange={() => toggleFocusArea(focusArea)}
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || activeFocusAreas.length === 0}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : `Save Week ${selectedWeek}'s Focus Plan`}
          </button>
        </>
      )}
    </section>
  );
}

export default function QuestionBank() {
  return (
    <AppLayout title="Question Bank" navItems={NAV_ITEMS.super_admin}>
      <main className="columns-1 gap-4 p-6 sm:columns-2">
        <QuestionBankCard />
        <WeekFocusPlanCard />
      </main>
    </AppLayout>
  );
}