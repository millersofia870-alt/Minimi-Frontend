import React from 'react';
import { ClipboardList, MessageCircle, TrendingUp, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import SidebarLayout from '../layout/SidebarLayout.jsx';

const NAV_ITEMS = [
  { to: '/vet', label: 'Requests', icon: ClipboardList, end: true },
  { to: '/vet/chats', label: 'Messages', icon: MessageCircle },
  { to: '/vet/earnings', label: 'Payments', icon: TrendingUp },
  { to: '/vet/profile', label: 'Profile', icon: User },
];

export default function VetLayout({ title, subtitle, children }) {
  const { c } = useTheme();
  const { logout } = useSession();

  return (
    <SidebarLayout accent={c.teal} navItems={NAV_ITEMS} title={title} subtitle={subtitle} onLogout={logout}>
      {children}
    </SidebarLayout>
  );
}
