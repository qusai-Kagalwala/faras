// client/src/pages/student/StudentDashboard.jsx
// Mobile-first per NFR-U-01. Never render teacher name/ITS here or in any
// child component — subject only (FR-SP-02).

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { surveyApi } from '../../api/survey.api';
import LikertQuestion from '../../components/survey/LikertQuestion';
import FreeTextQuestion from '../../components/survey/FreeTextQuestion';

export default function StudentDashboard() {
  const { token, logout } = useAuth();

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    surveyApi
      .getCurrent(token)
      .then((res) => setSurvey(res.data))
      .catch((err) => setError(err.message || "Could not load this week's survey."))
      .finally(() => setLoading(false));
  }, [token]);

  const saveAnswer = useCallback(
    async (statementId, value, type) => {
      setSaving(true);
      setSaveError(null);
      const answerPayload =
        type === 'likert' ? { statementId, likertValue: value } : { statementId, freeText: value };

      try {
        await surveyApi.submit(token, [answerPayload]);
        setAnswers((prev) => ({ ...prev, [statementId]: value }));
      } catch (err) {
        setSaveError(err.message || 'Could not save your answer. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [token]
  );

  const answeredCount = Object.keys(answers).length;
  const totalCount = survey?.questions.length || 0;

  return (
    <div className="min-h-screen bg-cream pb-8">
      <header className="bg-primary px-4 py-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold text-white">FARAS</p>
          <button onClick={logout} className="text-sm text-white/80 underline">
            Log Out
          </button>
        </div>
        <h1 className="mt-3 text-lg font-semibold text-white">This Week&apos;s Feedback</h1>
        {survey && <p className="text-sm text-white/80">Subject: {survey.subjectName}</p>}
      </header>

      <main className="mx-auto max-w-lg space-y-3 p-4">
        {loading && (
          <div className="rounded-lg border border-border bg-white p-5 text-center text-text-secondary shadow-sm">
            Loading your survey...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-error/20 bg-error-bg p-5 text-center text-error shadow-sm">
            {error}
          </div>
        )}

        {survey && (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-secondary shadow-sm">
              <span>
                {answeredCount} of {totalCount} answered
              </span>
              {saving && <span className="text-text-tertiary">Saving...</span>}
            </div>

            {saveError && (
              <div className="rounded-lg border border-error/20 bg-error-bg px-4 py-2 text-sm text-error shadow-sm">
                {saveError}
              </div>
            )}

            {survey.questions.map((q) =>
              q.type === 'likert' ? (
                <LikertQuestion
                  key={q.statementId}
                  question={q}
                  value={answers[q.statementId]}
                  saving={saving}
                  onAnswer={(value) => saveAnswer(q.statementId, value, 'likert')}
                />
              ) : (
                <FreeTextQuestion
                  key={q.statementId}
                  question={q}
                  value={answers[q.statementId]}
                  saving={saving}
                  onAnswer={(value) => saveAnswer(q.statementId, value, 'free_text')}
                />
              )
            )}

            {answeredCount === totalCount && totalCount > 0 && (
              <div className="rounded-lg border border-success/20 bg-success-bg p-4 text-center text-sm font-medium text-success shadow-sm">
                All done for this week — thank you!
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}