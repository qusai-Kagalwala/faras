// client/src/pages/super-admin/Scheduling.jsx
// Extracted from the old monolithic SuperAdminDashboard.jsx (R-02).
// Content is unchanged from the original SchedulingEngineCard.

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { schedulingApi } from '../../api/scheduling.api';

function SchedulingEngineCard() {
  const { token } = useAuth();
  const [classId, setClassId] = useState('');
  const [startWeek, setStartWeek] = useState('');
  const [numWeeks, setNumWeeks] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);

    try {
      const res = await schedulingApi.generate(
        token,
        parseInt(classId, 10),
        parseInt(startWeek, 10),
        parseInt(numWeeks, 10)
      );
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Could not generate the schedule.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Scheduling Engine
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Generate a cohort rotation schedule for a class. Existing weeks for a student are never
        overwritten — only genuinely empty weeks are filled in.
      </p>

      <form onSubmit={handleGenerate} className="mb-4 grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-xs text-text-tertiary" htmlFor="classId">
            Class ID
          </label>
          <input
            id="classId"
            type="number"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-tertiary" htmlFor="startWeek">
            Start Week
          </label>
          <input
            id="startWeek"
            type="number"
            value={startWeek}
            onChange={(e) => setStartWeek(e.target.value)}
            className="w-full rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-tertiary" htmlFor="numWeeks">
            Number of Weeks
          </label>
          <input
            id="numWeeks"
            type="number"
            value={numWeeks}
            onChange={(e) => setNumWeeks(e.target.value)}
            className="w-full rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="col-span-3 mt-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-md border border-success/20 bg-success-bg px-3 py-2 text-sm text-success">
          <p>
            Inserted {result.inserted} row(s), skipped {result.skippedOccupied ?? 0} already-occupied
            week(s){result.totalGenerated !== undefined ? `, out of ${result.totalGenerated} generated.` : '.'}
          </p>
          {result.warnings && result.warnings.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-warning">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default function Scheduling() {
  return (
    <AppLayout title="Scheduling Engine" navItems={NAV_ITEMS.super_admin}>
      <main className="p-6">
        <SchedulingEngineCard />
      </main>
    </AppLayout>
  );
}