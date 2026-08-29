// client/src/routes/AppRoutes.jsx
// Route table. Placeholder elements here — T-11 replaces these with real
// page shells per role.

import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/roles';

function Placeholder({ label }) {
  return <div className="p-8 text-lg text-gray-700">{label}</div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Placeholder label="Login page" />} />
      <Route path="/unauthorized" element={<Placeholder label="403 — Unauthorized" />} />

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <Placeholder label="Super Admin dashboard" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DEPARTMENT]}>
            <Placeholder label="Department dashboard" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <Placeholder label="Teacher dashboard" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Placeholder label="Student portal" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Placeholder label="404 — Not Found" />} />
    </Routes>
  );
}