// client/src/context/AuthContext.jsx
// Mock auth context for building/testing routing before real login exists.
// `user` is null (logged out) by default. Use setUser from dev tools/console
// to simulate a logged-in role while testing route guards.

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { itsNumber, role } once real auth exists

  const login = (mockUser) => setUser(mockUser);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}