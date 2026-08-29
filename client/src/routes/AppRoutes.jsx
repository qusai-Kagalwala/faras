// client/src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/roles';

import LoginPage from '../pages/auth/LoginPage';
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';
import DepartmentDashboard from '../pages/department/DepartmentDashboard';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';

function NotFound() {
  return <div className="p-8 text-lg text-gray-700">404 — Not Found</div>;
}

function Unauthorized() {
  return <div className="p-8 text-lg text-gray-700">403 — Unauthorized</div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DEPARTMENT]}>
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}