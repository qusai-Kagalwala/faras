// client/src/pages/super-admin/Users.jsx
// Extracted from the old monolithic SuperAdminDashboard.jsx (R-02).
// Content is unchanged from the original UserRoleManagementCard +
// CreateAccountCard (they shared the ASSIGNABLE_ROLES constant, kept once
// here since both cards live on this page).

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import { ROLE_LABELS } from '../../utils/roles';

const ASSIGNABLE_ROLES = ['super_admin', 'department', 'teacher'];

function UserRoleManagementCard() {
  const { token } = useAuth();
  const [itsNumber, setItsNumber] = useState('');
  const [roles, setRoles] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    setRoles(null);
    setLoading(true);
    try {
      const res = await usersApi.getRoles(token, itsNumber.trim());
      setRoles(res.data.roles);
    } catch (err) {
      setError(err.message || 'Could not find this account.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(role, currentlyHeld) {
    setError(null);
    try {
      const res = currentlyHeld
        ? await usersApi.removeRole(token, itsNumber.trim(), role)
        : await usersApi.assignRole(token, itsNumber.trim(), role);
      setRoles(res.data.roles);
    } catch (err) {
      setError(err.message || 'Could not update roles.');
    }
  }

  async function handleDeactivate() {
    setError(null);
    try {
      await usersApi.deactivate(token, itsNumber.trim());
      setRoles(null);
    } catch (err) {
      setError(err.message || 'Could not deactivate this account.');
    }
  }

  async function handleReactivate() {
    setError(null);
    try {
      await usersApi.reactivate(token, itsNumber.trim());
    } catch (err) {
      setError(err.message || 'Could not reactivate this account.');
    }
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Manage User Roles
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        A single staff member may hold multiple roles (e.g. a department head who is also a
        teacher). Every account must always keep at least one role.
      </p>

      <form onSubmit={handleLookup} className="mb-4 flex gap-2">
        <input
          type="text"
          value={itsNumber}
          onChange={(e) => setItsNumber(e.target.value)}
          placeholder="8-digit Staff ITS Number"
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

      {!roles && !error && (
        <p className="text-sm text-text-tertiary">
          Search for a staff account above to view and manage their roles.
        </p>
      )}

      {roles && (
        <div className="space-y-2">
          {ASSIGNABLE_ROLES.map((role) => {
            const held = roles.includes(role);
            return (
              <label
                key={role}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm text-text-primary">{ROLE_LABELS[role].label}</span>
                <input type="checkbox" checked={held} onChange={() => handleToggle(role, held)} />
              </label>
            );
          })}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleDeactivate}
              className="rounded-md border border-error/40 px-3 py-1.5 text-sm text-error transition hover:bg-error-bg"
            >
              Deactivate Account
            </button>
            <button
              type="button"
              onClick={handleReactivate}
              className="rounded-md border border-success/40 px-3 py-1.5 text-sm text-success transition hover:bg-success-bg"
            >
              Reactivate Account
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function CreateAccountCard() {
  const { token } = useAuth();
  const [itsNumber, setItsNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [initialRole, setInitialRole] = useState('teacher');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await usersApi.createAccount(
        token,
        itsNumber.trim(),
        name.trim(),
        email.trim() || undefined,
        initialRole
      );
      setResult(res.data);
      setItsNumber('');
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Could not create this account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Create Staff Account
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Starter password is always the account&apos;s own ITS Number — the new user will be
        required to change it on first login.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={itsNumber}
          onChange={(e) => setItsNumber(e.target.value)}
          placeholder="8-digit ITS Number"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <select
          value={initialRole}
          onChange={(e) => setInitialRole(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {ASSIGNABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role].label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-3 rounded-md border border-success/20 bg-success-bg px-3 py-2 text-sm text-success">
          Created account for {result.name} ({result.itsNumber}).
        </div>
      )}
    </section>
  );
}

export default function Users() {
  return (
    <AppLayout title="Manage Users" navItems={NAV_ITEMS.super_admin}>
      <main className="columns-1 gap-4 p-6 sm:columns-2">
        <UserRoleManagementCard />
        <CreateAccountCard />
      </main>
    </AppLayout>
  );
}