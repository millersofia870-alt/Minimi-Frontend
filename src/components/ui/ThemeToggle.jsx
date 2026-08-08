import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { isDark, setIsDark, c } = useTheme();
  return (
    <button onClick={() => setIsDark(!isDark)}
      aria-label="Toggle dark mode"
      className="flex items-center justify-center rounded-lg w-9 h-9 transition-colors"
      style={{ border: `1px solid ${c.border}`, color: c.textMuted }}>
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
