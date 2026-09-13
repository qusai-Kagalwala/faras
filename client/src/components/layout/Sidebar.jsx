// client/src/components/layout/Sidebar.jsx
// Renders nothing when a role has one nav item or fewer — a sidebar with
// a single link is just clutter. Naturally starts appearing once R-02/R-03
// add real separate pages per role.

import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ items }) {
  const location = useLocation();

  if (!items || items.length <= 1) return null;

  return (
    <nav className="hidden w-56 shrink-0 border-r border-border bg-white p-4 md:block">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
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
    </nav>
  );
}