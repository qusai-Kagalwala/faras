// client/src/pages/department/TeacherLookup.jsx
// Extracted from the old monolithic DepartmentDashboard.jsx (R-03).
// Content unchanged from the original TeacherLookupCard.

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { NAV_ITEMS } from '../../config/navItems';
import { useAuth } from '../../context/AuthContext';
import { mappingApi } from '../../api/mapping.api';

function TeacherLookupCard() {
  const { token } = useAuth();
  const [teacherIts, setTeacherIts] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await mappingApi.getTeacherFeedback(token, teacherIts.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'Could not load feedback for this teacher.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-dark-brown">
        Teacher Feedback Lookup
      </h2>

      <form onSubmit={handleLookup} className="mb-4 flex gap-2">
        <input
          type="text"
          value={teacherIts}
          onChange={(e) => setTeacherIts(e.target.value)}
          placeholder="8-digit Teacher ITS Number"
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
        <div className="rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </div>
      )}

      {result && (
        <div>
          <p className="mb-3 text-sm text-text-secondary">
            <span className="font-medium text-dark-brown">{result.teacherName}</span> —{' '}
            {result.totalResponsesMapped} response(s) mapped
          </p>

          {result.categorizedFeedback.length === 0 && (
            <p className="text-sm text-text-tertiary">No feedback recorded for this teacher yet.</p>
          )}

          <div className="space-y-3">
            {result.categorizedFeedback.map((f) => (
              <div key={f.focusArea} className="rounded-md border border-border p-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-text-primary">{f.focusArea}</span>
                  <span className="text-text-secondary">
                    {f.averageScore !== null ? `${f.averageScore} / 5` : 'No score data'}
                  </span>
                </div>
                {f.representativeQuotes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm italic text-text-tertiary">
                    {f.representativeQuotes.map((q, i) => (
                      <li key={i}>&ldquo;{q}&rdquo;</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function TeacherLookup() {
  return (
    <AppLayout title="Teacher Feedback Lookup" navItems={NAV_ITEMS.department}>
      <main className="p-6">
        <TeacherLookupCard />
      </main>
    </AppLayout>
  );
}