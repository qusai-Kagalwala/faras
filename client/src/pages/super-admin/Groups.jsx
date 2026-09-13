// client/src/pages/super-admin/Groups.jsx
// Super Admin creates a Review Group by assigning a subject to a
// Department Head. The group's class+kitab scope is derived automatically
// from that subject — nothing to manually pick here.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { classesApi } from '../../api/classes.api';
import { reviewGroupsApi } from '../../api/reviewGroups.api';

function CreateGroupCard({ subjects, onCreated }) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [departmentHeadIts, setDepartmentHeadIts] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await reviewGroupsApi.createGroup(
        token,
        name.trim(),
        parseInt(subjectId, 10),
        departmentHeadIts.trim(),
        deadline || null
      );
      setName('');
      setSubjectId('');
      setDepartmentHeadIts('');
      setDeadline('');
      onCreated();
    } catch (err) {
      setError(err.message || 'Could not create this Review Group.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-display text-lg font-semibold text-dark-brown">
        Create Review Group
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        Assigning a subject automatically brings every class (and kitab) that teaches it into
        scope — nothing to pick manually.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name (e.g. English Review Group)"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        >
          <option value="">Select a subject...</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={departmentHeadIts}
          onChange={(e) => setDepartmentHeadIts(e.target.value)}
          placeholder="Department Head's 8-digit ITS Number"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        <div>
          <label className="mb-1 block text-xs text-text-tertiary" htmlFor="deadline">
            Deadline (optional)
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create Group'}
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

function GroupsListCard({ groups }) {
  return (
    <section className="mb-4 break-inside-avoid rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">
        Existing Review Groups
      </h2>

      {groups.length === 0 && (
        <p className="text-sm text-text-tertiary">No Review Groups created yet.</p>
      )}

      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="rounded-md border border-border p-3 text-sm">
            <p className="font-medium text-text-primary">{g.name}</p>
            <p className="text-text-tertiary">
              {g.subject_name} — headed by {g.department_head_name} ({g.department_head_its})
            </p>
            {g.deadline && (
              <p className="mt-1 text-xs text-text-tertiary">
                Deadline: {new Date(g.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Groups() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState(null);
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState(null);

  function loadGroups() {
    reviewGroupsApi
      .getGroups(token)
      .then((res) => setGroups(res.data.groups))
      .catch((err) => setError(err.message || 'Could not load Review Groups.'));
  }

  function loadAll() {
    classesApi
      .getAllSubjects(token)
      .then((res) => setSubjects(res.data.subjects))
      .catch((err) => setError(err.message || 'Could not load subjects.'));
    loadGroups();
  }

  useEffect(loadAll, [token]);

  return (
    <AppLayout title="Review Groups" navItems={NAV_ITEMS.super_admin}>
      <main className="columns-1 gap-4 p-6 sm:columns-2">
        {error && (
          <div className="mb-4 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}
        {subjects && <CreateGroupCard subjects={subjects} onCreated={loadGroups} />}
        {groups && <GroupsListCard groups={groups} />}
      </main>
    </AppLayout>
  );
}