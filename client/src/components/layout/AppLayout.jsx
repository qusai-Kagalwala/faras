// client/src/components/layout/AppLayout.jsx
// Shared shell for staff dashboards (Super Admin, Department, Teacher).
// Student portal deliberately does NOT use this — it's mobile-first with
// its own custom header, no multi-page nav (per the design system's
// student-mobile-first / staff-desktop-first split).

import TopBar from '../common/TopBar';
import Sidebar from './Sidebar';

export default function AppLayout({ title, navItems, children }) {
  return (
    <div className="min-h-screen bg-cream">
      <TopBar title={title} />
      <div className="flex min-h-screen">
        <Sidebar items={navItems} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}