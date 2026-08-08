import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setSessionToken, setSessionUpdater } from '../lib/api.js';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket.js';
import { setSecureItem, getSecureItem, removeSecureItem } from '../lib/storage.js';

const SessionContext = createContext(null);
const STORAGE_KEY = 'session';

function loadStored() {
  try {
    const encrypted = getSecureItem(STORAGE_KEY);
    if (encrypted) return encrypted;
    const raw = localStorage.getItem('minimi-agri-session');
    if (raw) {
      const parsed = JSON.parse(raw);
      localStorage.removeItem('minimi-agri-session');
      setSecureItem(STORAGE_KEY, parsed);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(loadStored); // { role, user, accessToken, refreshToken } | null

  useEffect(() => {
    if (session) {
      setSecureItem(STORAGE_KEY, session);
      setSessionToken(session.accessToken, session.refreshToken);
      connectSocket(session.accessToken);
    } else {
      removeSecureItem(STORAGE_KEY);
      localStorage.removeItem('minimi-agri-session');
      setSessionToken(null, null);
      disconnectSocket();
    }
  }, [session]);

  useEffect(() => {
    setSessionUpdater((tokens) => {
      if (!tokens) {
        setSession(null);
        return;
      }

      setSession((prev) => {
        if (!prev) return prev;
        return { ...prev, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      });
    });
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (payload) => {
      setSession((prev) => {
        if (!prev || prev.role !== 'vet') return prev;
        if (prev.user?.id !== payload.vetId) return prev;
        return { ...prev, user: { ...prev.user, status: payload.status } };
      });
    };

    socket.on('vet_status_updated', handler);
    return () => socket.off('vet_status_updated', handler);
  }, []);

  // --- Farmer / Vet: request OTP ---
  const requestOtp = useCallback(async (role, phone, idNumber) => {
    const { data } = await api.post(`/auth/${role}/login`, { phone, idNumber });
    return data; // { message, devCode? } — devCode only present outside production
  }, []);

  // --- Farmer / Vet: register ---
  const register = useCallback(async (role, payload) => {
    let finalPayload = { ...payload };
    const file = Object.values(payload).find((v) => v instanceof File);
    if (file) {
      const base64 = await fileToBase64(file);
      finalPayload = { ...payload };
      delete finalPayload.passportImage;
      finalPayload.passportImage = base64;
    }
    const { data } = await api.post(`/auth/${role}/register`, finalPayload);
    return data;
  }, []);

  // --- Farmer / Vet: verify OTP -> establishes session ---
  const verifyOtp = useCallback(async (role, phone, idNumber, code) => {
    const { data } = await api.post(`/auth/${role}/verify-otp`, { phone, idNumber, code });
    setSession({ role, user: data[role], accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  }, []);

  // --- Admin: username/password login -> establishes session ---
  const adminLogin = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/admin/login', { username, password });
    setSession({ role: 'admin', user: data.admin, accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (session?.refreshToken) {
        await api.post('/auth/logout', { refreshToken: session.refreshToken });
      }
    } catch {
      // best-effort — clear local session regardless
    }
    setSession(null);
  }, [session]);

  const value = {
    session,
    isAuthenticated: !!session,
    role: session?.role ?? null,
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    requestOtp,
    register,
    verifyOtp,
    adminLogin,
    logout,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
