// client/src/components/layout/Sidebar.jsx
// Redesigned to match WAMAS's real production drawer (verified against
// live screenshots): dark teal background instead of white, a profile
// card (avatar initials + name + role) at the top, a "NAVIGATION" section
// label, an icon next to every link, and a distinct highlight on the
// active item. Desktop sidebar keeps the same content, lighter styling
// appropriate for a permanently-visible panel.

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/roles';
import { getInitials } from '../../utils/initials';

const ICONS = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
      <path d="M12 17h.01" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  ),
};

function NavLinks({ items, location, onNavigate, variant }) {
  const isDark = variant === 'dark';
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? isDark
                    ? 'bg-white/15 font-medium text-white'
                    : 'bg-primary-muted font-medium text-primary'
                  : isDark
                    ? 'text-white/80 hover:bg-white/10'
                    : 'text-text-secondary hover:bg-cream-dark'
              }`}
            >
              {ICONS[item.icon]}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ProfileCard({ user }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-white/15 pb-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-white/10 text-sm font-semibold text-white">
        {getInitials(user?.name)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{user?.name}</p>
        <p className="text-xs uppercase tracking-wide text-gold-light">
          {user ? ROLE_LABELS[user.role].label : ''}
        </p>
      </div>
    </div>
  );
}

export default function Sidebar({ items, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { user } = useAuth();

  if (!items || items.length <= 1) return null;

  return (
    <>
      {/* Desktop: always-visible light sidebar */}
      <nav className="hidden w-56 shrink-0 border-r border-border bg-white p-4 md:block">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Navigation
        </p>
        <NavLinks items={items} location={location} variant="light" />
      </nav>

      {/* Mobile: real off-canvas overlay, dark drawer matching WAMAS's pattern */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <nav className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-primary p-4 shadow-lg">
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="mb-3 text-xl text-white/80"
            >
              &times;
            </button>
            <ProfileCard user={user} />
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-white/50">
              Navigation
            </p>
            <NavLinks items={items} location={location} onNavigate={onCloseMobile} variant="dark" />
          </nav>
        </div>
      )}
    </>
  );
}