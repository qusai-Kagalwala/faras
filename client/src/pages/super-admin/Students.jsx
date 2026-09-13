// client/src/pages/super-admin/Students.jsx
// Extracted from the old monolithic SuperAdminDashboard.jsx (R-02).
// Content is unchanged from the original ManageStudentCard.

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students.api';

function ManageStudentCard() {
  const { token } = useAuth();
  const [itsNumber, setItsNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    setStudent(null);
    setLoading(true);
    try {
      const res = await studentsApi.getStudent(token, itsNumber.trim());
      setStudent(res.data);
    } catch (err) {
      setError(err.message || 'Could not find this student.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate() {
    setError(null);
    try {
      const res = await studentsApi.deactivate(token, itsNumber.trim());
      setStudent(res.data);
    } catch (err) {
      setError(err.message || 'Could not deactivate this student.');
    }
  }

  async function handleReactivate() {
    setError(null);
    try {
      const res = await studentsApi.reactivate(token, itsNumber.trim());
      setStudent(res.data);
    } catch (err) {
      setError(err.message || 'Could not reactivate this student.');
    }
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Manage Student Accounts
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Deactivate a student&apos;s account (e.g. they&apos;ve left the school). Their survey
        history is kept, not deleted.
      </p>

      <form onSubmit={handleLookup} className="mb-3 flex gap-2">
        <input
          type="text"
          value={itsNumber}
          onChange={(e) => setItsNumber(e.target.value)}
          placeholder="8-digit Student ITS Number"
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
        <div className="mb-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {!student && !error && (
        <p className="text-sm text-text-tertiary">
          Search for a student account above to view and manage it.
        </p>
      )}

      {student && (
        <div className="rounded-md border border-border p-3">
          <p className="text-sm font-medium text-text-primary">{student.name}</p>
          <p className="text-xs text-text-tertiary">{student.class_name}</p>
          <p className="mt-1 text-xs">
            Status:{' '}
            <span className={student.is_active ? 'text-success' : 'text-error'}>
              {student.is_active ? 'Active' : 'Deactivated'}
            </span>
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={!student.is_active}
              className="rounded-md border border-error/40 px-3 py-1.5 text-xs text-error transition hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Deactivate
            </button>
            <button
              type="button"
              onClick={handleReactivate}
              disabled={student.is_active}
              className="rounded-md border border-success/40 px-3 py-1.5 text-xs text-success transition hover:bg-success-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reactivate
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Students() {
  return (
    <AppLayout title="Manage Students" navItems={NAV_ITEMS.super_admin}>
      <main className="p-6">
        <ManageStudentCard />
      </main>
    </AppLayout>
  );
}