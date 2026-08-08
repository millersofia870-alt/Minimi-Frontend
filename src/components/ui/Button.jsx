import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const { c } = useTheme();
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors mf-body';
  const styles = {
    primary: { background: c.gold, color: '#191305' },
    outline: { background: 'transparent', color: c.text, border: `1px solid ${c.borderStrong}` },
    teal: { background: c.teal, color: '#08211D' },
    ghost: { background: 'transparent', color: c.textMuted },
  };
  return (
    <button className={`${base} ${className}`} style={styles[variant]} {...props}>
      {children}
    </button>
  );
}
