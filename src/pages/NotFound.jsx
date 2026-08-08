import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sprout, ArrowLeft, Compass, Mountain } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function NotFound() {
  const { c } = useTheme();
  return (
    <main className="mf-body min-h-screen flex items-center justify-center px-6 relative overflow-hidden" style={{ background: c.bg, color: c.text }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-5" style={{ background: c.gold }} />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full opacity-5" style={{ background: c.teal }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-[0.03]" style={{ background: c.gold }} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(${c.border} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <section className="w-full max-w-2xl text-center relative z-10">
        <div className="mx-auto mb-8 w-24 h-24 rounded-3xl flex items-center justify-center relative" style={{ background: c.goldSoft, border: `1px solid ${c.gold}30` }}>
          <div className="absolute inset-0 rounded-3xl animate-pulse opacity-20" style={{ background: c.gold }} />
          <Sprout size={44} color={c.gold} />
        </div>

        <p className="mf-mono text-sm font-semibold tracking-[0.2em] mb-4" style={{ color: c.teal }}>
          404 — PAGE NOT FOUND
        </p>

        <h1 className="mf-display text-5xl sm:text-6xl md:text-7xl font-semibold leading-tight mb-6">
          This field is <br />
          <span style={{ color: c.gold }}>not planted</span> yet.
        </h1>

        <p className="text-lg sm:text-xl max-w-md mx-auto mb-10 leading-relaxed" style={{ color: c.textMuted }}>
          The page you are looking for has either been harvested, moved, or never seeded in the first place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: c.gold, color: '#191305' }}
          >
            <ArrowLeft size={16} />
            Back to Minimi Agri
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
          >
            <Compass size={16} />
            Go back
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: c.textFaint }}>
          <Leaf size={15} color={c.teal} />
          <span className="font-medium">Minimi Agri</span>
          <span>·</span>
          <span>Cultivating smarter farming</span>
        </div>
      </section>
    </main>
  );
}
