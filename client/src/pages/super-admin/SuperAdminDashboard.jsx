// client/src/pages/super-admin/SuperAdminDashboard.jsx
import { useState } from 'react';
import TopBar from '../../components/common/TopBar';
import { useAuth } from '../../context/AuthContext';
import { schedulingApi } from '../../api/scheduling.api';
import { usersApi } from '../../api/users.api';
import { ROLE_LABELS } from '../../utils/roles';

function ConfigCard({ title, description }) {
  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm transition hover:shadow-md">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">{title}</h2>
      <p className="text-sm text-text-secondary">{description}</p>
    </section>
  );
}

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
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
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
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
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
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
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

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-cream">
      <TopBar title="System Configuration" />
      <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        <ConfigCard
          title="Classes & Subjects"
          description="Manage the academic structure — classes, subjects, and teacher assignments."
        />
        <SchedulingEngineCard />
        <ConfigCard
          title="Question Bank"
          description="Maintain the master feedback statement bank and focus areas."
        />
        <UserRoleManagementCard />
        <CreateAccountCard />
      </main>
    </div>
  );
}