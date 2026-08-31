// client/src/routes/ProtectedRoute.jsx
// Client-side route guard. This is UI-only convenience (NFR-S-02) — real
// enforcement happens server-side via requireRole() (server/middleware).
// Never treat this as the actual security boundary.
//
// KEY FIX (matches WAMAS's proven production pattern): on a role
// mismatch, redirect to the CURRENT role's correct dashboard, not to
// /unauthorized. During a role switch, React can briefly re-render the
// OLD page after the new role has already landed in context — with this
// pattern, that transient mismatch just sends the person to where they
// were already headed, instead of bouncing them to an error page.
// /unauthorized is now reserved for roles that genuinely have no known
// dashboard at all (shouldn't happen with FARAS's 4 fixed roles).

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DASHBOARD_PATH_BY_ROLE } from '../utils/roles';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const correctPath = DASHBOARD_PATH_BY_ROLE[user.role] || '/unauthorized';
    return <Navigate to={correctPath} replace />;
  }

  return children;
}