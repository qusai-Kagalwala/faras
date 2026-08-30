// client/src/components/common/TopBar.jsx
// Shared staff dashboard header. Per the design system: primary teal is
// used for the top bar/sidebar/primary actions. Desktop-first (NFR-U-03).

import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-primary px-6 py-4 shadow-sm">
      <div>
        <p className="font-display text-lg font-bold text-white">FARAS</p>
        <h1 className="text-sm text-white/80">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-white/90">{user.name}</span>}
        <button
          onClick={logout}
          className="rounded-md border border-white/30 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}