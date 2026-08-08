import React from 'react';

export default function Badge({ bg, text, children }) {
  return (
    <span className="mf-mono inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase"
      style={{ background: bg, color: text }}>
      {children}
    </span>
  );
}
