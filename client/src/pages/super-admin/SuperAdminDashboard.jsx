// client/src/pages/super-admin/SuperAdminDashboard.jsx
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { schedulingApi } from '../../api/scheduling.api';
import { usersApi } from '../../api/users.api';
import { classesApi } from '../../api/classes.api';
import { cycleApi } from '../../api/cycle.api';
import { questionsApi } from '../../api/questions.api';
import { studentsApi } from '../../api/students.api';
import { ROLE_LABELS } from '../../utils/roles';

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
      .catch((err) => setError(err.message || 'Could not load this class\u2019s subjects.'));
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
      <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
          Classes & Subjects
        </h2>
        <p className="text-sm text-text-secondary">Loading...</p>
      </section>
    );
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
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
      setError(err.message || 'Could not save this week\u2019s focus plan.');
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

export default function SuperAdminDashboard() {
  return (
    <AppLayout title="System Configuration" navItems={NAV_ITEMS.super_admin}>
      <main className="columns-1 gap-4 p-6 sm:columns-2 lg:columns-3">
        <ClassesSubjectsCard />
        <SchedulingEngineCard />
        <QuestionBankCard />
        <UserRoleManagementCard />
        <CreateAccountCard />
        <CycleSettingsCard />
        <WeekFocusPlanCard />
        <ManageStudentCard />
      </main>
    </AppLayout>
  );
}