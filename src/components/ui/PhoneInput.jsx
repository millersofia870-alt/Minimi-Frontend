import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

export const COUNTRIES = [
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+252', name: 'Somalia', flag: '🇸🇴' },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
];

export function PhoneInput({ label, value, onChange, placeholder, mono, prefix, defaultCountry, ...props }) {
  const { c } = useTheme();
  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };
  const countryCode = prefix || defaultCountry?.code || COUNTRIES[0].code;

  return (
    <label className="block">
      {label && (
        <span className="text-xs font-semibold mb-1.5 block" style={{ color: c.textMuted }}>{label}</span>
      )}
      <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
        <span
          className="flex items-center px-3 text-sm font-medium shrink-0 mf-mono select-none"
          style={{ background: c.bgElevated, color: c.textMuted, borderRight: `1px solid ${c.border}` }}
        >
          {countryCode}
        </span>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange?.(e.target.value.replace(/\D/g, '').slice(0, 12))}
          placeholder={placeholder || '712345678'}
          className={`flex-1 rounded-none px-3 py-2.5 text-sm outline-none ${mono ? 'mf-mono' : ''}`}
          style={inputStyle}
          {...props}
        />
      </div>
    </label>
  );
}
