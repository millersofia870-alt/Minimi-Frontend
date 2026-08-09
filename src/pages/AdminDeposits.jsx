import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { api, tryApi } from '../lib/api.js';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

export default function AdminDeposits() {
  const { c } = useTheme();
  const [stats, setStats] = useState({
    totalDeposit: 0,
    todayDeposit: 0,
    completedDeposit: 0,
    failedDeposit: 0,
    todayCompleted: 0,
    todayFailed: 0,
  });
  const [deposits, setDeposits] = useState([]);
  const [filter, setFilter] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      const data = await tryApi(
        async () => (await api.get('/admin/deposits/stats')).data,
        stats,
      );
      if (!cancelled) setStats(data ?? stats);
    }

    async function loadDeposits() {
      setLoading(true);
      const params = { page };
      if (filter) params.status = filter;
      if (farmerId.trim()) params.farmerId = farmerId.trim();

      const data = await tryApi(
        async () => (await api.get('/admin/deposits?limit=10', { params })).data,
        { deposits: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } },
      );

      if (!cancelled) {
        setDeposits(data.deposits ?? []);
        setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 });
        setLoading(false);
      }
    }

    loadStats();
    loadDeposits();
    const interval = setInterval(() => {
      loadStats();
      loadDeposits();
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [filter, farmerId, page]);

  const handleFilterClick = (value) => {
    setFilter(value);
    setPage(1);
  };

  const handleFarmerSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <AdminLayout title="Deposits" subtitle="Wallet deposit transactions">
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Wallet} label="Total deposits" value={`KES ${Number(stats.totalDeposit ?? 0).toLocaleString()}`} accent="gold" />
        <StatCard icon={TrendingUp} label="Today" value={`KES ${Number(stats.todayDeposit ?? 0).toLocaleString()}`} accent="teal" />
        <StatCard icon={CheckCircle2} label="Completed" value={`KES ${Number(stats.completedDeposit ?? 0).toLocaleString()}`} accent="teal" />
        <StatCard icon={XCircle} label="Failed" value={`KES ${Number(stats.failedDeposit ?? 0).toLocaleString()}`} accent="gold" />
        <StatCard icon={Clock} label="Today completed" value={`KES ${Number(stats.todayCompleted ?? 0).toLocaleString()}`} accent="teal" />
        <StatCard icon={Clock} label="Today failed" value={`KES ${Number(stats.todayFailed ?? 0).toLocaleString()}`} accent="gold" />
      </div>

      {/* FILTERS */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => handleFilterClick(f.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors"
                style={filter === f.value
                  ? { background: c.goldSoft, color: c.goldText, border: `1px solid ${c.gold}` }
                  : { border: `1px solid ${c.border}`, color: c.textMuted }}>
                {f.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleFarmerSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Farmer ID..."
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              className="input text-xs"
              style={{ width: 160 }}
            />
            <Button type="submit" variant="outline" className="!px-3 !py-1.5 text-xs">Search</Button>
          </form>
        </div>
      </Card>

      {/* DEPOSITS TABLE */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                {['ID', 'Farmer', 'Amount', 'Status', 'M-Pesa Receipt', 'Date'].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    Loading deposits…
                  </td>
                </tr>
              ) : deposits.length > 0 ? (
                deposits.map((d) => (
                  <tr key={d.id} className="border-t" style={{ borderColor: c.border }}>
                    <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{d.id}</td>
                    <td className="px-5 py-3 font-medium">{d.farmerId}</td>
                    <td className="px-5 py-3 mf-mono text-xs">KES {Number(d.amount).toLocaleString()}</td>
                    <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{d.mpesaReceiptNumber ?? '—'}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: c.textMuted }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    No deposits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t" style={{ borderColor: c.border }}>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => prev + 1)}
            disabled={loading}
          />
        </div>
      </Card>
    </AdminLayout>
  );
}
