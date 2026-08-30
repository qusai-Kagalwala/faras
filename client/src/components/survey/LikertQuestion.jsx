// client/src/components/survey/LikertQuestion.jsx
// FR-SUR-05: locked 5-point scale. NFR-U-02: large, thumb-friendly tap
// targets on mobile — each option is a full-width button, not a small radio.

export default function LikertQuestion({ question, value, onAnswer, saving }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <p className="mb-3 text-base font-medium text-text-primary">{question.text}</p>
      <div className="flex flex-col gap-2">
        {question.scale.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnswer(option.value)}
              disabled={saving}
              className={`min-h-11 w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-text-secondary hover:border-primary-light hover:bg-primary-muted'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}