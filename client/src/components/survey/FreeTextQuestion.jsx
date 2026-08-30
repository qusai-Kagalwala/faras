// client/src/components/survey/FreeTextQuestion.jsx
// Free text needs a deliberate save (not per-keystroke), unlike Likert's
// single-tap answer — save fires on blur or via the explicit Save button.

import { useState, useEffect } from 'react';

export default function FreeTextQuestion({ question, value, onAnswer, saving }) {
  const [draft, setDraft] = useState(value || '');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(value || '');
    setDirty(false);
  }, [value]);

  function handleSave() {
    if (draft.trim().length === 0) return;
    onAnswer(draft.trim());
    setDirty(false);
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <p className="mb-3 text-base font-medium text-text-primary">{question.text}</p>
      <textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setDirty(true);
        }}
        onBlur={handleSave}
        disabled={saving}
        rows={3}
        placeholder="Type your answer..."
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted disabled:opacity-60"
      />
      {dirty && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || draft.trim().length === 0}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save
        </button>
      )}
      {!dirty && value && <p className="mt-2 text-xs text-success">Saved</p>}
    </div>
  );
}