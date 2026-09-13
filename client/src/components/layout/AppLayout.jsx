// client/src/components/layout/AppLayout.jsx
// Shared shell for staff dashboards. The mobile menu trigger now lives
// INSIDE TopBar itself (matching WAMAS's real single-row header layout,
// verified against production screenshots), rather than a separate bar
// underneath it.

import { useState } from 'react';
import TopBar from '../common/TopBar';
import Sidebar from './Sidebar';

export default function AppLayout({ title, navItems, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const hasMultiplePages = navItems && navItems.length > 1;

  return (
    <div className="min-h-screen bg-cream">
      <TopBar title={title} onMenuClick={hasMultiplePages ? () => setMobileNavOpen(true) : undefined} />

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