import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Card({ className = '', style = {}, children }) {
  const { c } = useTheme();
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: c.surface, border: `1px solid ${c.border}`, ...style }}>
      {children}
    </div>
  );
}
