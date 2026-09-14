// client/src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { ROLES, ALL_ROLES } from '../utils/roles';

import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import ClassesSubjects from '../pages/super-admin/ClassesSubjects';
import Scheduling from '../pages/super-admin/Scheduling';
import QuestionBank from '../pages/super-admin/QuestionBank';
import Users from '../pages/super-admin/Users';
import Students from '../pages/super-admin/Students';
import CycleSettings from '../pages/super-admin/CycleSettings';
import Groups from '../pages/super-admin/Groups';
import DepartmentDashboard from '../pages/department/Dashboard';
import ReportQueue from '../pages/department/ReportQueue';
import TeacherLookup from '../pages/department/TeacherLookup';
import ReviewCycles from '../pages/department/ReviewCycles';
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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowedRoles={ALL_ROLES}>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
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
        path="/super-admin/classes"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <ClassesSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/scheduling"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <Scheduling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/questions"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <QuestionBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/users"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/students"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/cycle"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <CycleSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/groups"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <Groups />
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
        path="/department/reports"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DEPARTMENT]}>
            <ReportQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/lookup"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DEPARTMENT]}>
            <TeacherLookup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/review-cycles"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DEPARTMENT]}>
            <ReviewCycles />
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