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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm"
        noValidate
      >
        <h1 className="mb-4 text-xl font-semibold text-gray-900">FARAS Login</h1>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="mb-1 block text-sm text-gray-600" htmlFor="itsNumber">
          ITS Number
        </label>
        <input
          id="itsNumber"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          value={itsNumber}
          onChange={(e) => setItsNumber(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
          placeholder="8-digit ITS Number"
          disabled={submitting}
          required
        />

        <label className="mb-1 block text-sm text-gray-600" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2"
          disabled={submitting}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}