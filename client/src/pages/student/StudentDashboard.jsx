// client/src/pages/student/StudentDashboard.jsx
// Mobile-first per NFR-U-01. Never render teacher name/ITS here or in any
// child component — subject only (FR-SP-02).

import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-primary px-4 py-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold text-white">FARAS</p>
          <button onClick={logout} className="text-sm text-white/80 underline">
            Log Out
          </button>
        </div>
        <h1 className="mt-3 text-lg font-semibold text-white">This Week&apos;s Feedback</h1>
        <p className="text-sm text-white/80">Subject: Science</p>
      </header>
      <main className="p-4">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-base text-text-secondary">Survey will appear here.</p>
        </div>
      </main>
    </div>
  );
}