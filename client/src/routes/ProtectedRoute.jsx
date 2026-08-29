// client/src/routes/ProtectedRoute.jsx
// Client-side route guard. This is UI-only convenience (NFR-S-02) — real
// enforcement happens server-side via requireRole() (server/middleware).
// Never treat this as the actual security boundary.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}