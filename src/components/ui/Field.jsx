import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

export function Field({ label, mono, ...props }) {
  const { c } = useTheme();
  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };
  return (
    <label className="block">
      <span className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>{label}</span>
      <input className={`w-full rounded-lg px-3.5 py-2.5 text-sm outline-none ${mono ? 'mf-mono' : ''}`} style={inputStyle} {...props} />
    </label>
  );
}

export function SelectField({ label, options, value, onChange }) {
  const { c } = useTheme();
  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };
  return (
    <label className="block">
      <span className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>{label}</span>
      <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={inputStyle}
        value={value} onChange={(e) => onChange && onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
