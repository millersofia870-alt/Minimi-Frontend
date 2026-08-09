import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, Stethoscope, MessageCircle, Camera, Wallet, MapPin,
  ArrowRight, Users, TrendingUp, ClipboardList, CheckCircle2, ShieldCheck, Menu, X, Mail,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import CoverageRadar from '../components/CoverageRadar.jsx';
import { api, tryApi } from '../lib/api.js';
import { formatKes } from '../data/mockData.js';
import heroBackground from '../assets/minimi-hero.jpg';

const DEFAULT_PACKAGES = [
  { id: '1', name: 'Basic Farmer', price: 0, durationDays: 30, description: 'Standard vet request access with pay-per-visit M-Pesa billing.' },
  { id: '2', name: 'Pro Farmer', price: 500, durationDays: 30, description: 'Priority vet matching, emergency response support, and discounted service fees.' },
  { id: '3', name: 'Commercial Shamba', price: 1500, durationDays: 90, description: 'Dedicated vet team, scheduled farm visits, and quarterly health reports.' },
];

export default function Landing() {
  const { c } = useTheme();
  const navigate = useNavigate();
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadPackages() {
      const data = await tryApi(
        async () => (await api.get('/subscriptions/packages')).data.packages,
        null
      );
      if (!cancelled && data && data.length > 0) {
        setPackages(data);
      }
      if (!cancelled) setLoadingPackages(false);
    }
    loadPackages();
    return () => { cancelled = true; };
  }, []);

  const stages = [
    { label: 'Request', desc: 'Describe the issue and tap request — matched to a vet in your sub-county.', icon: ClipboardList },
    { label: 'Match', desc: 'A verified nearby vet accepts and opens a chat with you.', icon: Users },
    { label: 'Treat', desc: 'Chat and get livestock or crop photos logged on the spot.', icon: Camera },
    { label: 'Pay', desc: 'Confirm the service and pay instantly by M-Pesa — no cash needed.', icon: Wallet },
  ];

  return (
    <div className="mf-body" style={{ background: c.bg, color: c.text, minHeight: '100vh' }}>
      {/* NAV */}
      <nav className="relative flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.goldSoft }}>
            <Leaf size={16} color={c.gold} />
          </div>
          <span className="mf-display text-lg font-semibold">Minimi<span style={{ color: c.gold }}>Agri</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: c.textMuted }}>
          <a href="#how" className="hover:opacity-80">How it works</a>
          <a href="#roles" className="hover:opacity-80">For farmers &amp; vets</a>
          <a href="#packages" className="hover:opacity-80">Subscriptions</a>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => navigate('/login')}>Log in</Button>
          <Button variant="primary" onClick={() => navigate('/register')}>Get started</Button>
        </div>
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button type="button" aria-label="Toggle navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)} className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${c.border}`, color: c.text }}>
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="absolute z-40 top-full left-4 right-4 sm:hidden rounded-xl p-3 shadow-xl" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
            <div className="flex flex-col gap-1 text-sm" style={{ color: c.textMuted }}>
              <a href="#how" onClick={() => setMobileNavOpen(false)} className="px-3 py-2.5 rounded-lg">How it works</a>
              <a href="#roles" onClick={() => setMobileNavOpen(false)} className="px-3 py-2.5 rounded-lg">For farmers &amp; vets</a>
              <a href="#packages" onClick={() => setMobileNavOpen(false)} className="px-3 py-2.5 rounded-lg">Subscriptions</a>
              <div className="grid grid-cols-2 gap-2 pt-2 mt-1 border-t" style={{ borderColor: c.border }}>
                <Button variant="ghost" className="justify-center" onClick={() => navigate('/login')}>Log in</Button>
                <Button variant="primary" className="justify-center" onClick={() => navigate('/register')}>Get started</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <header className="w-full bg-cover bg-center" style={{ backgroundImage: `linear-gradient(135deg, rgba(126, 76, 25, 0.90), rgba(189, 125, 40, 0.55)), url(${heroBackground})` }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="mf-fadeup">
          <Badge bg={c.tealSoft} text={c.tealText}>Now live · 47 counties</Badge>
          <h1 className="mf-display mt-5 text-4xl md:text-[3.1rem] leading-[1.08] font-semibold" style={{ color: '#FFFFFF' }}>
            Get a vet to your <span style={{ color: c.gold }}>shamba</span>,<br />not just an appointment.
          </h1>
          <p className="mt-5 text-base md:text-lg max-w-md" style={{ color: 'rgba(255,255,255,0.92)' }}>
            Minimi Agri matches farmers with verified vets by county — chat
            and pay by M-Pesa, all from one line.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => navigate('/register?role=farmer')}>
              Register as a farmer <ArrowRight size={15} />
            </Button>
            <Button variant="teal" onClick={() => navigate('/register?role=vet')}>
              <Stethoscope size={15} /> I'm a vet
            </Button>
          </div>
          <div className="mf-mono mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[11px] uppercase" style={{ color: 'rgba(255,255,255,0.78)' }}>
            <span>Coverage · All 47 counties</span>
            <span>Payments · M-Pesa STK push</span>
            <span>Response · Live chat with your vet</span>
          </div>
        </div>
        <div className="flex justify-center items-center rounded-2xl p-4" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
          <CoverageRadar />
        </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-7xl mx-auto px-6 md:px-10 py-16 border-t" style={{ borderColor: c.border }}>
        <h2 className="mf-display text-2xl font-semibold mb-2">From request to payment, one thread</h2>
        <p className="mb-10" style={{ color: c.textMuted }}>Every request follows the same four stages — visible to the farmer and vet in real time.</p>
        <div className="grid md:grid-cols-4 gap-4">
          {stages.map((s, i) => (
            <Card key={s.label} className="p-5 relative">
              <div className="mf-mono text-[11px]" style={{ color: c.textFaint }}>STAGE {i + 1}</div>
              <div className="mt-3 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: i % 2 ? c.tealSoft : c.goldSoft }}>
                <s.icon size={16} color={i % 2 ? c.teal : c.gold} />
              </div>
              <div className="mf-display font-semibold mt-3">{s.label}</div>
              <div className="text-sm mt-1.5" style={{ color: c.textMuted }}>{s.desc}</div>
              {i < stages.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-px" style={{ background: c.borderStrong }} />
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* SUBSCRIPTION PACKAGES */}
      <section id="packages" className="max-w-7xl mx-auto px-6 md:px-10 py-16 border-t" style={{ borderColor: c.border }}>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge bg={c.goldSoft} text={c.goldText}>Subscription Plans</Badge>
          <h2 className="mf-display text-3xl font-semibold mt-3">Flexible Plans for Every Farmer</h2>
          <p className="mt-2 text-base" style={{ color: c.textMuted }}>
            Choose a plan that fits your farm's needs. Enjoy priority vet dispatch, discounted service fees, and complete farm health support.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="p-6 flex flex-col justify-between hover:border-gold transition-all relative">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="mf-display font-semibold text-xl">{pkg.name}</h3>
                  {pkg.price > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.tealSoft, color: c.tealText }}>
                      Popular
                    </span>
                  )}
                </div>
                <div className="mf-display text-3xl font-bold mt-3">
                  {pkg.price === 0 ? 'Free' : formatKes(pkg.price)}
                  <span className="text-xs font-normal" style={{ color: c.textFaint }}> / {pkg.durationDays} days</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm" style={{ color: c.textMuted }}>
                  {pkg.description.split(',').map((point, i, arr) => {
                    const clean = point.trim();
                    if (!clean) return null;
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={15} className="shrink-0 mt-0.5" color={c.teal} />
                        <span>{clean}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t" style={{ borderColor: c.border }}>
                <Button
                  variant={pkg.price > 0 ? 'primary' : 'teal'}
                  className="w-full"
                  onClick={() => navigate(`/login?role=farmer&redirect=/farmer/subscriptions&packageId=${pkg.id}`)}
                >
                  {pkg.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="max-w-7xl mx-auto px-6 md:px-10 py-16 border-t" style={{ borderColor: c.border }}>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-7">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.tealSoft }}>
              <Leaf size={18} color={c.teal} />
            </div>
            <h3 className="mf-display text-xl font-semibold mt-4">For farmers</h3>
            <p className="text-sm mt-1.5" style={{ color: c.textMuted }}>Register once with your ID and phone — request help whenever you need it.</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['Request a vet by county & sub-county', MapPin],
                ['Chat in real time with your vet', MessageCircle],
                ['Pay securely with M-Pesa', Wallet],
                ['Track every past request', ClipboardList],
              ].map(([t, Icon]) => (
                <li key={t} className="flex items-center gap-2.5" style={{ color: c.text }}>
                  <Icon size={15} color={c.teal} /> {t}
                </li>
              ))}
            </ul>
            <Button variant="teal" className="mt-6 w-full" onClick={() => navigate('/register?role=farmer')}>
              Register as a farmer
            </Button>
          </Card>
          <Card className="p-7">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.goldSoft }}>
              <Stethoscope size={18} color={c.gold} />
            </div>
            <h3 className="mf-display text-xl font-semibold mt-4">For vets</h3>
            <p className="text-sm mt-1.5" style={{ color: c.textMuted }}>Get matched to requests in your own area — no cold calling.</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['See requests in your area', ClipboardList],
                ['Accept and chat with farmers', MessageCircle],
                ['Log livestock & crop photos', Camera],
                ['Track your earnings', TrendingUp],
              ].map(([t, Icon]) => (
                <li key={t} className="flex items-center gap-2.5" style={{ color: c.text }}>
                  <Icon size={15} color={c.gold} /> {t}
                </li>
              ))}
            </ul>
            <Button variant="primary" className="mt-6 w-full" onClick={() => navigate('/register?role=vet')}>
              Join as a vet
            </Button>
          </Card>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 md:px-10 py-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
        style={{ borderColor: c.border, color: c.textFaint }}>
        <span className="mf-display" style={{ color: c.text }}>Minimi Agri</span>
        <div className="flex items-center gap-2">
          <Mail size={14} />
          <a href="mailto:Minimiagri@outlook.com" className="hover:opacity-80 underline" style={{ color: c.textMuted }}>
            Minimiagri@outlook.com
          </a>
        </div>
        {/* <button onClick={() => navigate('/admin')} className="mf-mono text-xs uppercase hover:opacity-80">Admin login →</button> */}
      </footer>
    </div>
  );
}
