// client/src/pages/super-admin/ClassesSubjects.jsx
// Extracted from the old monolithic SuperAdminDashboard.jsx (R-02).
// Content is unchanged from the original ClassesSubjectsCard.

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { classesApi } from '../../api/classes.api';

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

export default function ClassesSubjects() {
  return (
    <AppLayout title="Classes & Subjects" navItems={NAV_ITEMS.super_admin}>
      <main className="p-6">
        <ClassesSubjectsCard />
      </main>
    </AppLayout>
  );
}