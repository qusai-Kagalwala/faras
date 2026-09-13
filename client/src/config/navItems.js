// client/src/config/navItems.js
// Per-role navigation, used by Sidebar and each role's Dashboard quick-link
// cards. `description` is optional — Sidebar ignores it, Dashboard uses it
// for the one-line card subtitle. `icon` is a key into Sidebar's ICONS map.

export const NAV_ITEMS = {
  super_admin: [
    { label: 'Dashboard', path: '/super-admin', icon: 'grid' },
    {
      label: 'Classes & Subjects',
      path: '/super-admin/classes',
      icon: 'book',
      description:
        'Manage which subjects (and which teacher) are mapped to each class — what the Scheduling Engine reads from.',
    },
    {
      label: 'Scheduling Engine',
      path: '/super-admin/scheduling',
      icon: 'calendar',
      description:
        'Generate a cohort rotation schedule for a class. Existing weeks are never overwritten.',
    },
    {
      label: 'Question Bank',
      path: '/super-admin/questions',
      icon: 'help',
      description:
        'Maintain the master feedback statement bank and which focus areas are active each week.',
    },
    {
      label: 'Manage Users',
      path: '/super-admin/users',
      icon: 'users',
      description: 'Assign staff roles and create new staff accounts.',
    },
    {
      label: 'Manage Students',
      path: '/super-admin/students',
      icon: 'user',
      description: "Look up a student and deactivate/reactivate their account.",
    },
    {
      label: 'Cycle Settings',
      path: '/super-admin/cycle',
      icon: 'clock',
      description: 'Set which week and Hijri academic year the whole school is currently on.',
    },
    {
      label: 'Review Groups',
      path: '/super-admin/groups',
      icon: 'layers',
      description: 'Assign a subject to a Department Head, forming a Review Group.',
    },
  ],
  department: [
    { label: 'Dashboard', path: '/department', icon: 'grid' },
    {
      label: 'Report Review Queue',
      path: '/department/reports',
      icon: 'file',
      description: 'Review, advance, and dispatch AI-generated reports through the approval workflow.',
    },
    {
      label: 'Teacher Lookup',
      path: '/department/lookup',
      icon: 'search',
      description: 'Look up a specific teacher\u2019s mapped feedback by focus area.',
    },
    {
      label: 'Review Cycles',
      path: '/department/review-cycles',
      icon: 'repeat',
      description: 'Propose and start a review cycle for your assigned subject.',
    },
  ],
  teacher: [{ label: 'Dashboard', path: '/teacher', icon: 'grid' }],
};