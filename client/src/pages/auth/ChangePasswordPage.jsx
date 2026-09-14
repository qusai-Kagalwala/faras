// client/src/pages/auth/ChangePasswordPage.jsx
// New — serves two purposes with the same form: (1) the FORCED flow when
// user.mustChangePassword is true (redirected here by ProtectedRoute,
// can't navigate away until changed), and (2) voluntary access from the
// account menu at any time. The backend (authApi.changePassword) already
// existed; nothing in the UI ever called it before this.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { DASHBOARD_PATH_BY_ROLE } from '../../utils/roles';

export default function ChangePasswordPage() {
  const { user, token, clearMustChangePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const forced = user?.mustChangePassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(token, currentPassword, newPassword);
      clearMustChangePassword();
      navigate(DASHBOARD_PATH_BY_ROLE[user.role] || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not change your password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-dark-brown px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl"
        noValidate
      >
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-gold">
          Aljamea-tus-Saifiyah
        </p>
        <h1 className="mb-1 text-center font-display text-2xl font-bold text-dark-brown">
          Change Password
        </h1>
        <p className="mb-6 text-center text-sm text-text-tertiary">
          {forced
            ? "You're using your starter password (your ITS Number). Set a new password to continue."
            : 'Enter your current password and choose a new one.'}
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary" htmlFor="currentPassword">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-border bg-white px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
          disabled={submitting}
          required
        />

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary" htmlFor="newPassword">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-border bg-white px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
          disabled={submitting}
          required
        />

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary" htmlFor="confirmPassword">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-6 w-full rounded-md border border-border bg-white px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
          disabled={submitting}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}