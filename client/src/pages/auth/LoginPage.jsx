// client/src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DASHBOARD_PATH_BY_ROLE } from '../../utils/roles';

export default function LoginPage() {
  const [itsNumber, setItsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(itsNumber.trim(), password);
      const redirectTo = location.state?.from || DASHBOARD_PATH_BY_ROLE[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-white p-8 shadow-sm"
        noValidate
      >
        <h1 className="mb-1 font-display text-2xl font-bold text-dark-brown">FARAS</h1>
        <p className="mb-6 text-sm text-text-tertiary">Sign in with your ITS Number</p>

        {error && (
          <div className="mb-4 rounded-md border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-text-secondary" htmlFor="itsNumber">
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
          placeholder="8-digit ITS Number"
          disabled={submitting}
          required
        />

        <label className="mb-1 block text-sm font-medium text-text-secondary" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-md border border-border bg-white px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
          disabled={submitting}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}