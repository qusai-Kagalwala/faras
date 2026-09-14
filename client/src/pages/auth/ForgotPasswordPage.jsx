// client/src/pages/auth/ForgotPasswordPage.jsx
// New — the login page always had a dead-end "Forgot password?" concept
// with nowhere to send it; the backend (FR-AUTH-04, emails the CURRENT
// password, not a reset link) and authApi.forgotPassword already existed,
// just no page. Deliberately shows the same generic message regardless of
// whether the account exists, matching the backend's own anti-enumeration
// design — never reveal which.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export default function ForgotPasswordPage() {
  const [itsNumber, setItsNumber] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(itsNumber.trim());
      setMessage(res.data.message);
    } catch {
      setMessage('If an account with that ITS Number exists, a password email has been sent.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-dark-brown px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-gold">
          Aljamea-tus-Saifiyah
        </p>
        <h1 className="mb-1 text-center font-display text-3xl font-bold text-dark-brown">FARAS</h1>
        <p className="mb-6 text-center text-sm text-text-tertiary">
          Enter your ITS Number and we&apos;ll email your current password.
        </p>

        {message ? (
          <div className="rounded-md border border-success/20 bg-success-bg px-3 py-3 text-center text-sm text-success">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
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
              placeholder="Enter your ITS number"
              className="mb-4 w-full rounded-md border border-border bg-white px-3 py-2.5 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
              disabled={submitting}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-white shadow-primary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send Password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-primary underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}