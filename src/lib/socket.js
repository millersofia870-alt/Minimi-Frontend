import { io } from 'socket.io-client';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

export function connectSocket(token) {
  if (!token) {
    disconnectSocket();
    return null;
  }

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  const url = SOCKET_URL || undefined;
  socket = io(url, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to backend, socketId:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err?.message || err);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

