import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import StatusBadge from './ui/StatusBadge.jsx';
import { formatDateTime } from '../data/mockData.js';

export default function ChatThreadListItem({ avatarIcon: Icon, accentColor, accentSoft, name, status, lastMessage, lastActivity, active, onClick }) {
  const { c } = useTheme();

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-colors"
      style={active ? { background: accentSoft } : { background: 'transparent' }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: accentSoft }}>
        <Icon size={16} color={accentColor} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{name}</span>
          {status && <span className="shrink-0"><StatusBadge status={status} /></span>}
        </div>
        <p className="text-xs truncate mt-0.5" style={{ color: c.textMuted }}>
          {lastMessage || 'No messages yet — say hello.'}
        </p>
      </div>
      {lastActivity && (
        <span className="mf-mono text-[10px] shrink-0" style={{ color: c.textFaint }}>
          {formatDateTime(lastActivity).split(',')[0]}
        </span>
      )}
    </button>
  );
}
