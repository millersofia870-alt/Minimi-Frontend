import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { api, tryApi } from '../lib/api.js';
import { farmersList as initialFarmers, formatDate } from '../data/mockData.js';

export default function AdminFarmers() {
  const { c } = useTheme();
  const [farmers, setFarmers] = useState(initialFarmers);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: initialFarmers.length, total: initialFarmers.length, totalPages: 1, hasPrev: false, hasNext: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFarmers() {
      setLoading(true);
      const data = await tryApi(
        async () => (await api.get('/admin/farmers?limit=10', { params: { page } })).data,
        { farmers: initialFarmers, pagination: { page: 1, limit: initialFarmers.length, total: initialFarmers.length, totalPages: 1, hasPrev: false, hasNext: false } },
      );

      if (!cancelled) {
        setFarmers(data.farmers ?? []);
        setPagination(data.pagination ?? { page: 1, limit: data.farmers?.length ?? 0, total: data.farmers?.length ?? 0, totalPages: 1, hasPrev: false, hasNext: false });
        setLoading(false);
      }
    }

    loadFarmers();
    return () => { cancelled = true; };
  }, [page]);

  const filtered = farmers.filter((f) =>
    f.fullName.toLowerCase().includes(query.toLowerCase()) || f.phone.includes(query)
  );

  return (
    <AdminLayout title="Farmers" subtitle={`${pagination.total} registered farmers`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or phone…"
        className="w-full max-w-sm rounded-lg px-3.5 py-2.5 text-sm outline-none"
        style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                {['Farmer', 'Phone', 'County / Sub-county', 'Joined'].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    Loading farmers…
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((f) => (
                  <tr key={f.id} className="border-t" style={{ borderColor: c.border }}>
                    <td className="px-5 py-3 font-medium">{f.fullName}</td>
                    <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{f.phone}</td>
                    <td className="px-5 py-3" style={{ color: c.textMuted }}>{f.county} · {f.subCounty}</td>
                    <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textFaint }}>{formatDate(f.createdAt ?? f.joined)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    No farmers match "{query}".
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
