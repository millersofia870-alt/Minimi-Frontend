import React, { useEffect, useState } from 'react';
import { Users, Stethoscope, Banknote, TrendingUp, Wallet, CheckCircle2, XCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { vetPerformance as initialTopVets, countyRequests as initialCountyRequests, recentRequests as initialRequests, formatKes } from '../data/mockData.js';
import { api, tryApi } from '../lib/api.js';

export default function AdminDashboard() {
  const { c } = useTheme();
  const [recentRequests, setRecentRequests] = useState(initialRequests);
  const [topVets, setTopVets] = useState(initialTopVets);
  const [countyRequests, setCountyRequests] = useState(initialCountyRequests);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalFarmers: 0,
    totalVets: 0,
    totalAmountToday: 0,
    totalEarnings: 0,
    depositStats: {
      totalDeposit: 0,
      todayDeposit: 0,
      completedDeposit: 0,
      failedDeposit: 0,
      todayCompleted: 0,
      todayFailed: 0,
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      const data = await tryApi(
        async () => (await api.get('/admin/dashboard/summary')).data,
        summary,
      );
      if (!cancelled) {
        setSummary((prev) => ({ ...prev, ...data, depositStats: { ...prev.depositStats, ...(data?.depositStats ?? {}) } }));
      }
    }

    async function loadRecentRequests() {
      setLoading(true);
      const data = await tryApi(
        async () => (await api.get('/admin/service-requests', { params: { page: 1 , limit: 5} })).data,
        { requests: initialRequests },
      );

      if (!cancelled) {
        setRecentRequests(data.requests ?? initialRequests);
        setLoading(false);
      }
    }

    async function loadTopVets() {
      const data = await tryApi(
        async () => (await api.get('/admin/dashboard/top-vets?limit=5')).data,
        { vets: initialTopVets },
      );

      if (!cancelled) {
        setTopVets(data.vets ?? initialTopVets);
      }
    }

    async function loadCountyRequests() {
      const data = await tryApi(
        async () => (await api.get('/admin/dashboard/requests-by-county')).data,
        { counties: initialCountyRequests },
      );

      if (!cancelled) {
        setCountyRequests(data.counties ?? initialCountyRequests);
      }
    }

    loadSummary();
    loadRecentRequests();
    loadTopVets();
    loadCountyRequests();
    const interval = setInterval(() => {
      loadSummary();
      loadRecentRequests();
      loadTopVets();
      loadCountyRequests();
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle={new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    >
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total farmers" value={`${summary.totalFarmers}`} accent="teal" />
        <StatCard icon={Stethoscope} label="Total vets" value={`${summary.totalVets}`} accent="gold" />
        <StatCard icon={Banknote} label="Amount today" value={formatKes(summary.totalAmountToday)} accent="teal" />
        <StatCard icon={TrendingUp} label="Total earnings" value={formatKes(summary.totalEarnings)} accent="gold" />
        <StatCard icon={Wallet} label="Total deposits" value={formatKes(summary.depositStats?.totalDeposit ?? 0)} accent="gold" />
        <StatCard icon={Wallet} label="Deposits today" value={formatKes(summary.depositStats?.todayDeposit ?? 0)} accent="teal" />
        <StatCard icon={CheckCircle2} label="Deposits completed" value={formatKes(summary.depositStats?.completedDeposit ?? 0)} accent="teal" />
        <StatCard icon={XCircle} label="Deposits failed" value={formatKes(summary.depositStats?.failedDeposit ?? 0)} accent="gold" />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">Most performing vets</h3>
            <span className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>Completed requests</span>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVets} layout="vertical" margin={{ left: 10, right: 16, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: c.textFaint }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="fullName" width={120} tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: c.surfaceHover }} />
                <Bar dataKey="completedRequests" radius={[0, 6, 6, 0]} fill={c.gold} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">Requested services by county</h3>
            <span className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>This month</span>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countyRequests} margin={{ left: -16, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                <XAxis dataKey="county" tick={{ fontSize: 10, fill: c.textFaint }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: c.textFaint }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: c.bgElevated, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12 }} cursor={{ fill: c.surfaceHover }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
                  {countyRequests.map((_, i) => <Cell key={i} fill={i === 0 ? c.teal : c.tealSoft} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* RECENT REQUESTS TABLE */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: c.border }}>
          <h3 className="font-semibold text-sm">Recent requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                {['Request', 'Farmer', 'Vet', 'County', 'Status', 'Amount'].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    Loading recent requests…
                  </td>
                </tr>
              ) : recentRequests.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: c.border }}>
                  <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{r.id}</td>
                  <td className="px-5 py-3">{r.farmerName ?? r.farmer}</td>
                  <td className="px-5 py-3" style={{ color: c.textMuted }}>{r.vetName ?? r.vet ?? '—'}</td>
                  <td className="px-5 py-3" style={{ color: c.textMuted }}>{r.county}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3 mf-mono text-xs">{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
