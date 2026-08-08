import React from 'react';
import Card from './ui/Card.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function StatCard({ icon: Icon, label, value, accent }) {
  const { c } = useTheme();
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase mf-mono" style={{ color: c.textFaint }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent === 'gold' ? c.goldSoft : c.tealSoft }}>
          <Icon size={14} color={accent === 'gold' ? c.gold : c.teal} />
        </div>
      </div>
      <div className="mf-display text-2xl font-semibold mt-3">{value}</div>
    </Card>
  );
}
