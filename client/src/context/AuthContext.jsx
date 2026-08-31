// client/src/context/AuthContext.jsx
// Real auth context: calls the actual /api/auth endpoints.
//
// SESSION STORAGE (not localStorage): the token is cleared automatically
// when the browser tab/window closes, but survives a page refresh within
// the same tab.
//
// MULTI-ROLE SUPPORT: tracks availableRoles alongside the active user/role.
// The 403-on-switch race is fixed in ProtectedRoute.jsx (redirect to the
// current role's correct dashboard on mismatch, not /unauthorized) —
// matches WAMAS's proven production pattern. No special "switching" state
// is needed here.

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const TOKEN_STORAGE_KEY = 'faras_token';
const ASK_EVERY_TIME_KEY = 'faras_role_ask_every_time';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [askEveryTime, setAskEveryTimeState] = useState(
    () => localStorage.getItem(ASK_EVERY_TIME_KEY) !== 'false'
  );

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    authApi
      .getMe(storedToken)
      .then((res) => {
        setToken(storedToken);
        setUser(res.data);
        setAvailableRoles(res.data.availableRoles || [res.data.role]);
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(itsNumber, password) {
    const res = await authApi.login(itsNumber, password);
    const { token: newToken, user: newUser, availableRoles: roles } = res.data;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setAvailableRoles(roles || [newUser.role]);
    return { user: newUser, availableRoles: roles || [newUser.role] };
  }

  async function switchRole(role) {
    const res = await authApi.switchRole(token, role);
    const { token: newToken, user: newUser, availableRoles: roles } = res.data;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setAvailableRoles(roles || [newUser.role]);
    return newUser;
  }

  function setAskEveryTime(value) {
    localStorage.setItem(ASK_EVERY_TIME_KEY, value ? 'true' : 'false');
    setAskEveryTimeState(value);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setAvailableRoles([]);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        availableRoles,
        askEveryTime,
        setAskEveryTime,
        login,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}