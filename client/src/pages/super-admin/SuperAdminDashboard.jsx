// client/src/pages/super-admin/SuperAdminDashboard.jsx
import { useState, useEffect } from 'react';
import TopBar from '../../components/common/TopBar';
import { useAuth } from '../../context/AuthContext';
import { schedulingApi } from '../../api/scheduling.api';
import { usersApi } from '../../api/users.api';
import { classesApi } from '../../api/classes.api';
import { cycleApi } from '../../api/cycle.api';
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

function ClassesSubjectsCard() {
  const { token } = useAuth();
  const [classes, setClasses] = useState(null);
  const [subjects, setSubjects] = useState(null);
  const [teachers, setTeachers] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [mappings, setMappings] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherIts, setSelectedTeacherIts] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      classesApi.getClasses(token),
      classesApi.getAllSubjects(token),
      classesApi.getAllTeachers(token),
    ])
      .then(([classesRes, subjectsRes, teachersRes]) => {
        setClasses(classesRes.data.classes);
        setSubjects(subjectsRes.data.subjects);
        setTeachers(teachersRes.data.teachers);
      })
      .catch((err) => setError(err.message || 'Could not load classes/subjects/teachers.'))
      .finally(() => setLoading(false));
  }, [token]);

  function loadMappings(classId) {
    classesApi
      .getClassSubjects(token, classId)
      .then((res) => setMappings(res.data.subjects))
      .catch((err) => setError(err.message || "Could not load this class's subjects."));
  }

  function handleSelectClass(e) {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setMappings(null);
    setError(null);
    if (classId) loadMappings(classId);
  }

  async function handleMap(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await classesApi.mapSubject(
        token,
        selectedClassId,
        parseInt(selectedSubjectId, 10),
        selectedTeacherIts || null
      );
      setMappings(res.data.subjects);
      setSelectedSubjectId('');
      setSelectedTeacherIts('');
    } catch (err) {
      setError(err.message || 'Could not map this subject.');
    }
  }

  async function handleUnmap(subjectId) {
    setError(null);
    try {
      const res = await classesApi.unmapSubject(token, selectedClassId, subjectId);
      setMappings(res.data.subjects);
    } catch (err) {
      setError(err.message || 'Could not remove this mapping.');
    }
  }

  if (loading) {
    return (
      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
          Classes & Subjects
        </h2>
        <p className="text-sm text-text-secondary">Loading...</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Classes & Subjects
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Manage which subjects (and which teacher) are mapped to each class. This is what the
        Scheduling Engine reads from.
      </p>

      <select
        value={selectedClassId}
        onChange={handleSelectClass}
        className="mb-3 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
      >
        <option value="">Select a class...</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.display_name}
          </option>
        ))}
      </select>

      {error && (
        <div className="mb-3 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {selectedClassId && mappings && (
        <>
          <div className="mb-3 space-y-2">
            {mappings.length === 0 && (
              <p className="text-sm text-text-tertiary">No subjects mapped to this class yet.</p>
            )}
            {mappings.map((m) => (
              <div
                key={m.subject_id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium text-text-primary">{m.subject_name}</span>{' '}
                  <span className="text-text-tertiary">
                    — {m.teacher_name || 'no teacher assigned'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleUnmap(m.subject_id)}
                  className="text-xs text-error underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleMap} className="flex flex-wrap gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="flex-1 rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              required
            >
              <option value="">Subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={selectedTeacherIts}
              onChange={(e) => setSelectedTeacherIts(e.target.value)}
              className="flex-1 rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">No teacher (optional)</option>
              {teachers.map((t) => (
                <option key={t.its_number} value={t.its_number}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark"
            >
              Map
            </button>
          </form>
        </>
      )}
    </section>
  );
}

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
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">Cycle Settings</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Every student&apos;s survey shows whichever week is set here. Advance it deliberately —
        it never changes on its own, so a holiday or delay never throws it out of sync. Runs on
        the Hijri calendar, matching WAMAS&apos;s convention.
      </p>

      <p className="mb-3 text-sm text-text-primary">
        Current: <span className="font-medium">Week {currentWeek ?? '—'}</span>,{' '}
        <span className="font-medium">{academicYear ?? '—'}</span> AH
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          min={1}
          max={22}
          value={weekInput}
          onChange={(e) => setWeekInput(e.target.value)}
          placeholder="Week 1-22"
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <input
          type="text"
          value={yearInput}
          onChange={(e) => setYearInput(e.target.value)}
          placeholder="e.g. 1447-1448"
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Set'}
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

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-cream">
      <TopBar title="System Configuration" />
      <main className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        <ClassesSubjectsCard />
        <SchedulingEngineCard />
        <ConfigCard
          title="Question Bank"
          description="Maintain the master feedback statement bank and focus areas."
        />
        <UserRoleManagementCard />
        <CreateAccountCard />
        <CycleSettingsCard />
      </main>
    </div>
  );
}