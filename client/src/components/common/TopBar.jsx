// client/src/components/common/TopBar.jsx
// Redesigned to match WAMAS's real production header (verified against
// live screenshots): mobile hamburger trigger integrated into this single
// row (not a separate bar below), role shown as a pill (with a dropdown
// chevron only when there's actually more than one role to switch to),
// and a real avatar circle (initials) with Log Out tucked into a small
// dropdown off of it, instead of a separate always-visible button.

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DASHBOARD_PATH_BY_ROLE, ROLE_LABELS } from '../../utils/roles';
import { getInitials } from '../../utils/initials';
import RolePickerModal from './RolePickerModal';
import NotificationBell from './NotificationBell';

function AvatarMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gold bg-white/10 text-xs font-semibold text-white transition hover:bg-white/20"
      >
        {getInitials(user?.name)}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-border bg-white py-1 shadow-lg">
          <p className="truncate border-b border-border px-3 py-2 text-sm font-medium text-dark-brown">
            {user?.name}
          </p>
          <Link
            to="/change-password"
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-cream-dark"
          >
            Change Password
          </Link>
          <button
            type="button"
            onClick={logout}
            className="block w-full px-3 py-2 text-left text-sm text-error hover:bg-error-bg"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopBar({ title, onMenuClick }) {
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

  const hasMultipleRoles = availableRoles.length > 1;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-primary px-4 py-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="text-white md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}
        <div>
          <p className="font-display text-lg font-bold text-white">FARAS</p>
          <h1 className="text-sm text-white/80">{title}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {user && (
          <button
            type="button"
            onClick={() => hasMultipleRoles && setShowPicker(true)}
            disabled={!hasMultipleRoles}
            className="flex items-center gap-1 rounded-full border border-white/30 px-3 py-1 text-sm text-white transition hover:bg-white/10 disabled:cursor-default disabled:hover:bg-transparent"
          >
            {ROLE_LABELS[user.role].label}
            {hasMultipleRoles && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="m6 9 6 6 6-6" />
              </svg>
            )}
          </button>
        )}
        <NotificationBell />
        <AvatarMenu user={user} logout={logout} />
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