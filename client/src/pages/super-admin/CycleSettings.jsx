// client/src/pages/super-admin/CycleSettings.jsx
// Extracted from the old monolithic SuperAdminDashboard.jsx (R-02).
// Content is unchanged from the original CycleSettingsCard.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { cycleApi } from '../../api/cycle.api';

function CycleSettingsCard() {
  const { token } = useAuth();
  const [weekInput, setWeekInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [currentWeek, setCurrentWeek] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadCurrentCycle() {
    cycleApi
      .getCurrentCycle(token)
      .then((res) => {
        setCurrentWeek(res.data.currentWeek);
        setAcademicYear(res.data.academicYear);
      })
      .catch((err) => setError(err.message || 'Could not load the current cycle.'));
  }

  useEffect(loadCurrentCycle, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await cycleApi.setCurrentCycle(
        token,
        parseInt(weekInput, 10),
        yearInput.trim() || academicYear
      );
      setCurrentWeek(res.data.currentWeek);
      setAcademicYear(res.data.academicYear);
      setWeekInput('');
      setYearInput('');
    } catch (err) {
      setError(err.message || 'Could not set the current cycle.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">Cycle Settings</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Every student&apos;s survey shows whichever week is set here. Advance it deliberately —
        it never changes on its own, so a holiday or delay never throws it out of sync. Runs on
        the Hijri calendar, matching WAMAS&apos;s convention.
      </p>

      <p className="mb-4 rounded-md bg-primary-muted px-4 py-3 text-sm text-text-primary">
        Currently: <span className="font-semibold text-primary">Week {currentWeek ?? '—'}</span> of{' '}
        <span className="font-semibold text-primary">{academicYear ?? '—'} AH</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-tertiary" htmlFor="cycleWeek">
              Week (1&ndash;22)
            </label>
            <input
              id="cycleWeek"
              type="number"
              min={1}
              max={22}
              value={weekInput}
              onChange={(e) => setWeekInput(e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-tertiary" htmlFor="cycleYear">
              Academic Year (Hijri)
            </label>
            <input
              id="cycleYear"
              type="text"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              placeholder="e.g. 1447-1448"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Update Cycle'}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}
    </section>
  );
}

export default function CycleSettings() {
  return (
    <AppLayout title="Cycle Settings" navItems={NAV_ITEMS.super_admin}>
      <main className="p-6">
        <CycleSettingsCard />
      </main>
    </AppLayout>
  );
}