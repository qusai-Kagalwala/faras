// client/src/config/navItems.js
// Per-role navigation, used by Sidebar and each role's Dashboard quick-link
// cards. `description` is optional — Sidebar ignores it, Dashboard uses it
// for the one-line card subtitle.

export const NAV_ITEMS = {
  super_admin: [
    { label: 'Dashboard', path: '/super-admin' },
    {
      label: 'Classes & Subjects',
      path: '/super-admin/classes',
      description:
        'Manage which subjects (and which teacher) are mapped to each class — what the Scheduling Engine reads from.',
    },
    {
      label: 'Scheduling Engine',
      path: '/super-admin/scheduling',
      description:
        'Generate a cohort rotation schedule for a class. Existing weeks are never overwritten.',
    },
    {
      label: 'Question Bank',
      path: '/super-admin/questions',
      description:
        'Maintain the master feedback statement bank and which focus areas are active each week.',
    },
    {
      label: 'Manage Users',
      path: '/super-admin/users',
      description: 'Assign staff roles and create new staff accounts.',
    },
    {
      label: 'Manage Students',
      path: '/super-admin/students',
      description: "Look up a student and deactivate/reactivate their account.",
    },
    {
      label: 'Cycle Settings',
      path: '/super-admin/cycle',
      description: 'Set which week and Hijri academic year the whole school is currently on.',
    },
  ],
  department: [
    { label: 'Dashboard', path: '/department' },
    {
      label: 'Report Review Queue',
      path: '/department/reports',
      description: 'Review, advance, and dispatch AI-generated reports through the approval workflow.',
    },
    {
      label: 'Teacher Lookup',
      path: '/department/lookup',
      description: 'Look up a specific teacher\u2019s mapped feedback by focus area.',
    },
  ],
  teacher: [{ label: 'Dashboard', path: '/teacher' }],
};