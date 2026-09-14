// client/src/pages/auth/LoginPage.jsx
// Redesigned to match WAMAS's real production login page (verified
// against a live screenshot): dark gradient backdrop, institutional name
// in small gold caps, decorative divider, uppercase field labels, a
// password visibility toggle, a real "Forgot password?" link (previously
// had nowhere to go — see ForgotPasswordPage.jsx), and a footer.

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DASHBOARD_PATH_BY_ROLE } from '../../utils/roles';
import RolePickerModal from '../../components/common/RolePickerModal';

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

export default function LoginPage() {
  const [itsNumber, setItsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingPicker, setPendingPicker] = useState(null);
  const [pickerError, setPickerError] = useState(null);

  const { login, switchRole, askEveryTime, setAskEveryTime } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function goToDashboard(role) {
    const redirectTo = location.state?.from || DASHBOARD_PATH_BY_ROLE[role] || '/';
    navigate(redirectTo, { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { user, availableRoles } = await login(itsNumber.trim(), password);

      if (availableRoles.length > 1 && askEveryTime) {
        setPendingPicker({ activeRole: user.role, availableRoles });
      } else {
        goToDashboard(user.role);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePickRole(role) {
    setPickerError(null);

    if (role === pendingPicker.activeRole) {
      goToDashboard(role);
      return;
    }

    try {
      const newUser = await switchRole(role);
      goToDashboard(newUser.role);
    } catch (err) {
      setPickerError(err.message || 'Could not switch roles. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-dark-brown px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl"
        noValidate
      >
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-gold">
          Aljamea-tus-Saifiyah
        </p>
        <h1 className="mb-1 text-center font-display text-4xl font-bold text-dark-brown">FARAS</h1>
        <p className="mb-4 text-center text-sm text-text-tertiary">
          Feedback Analysis, Reporting &amp; Analytics System
        </p>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-5 text-center text-sm text-text-secondary">
          Sign in with your institutional ITS number.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <label
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary"
          htmlFor="itsNumber"
        >
          ITS Number
        </label>
        <input
          id="itsNumber"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          value={itsNumber}
          onChange={(e) => setItsNumber(e.target.value)}
          className="mb-4 w-full rounded-md border border-border bg-white px-3 py-2.5 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
          placeholder="Enter your ITS number"
          disabled={submitting}
          required
        />

        <label
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative mb-2">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-md border border-border bg-white px-3 py-2.5 pr-10 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
            disabled={submitting}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <p className="mb-5 text-right text-sm">
          <Link to="/forgot-password" className="text-primary underline">
            Forgot password?
          </Link>
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="mt-4 text-center text-xs text-text-tertiary">
          Access is restricted to authorised Aljamea staff and students only.
        </p>
      </form>

      <p className="mt-6 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} Aljamea-tus-Saifiyah &middot; FARAS
      </p>

      {pendingPicker && (
        <RolePickerModal
          availableRoles={pendingPicker.availableRoles}
          currentRole={pendingPicker.activeRole}
          askEveryTime={askEveryTime}
          onToggleAskEveryTime={setAskEveryTime}
          onSelect={handlePickRole}
          error={pickerError}
          onClose={() => {
            goToDashboard(pendingPicker.activeRole);
            setPendingPicker(null);
            setPickerError(null);
          }}
        />
      )}
    </div>
  );
}