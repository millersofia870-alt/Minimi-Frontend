import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Menu, X, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';

/**
 * Responsive sidebar shell.
 * - Desktop (md+): fixed left sidebar, always visible.
 * - Mobile: sidebar becomes a slide-in drawer triggered by a hamburger
 *   button in the top bar, with a dimmed backdrop to close it.
 */
export default function SidebarLayout({ brand = 'Minimi Agri', accent, navItems, title, subtitle, onLogout, headerActions, children }) {
  const { c } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const accentColor = accent ?? c.gold;
  const accentSoftColor = accent === c.teal ? c.tealSoft : c.goldSoft;

  const handleLogout = () => {
    setDrawerOpen(false);
    onLogout ? onLogout() : navigate('/');
  };

  const NavList = ({ onNavigate }) => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={({ isActive }) => isActive
            ? { background: accentSoftColor, color: accent === c.teal ? c.tealText : c.goldText }
            : { color: c.textMuted }}
        >
          <item.icon size={16} /> {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="mf-body flex" style={{ background: c.bg, color: c.text, minHeight: '100vh' }}>
      {/* DESKTOP SIDEBAR */}
      <aside className="w-60 shrink-0 border-r hidden md:flex flex-col" style={{ borderColor: c.border }}>
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accentSoftColor }}>
            <Leaf size={14} color={accentColor} />
          </div>
          <span className="mf-display font-semibold">{brand}</span>
        </div>
        <NavList />
        <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-5 text-sm border-t" style={{ borderColor: c.border, color: c.textFaint }}>
          <LogOut size={15} /> Sign out
        </button>
      </aside>

      {/* MOBILE DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col mf-fadeup" style={{ background: c.bg, borderRight: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accentSoftColor }}>
                  <Leaf size={14} color={accentColor} />
                </div>
                <span className="mf-display font-semibold">{brand}</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ color: c.textMuted }}><X size={20} /></button>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
            <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-5 text-sm border-t" style={{ borderColor: c.border, color: c.textFaint }}>
              <LogOut size={15} /> Sign out
            </button>
          </aside>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 md:py-5 border-b gap-3" style={{ borderColor: c.border }}>
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden shrink-0" onClick={() => setDrawerOpen(true)} style={{ color: c.textMuted }}>
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <h1 className="mf-display text-lg md:text-xl font-semibold truncate">{title}</h1>
              {subtitle && <p className="text-xs mt-0.5 truncate hidden sm:block" style={{ color: c.textFaint }}>{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {headerActions}
            <button className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center" style={{ border: `1px solid ${c.border}`, color: c.textMuted }}>
              <Bell size={15} />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
