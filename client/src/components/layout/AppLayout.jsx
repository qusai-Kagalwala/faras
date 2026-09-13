// client/src/components/layout/AppLayout.jsx
// Shared shell for staff dashboards (Super Admin, Department, Teacher).
// Student portal deliberately does NOT use this — mobile-first with its
// own custom header, no multi-page nav needed.
//
// Adds a mobile hamburger trigger (U-01) — only rendered when the role
// actually has more than one page to navigate between.

import { useState } from 'react';
import TopBar from '../common/TopBar';
import Sidebar from './Sidebar';

export default function AppLayout({ title, navItems, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const hasMultiplePages = navItems && navItems.length > 1;

  return (
    <div className="min-h-screen bg-cream">
      <TopBar title={title} />

      {hasMultiplePages && (
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex w-full items-center gap-2 border-b border-border bg-white px-4 py-2 text-sm text-text-secondary md:hidden"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
          Menu
        </button>
      )}

      <div className="flex min-h-screen">
        <Sidebar
          items={navItems}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}