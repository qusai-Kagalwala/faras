// client/src/components/layout/Sidebar.jsx
// FIXED REAL BUG (U-01): previously `hidden ... md:block` meant the
// sidebar disappeared entirely below the md breakpoint with NO
// alternative — staff on mobile had no way to navigate between pages at
// all except typing URLs directly. Now renders as an always-visible
// desktop sidebar AND a real off-canvas mobile panel (triggered by
// AppLayout's hamburger button), not just "hidden."
//
// Still renders nothing when a role has one nav item or fewer.

import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ items, mobileOpen, onCloseMobile }) {
  const location = useLocation();

  if (!items || items.length <= 1) return null;

  const navList = (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onCloseMobile}
              className={`block rounded-md px-3 py-2 text-sm transition ${
                active
                  ? 'bg-primary-muted font-medium text-primary'
                  : 'text-text-secondary hover:bg-cream-dark'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <nav className="hidden w-56 shrink-0 border-r border-border bg-white p-4 md:block">
        {navList}
      </nav>

      {/* Mobile: real off-canvas overlay, only in the DOM when open */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <nav className="absolute left-0 top-0 h-full w-64 overflow-y-auto bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm font-semibold text-dark-brown">Menu</p>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="text-lg text-text-tertiary"
              >
                &times;
              </button>
            </div>
            {navList}
          </nav>
        </div>
      )}
    </>
  );
}