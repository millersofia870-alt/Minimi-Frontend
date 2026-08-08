import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket } from '../lib/socket.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const events = [
      'wallet_payment_requested',
      'wallet_payment_completed',
      'request_status_update',
      'vet_status_updated',
      'new_service_request',
    ];

    const handlers = {};
    events.forEach((event) => {
      handlers[event] = (payload) => {
        const notification = {
          id: `${event}-${Date.now()}-${Math.random()}`,
          event,
          payload,
          timestamp: new Date().toISOString(),
          read: false,
        };
        setNotifications((prev) => [notification, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + 1);
      };
      socket.on(event, handlers[event]);
    });

    return () => {
      events.forEach((event) => {
        socket.off(event, handlers[event]);
      });
    };
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
