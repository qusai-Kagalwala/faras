// client/src/components/common/RolePickerModal.jsx
// Shown by default after login for anyone holding multiple roles, and
// reusable from TopBar's "Switch Role" control at any time afterward. The
// "always ask" toggle is always visible here so it's discoverable and
// changeable regardless of which context opened the picker.

import { ROLE_ORDER, ROLE_LABELS } from '../../utils/roles';

export default function RolePickerModal({
  availableRoles,
  currentRole,
  askEveryTime,
  onToggleAskEveryTime,
  onSelect,
  onClose,
  error,
}) {
  const orderedRoles = ROLE_ORDER.filter((r) => availableRoles.includes(r));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-lg">
        <h2 className="mb-1 font-display text-xl font-bold text-dark-brown">Choose a role</h2>
        <p className="mb-4 text-sm text-text-secondary">
          You hold {availableRoles.length} roles. Which would you like to use?
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {orderedRoles.map((role) => {
            const isCurrent = role === currentRole;
            return (
              <button
                key={role}
                type="button"
                onClick={() => onSelect(role)}
                className={`rounded-md border p-4 text-left transition ${
                  isCurrent
                    ? 'border-primary bg-primary-muted'
                    : 'border-border bg-white hover:border-primary-light hover:bg-cream'
                }`}
              >
                <p className="font-medium text-text-primary">{ROLE_LABELS[role].label}</p>
                <p className="text-xs text-text-tertiary">{ROLE_LABELS[role].description}</p>
              </button>
            );
          })}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={askEveryTime}
            onChange={(e) => onToggleAskEveryTime(e.target.checked)}
          />
          Always ask me which role to use after logging in
        </label>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-sm text-text-tertiary underline"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}