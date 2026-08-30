// client/src/context/AuthContext.jsx
// Real auth context: calls the actual /api/auth endpoints, persists the
// JWT in localStorage so a page refresh doesn't log the user out, and
// restores the session on mount by calling /api/auth/me.

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const TOKEN_STORAGE_KEY = 'faras_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    authApi
      .getMe(storedToken)
      .then((res) => {
        setToken(storedToken);
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(itsNumber, password) {
    const res = await authApi.login(itsNumber, password);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}