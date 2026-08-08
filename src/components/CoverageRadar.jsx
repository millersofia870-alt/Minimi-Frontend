import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

// Signature hero visual: a scattered node grid representing sub-counties, with
// a couple of active nodes pulsing and an animated connector arc simulating a
// farmer <-> vet match forming in real time. Deterministic pseudo-random layout
// (seeded) so it doesn't reshuffle on every re-render.
export default function CoverageRadar() {
  const { c } = useTheme();

  const nodes = useMemo(() => {
    const pts = [];
    let seed = 7;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 26; i++) {
      pts.push({ x: 20 + rand() * 360, y: 20 + rand() * 320, active: rand() > 0.72 });
    }
    return pts;
  }, []);

  const farmer = { x: 70, y: 260 };
  const vet = { x: 300, y: 100 };

  return (
    <svg viewBox="0 0 400 360" className="w-full h-full" style={{ maxWidth: 440 }}>
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.active ? 3.2 : 2.2} fill={n.active ? c.gold : c.borderStrong} />
          {n.active && (
            <circle cx={n.x} cy={n.y} r={3} fill="none" stroke={c.gold} strokeWidth="1"
              style={{ animation: `mf-pulse ${2.4 + (i % 3) * 0.4}s ease-out ${(i % 5) * 0.3}s infinite` }} />
          )}
        </g>
      ))}
      <circle cx={farmer.x} cy={farmer.y} r={6} fill={c.teal} />
      <circle cx={farmer.x} cy={farmer.y} r={6} fill="none" stroke={c.teal} strokeWidth="1.5"
        style={{ animation: 'mf-pulse 2.2s ease-out infinite' }} />
      <circle cx={vet.x} cy={vet.y} r={6} fill={c.gold} />
      <circle cx={vet.x} cy={vet.y} r={6} fill="none" stroke={c.gold} strokeWidth="1.5"
        style={{ animation: 'mf-pulse 2.2s ease-out 0.6s infinite' }} />
      <path d={`M ${farmer.x} ${farmer.y} Q 180 320 ${vet.x} ${vet.y}`} fill="none"
        stroke={c.textFaint} strokeWidth="1.4" strokeDasharray="4 6"
        strokeDashoffset="200" style={{ animation: 'mf-dash 3s linear infinite' }} />
      <text x={farmer.x - 26} y={farmer.y + 22} className="mf-mono" fontSize="9" fill={c.textMuted}>FARMER</text>
      <text x={vet.x - 12} y={vet.y - 14} className="mf-mono" fontSize="9" fill={c.textMuted}>VET · MATCHED</text>
    </svg>
  );
}
