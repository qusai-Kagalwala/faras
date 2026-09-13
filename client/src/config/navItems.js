// client/src/config/navItems.js
// Per-role navigation, used by Sidebar. Currently one entry per role since
// no pages have been split out yet (R-01 is just the shell) — this grows
// as R-02 (Super Admin) and R-03 (Department) add real separate pages.

export const NAV_ITEMS = {
  super_admin: [{ label: 'Dashboard', path: '/super-admin' }],
  department: [{ label: 'Dashboard', path: '/department' }],
  teacher: [{ label: 'Dashboard', path: '/teacher' }],
};