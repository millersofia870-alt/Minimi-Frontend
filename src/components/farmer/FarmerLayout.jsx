import React, { useEffect, useState } from 'react';
import { ClipboardList, MessageCircle, CreditCard, Wallet, User, ChevronDown, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import SidebarLayout from '../layout/SidebarLayout.jsx';
import { api } from '../../lib/api.js';

const NAV_ITEMS = [
  { to: '/farmer/request-service', label: 'Request a vet', icon: PlusCircle },
  { to: '/farmer/requests', label: 'My requests', icon: ClipboardList },
  { to: '/farmer/chats', label: 'Chat with vets', icon: MessageCircle },
  { to: '/farmer/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/farmer/payments', label: 'Payments', icon: Wallet },
  { to: '/farmer/profile', label: 'Profile', icon: User },
];

export default function FarmerLayout({ title, subtitle, children }) {
  const { c } = useTheme();
  const { logout } = useSession();

  return (
    <SidebarLayout accent={c.gold} navItems={NAV_ITEMS} title={title} subtitle={subtitle} onLogout={logout} headerActions={<WalletMenu />}>
      {children}
    </SidebarLayout>
  );
}

function WalletMenu() {
  const { c } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  useEffect(() => { api.get('/wallet?limit=1').then(({ data }) => setBalance(data.wallet?.balance ?? 0)).catch(() => setBalance(0)); }, []);
  return <div className="relative">
    <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold" style={{ border: `1px solid ${c.border}`, color: c.text }}>
      <Wallet size={15} /><span className="hidden sm:inline">Wallet</span><ChevronDown size={13} />
    </button>
    {open && <div className="absolute right-0 top-11 z-30 w-56 rounded-xl p-2 shadow-lg" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
      <div className="px-3 py-2 border-b mb-1" style={{ borderColor: c.border }}><p className="text-[10px] uppercase font-semibold" style={{ color: c.textFaint }}>Available balance</p><p className="font-semibold mf-mono">KES {Number(balance ?? 0).toLocaleString()}</p></div>
      {[['Request a vet', '/farmer/request-service'], ['View balance', '/farmer/wallet'], ['Transaction history', '/farmer/wallet?tab=history'], ['Deposit money', '/farmer/wallet?tab=deposit']].map(([label, to]) => <button key={label} onClick={() => { setOpen(false); navigate(to); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:opacity-80" style={{ color: c.textMuted }}>{label}</button>)}
    </div>}
  </div>;
}
