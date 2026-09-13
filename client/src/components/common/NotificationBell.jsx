// client/src/components/common/NotificationBell.jsx
// Self-contained — polls unread count, shows a dropdown list on click,
// marks read on open/click. Used in TopBar for every staff role, and in
// the student mobile header.

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../api/notifications.api';

const POLL_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  function refreshUnreadCount() {
    notificationsApi
      .getUnreadCount(token)
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open) {
      notificationsApi
        .getNotifications(token)
        .then((res) => setNotifications(res.data.notifications))
        .catch(() => {});
    }
  }

  async function handleMarkAllRead() {
    await notificationsApi.markAllAsRead(token);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function handleClickNotification(n) {
    if (!n.is_read) {
      await notificationsApi.markAsRead(token, n.id);
      setNotifications((prev) =>
        prev.map((p) => (p.id === n.id ? { ...p, is_read: true } : p))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative rounded-md border border-white/30 p-2 text-white transition hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-medium text-dark-brown">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-primary underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications === null && (
              <p className="p-3 text-sm text-text-tertiary">Loading...</p>
            )}
            {notifications && notifications.length === 0 && (
              <p className="p-3 text-sm text-text-tertiary">No notifications yet.</p>
            )}
            {notifications &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClickNotification(n)}
                  className={`block w-full border-b border-border px-3 py-2 text-left text-sm last:border-b-0 ${
                    n.is_read ? 'text-text-tertiary' : 'bg-primary-muted text-text-primary'
                  }`}
                >
                  <p>{n.message}</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}