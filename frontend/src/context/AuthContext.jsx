import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, phone, role, permissions }
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await api.get('/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('hse:unauthorized', onUnauthorized);
    return () => window.removeEventListener('hse:unauthorized', onUnauthorized);
  }, []);

  async function login(email, password) {
    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    const { data } = await api.postJson('/login', { email, password });
    setUser(data);
    return data;
  }

  async function logout() {
    try {
      await api.postJson('/logout', {});
    } finally {
      setUser(null);
    }
  }

  function hasPermission(key) {
    return Boolean(user?.permissions?.includes(key));
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, hasPermission, reload: loadMe }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}
