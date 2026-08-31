// client/src/components/common/TopBar.jsx
// Shared staff dashboard header. Per the design system: primary teal is
// used for the top bar/sidebar/primary actions. Desktop-first (NFR-U-03).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DASHBOARD_PATH_BY_ROLE, ROLE_LABELS } from '../../utils/roles';
import RolePickerModal from './RolePickerModal';

export default function TopBar({ title }) {
  const { user, availableRoles, switchRole, askEveryTime, setAskEveryTime, logout } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [switchError, setSwitchError] = useState(null);
  const navigate = useNavigate();

  async function handlePickRole(role) {
    setSwitchError(null);
    setShowPicker(false);

    if (role === user.role) return;

    try {
      const newUser = await switchRole(role);
      navigate(DASHBOARD_PATH_BY_ROLE[newUser.role], { replace: true });
    } catch (err) {
      setSwitchError(err.message || 'Could not switch roles. Please try again.');
    }
  }

  return (
    <header className="flex items-center justify-between bg-primary px-6 py-4 shadow-sm">
      <div>
        <p className="font-display text-lg font-bold text-white">FARAS</p>
        <h1 className="text-sm text-white/80">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-white/90">
            {user.name}
            {availableRoles.length > 1 && (
              <span className="ml-1 text-white/60">({ROLE_LABELS[user.role].label})</span>
            )}
          </span>
        )}
        {availableRoles.length > 1 && (
          <button
            onClick={() => setShowPicker(true)}
            className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
          >
            Switch Role
          </button>
        )}
        <button
          onClick={logout}
          className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
        >
          Log Out
        </button>
      </div>

      {showPicker && (
        <RolePickerModal
          availableRoles={availableRoles}
          currentRole={user.role}
          askEveryTime={askEveryTime}
          onToggleAskEveryTime={setAskEveryTime}
          onSelect={handlePickRole}
          onClose={() => {
            setShowPicker(false);
            setSwitchError(null);
          }}
          error={switchError}
        />
      )}
    </header>
  );
}