import React from 'react';
import {
  LayoutDashboard, UserCog, Users, ClipboardList, FileBarChart, CreditCard, Wallet,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import SidebarLayout from '../layout/SidebarLayout.jsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/vets', label: 'Vets', icon: UserCog },
  { to: '/admin/farmers', label: 'Farmers', icon: Users },
  { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/admin/deposits', label: 'Deposits', icon: Wallet },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
];

export default function AdminLayout({ title, subtitle, children }) {
  const { c } = useTheme();
  const { logout } = useSession();

  return (
    <SidebarLayout accent={c.gold} navItems={NAV_ITEMS} title={title} subtitle={subtitle} onLogout={logout}>
      {children}
    </SidebarLayout>
  );
}
