import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, Info, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

const ICONS = {
  wallet_payment_requested: Bell,
  wallet_payment_completed: CheckCircle2,
  request_status_update: Info,
  vet_status_updated: Info,
  new_service_request: Bell,
};

export default function ToastContainer() {
  const { c } = useTheme();
  const { notifications, markAllRead, clearAll } = useNotifications();
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    const newItems = notifications.filter((n) => !visible.find((v) => v.id === n.id));
    if (newItems.length > 0) {
      setVisible((prev) => [...newItems, ...prev].slice(0, 5));
    }
  }, [notifications]);

  useEffect(() => {
    if (visible.length === 0) return;
    const timer = setTimeout(() => {
      setVisible((prev) => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2" style={{ maxWidth: 360 }}>
      {visible.map((n) => {
        const Icon = ICONS[n.event] || Info;
        const title = {
          wallet_payment_requested: 'Payment request',
          wallet_payment_completed: 'Wallet payment',
          request_status_update: 'Request update',
          vet_status_updated: 'Account update',
          new_service_request: 'New request',
        }[n.event] || 'Notification';

        return (
          <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg shadow-lg" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="shrink-0 mt-0.5">
              <Icon size={16} color={c.teal} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: c.textMuted }}>
                {n.event === 'wallet_payment_requested' && 'A vet requested payment for your service request'}
                {n.event === 'wallet_payment_completed' && 'Your wallet payment was processed'}
                {n.event === 'request_status_update' && 'Your service request status changed'}
                {n.event === 'vet_status_updated' && `Your account status is now: ${n.payload.status}`}
                {n.event === 'new_service_request' && 'A new service request was posted in your area'}
              </p>
            </div>
            <button onClick={() => setVisible((prev) => prev.filter((v) => v.id !== n.id))} style={{ color: c.textFaint }}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
