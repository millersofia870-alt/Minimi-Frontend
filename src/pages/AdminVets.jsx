import React, { useEffect, useState } from 'react';
import { Check, Ban, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { api, tryApi } from '../lib/api.js';
import Pagination from '../components/ui/Pagination.jsx';
import { vetsList as initialVets } from '../data/mockData.js';

const FILTERS = ['all', 'approved', 'pending_verification', 'suspended'];

export default function AdminVets() {
  const { c } = useTheme();
  const [vets, setVets] = useState(initialVets);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: initialVets.length, total: initialVets.length, totalPages: 1, hasPrev: false, hasNext: false });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = { page };

    if (filter !== 'all') {
      params.status = filter;
      
    }

    async function loadVets() {
      setLoading(true);
      const data = await tryApi(
        async () => (await api.get('/admin/vets?limit=10', { params })).data,
        { vets: initialVets, pagination: { page: 1, limit: initialVets.length, total: initialVets.length, totalPages: 1, hasPrev: false, hasNext: false } },
      );

      if (!cancelled) {
        setVets(data.vets ?? []);
        setPagination(data.pagination ?? { page: 1, limit: data.vets?.length ?? 0, total: data.vets?.length ?? 0, totalPages: 1, hasPrev: false, hasNext: false });
        setLoading(false);
      }
    }

    loadVets();
    const interval = setInterval(loadVets, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [filter, page]);

  const setStatus = async (id, status) => {
    setUpdatingId(id);
    const data = await tryApi(
      async () => (await api.patch(`/admin/vets/${id}/status`, { status })).data,
      null,
    );
    setUpdatingId(null);

    const updatedVet = data?.vet ?? null;
    const updatedStatus = updatedVet?.status ?? data?.status ?? status;

    setVets((prev) => prev.map((v) => (v.id === id ? { ...v, status: updatedStatus, ...updatedVet } : v)));
  };

  const handleFilterClick = (value) => {
    setFilter(value);
    setPage(1);
  };

  const displayedVets = filter === 'all' ? vets : vets.filter((v) => v.status === filter);
  const totalVets = pagination?.total ?? displayedVets.length;

  return (
    <AdminLayout title="Vets" subtitle={`${totalVets} registered vets`}>
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => handleFilterClick(f)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors"
            style={filter === f
              ? { background: c.goldSoft, color: c.goldText, border: `1px solid ${c.gold}` }
              : { border: `1px solid ${c.border}`, color: c.textMuted }}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                {['Vet', 'Phone', 'County / Sub-county', 'Completed', 'Status', ''].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    Loading vets…
                  </td>
                </tr>
              ) : displayedVets.length > 0 ? (
                displayedVets.map((v) => (
                  <tr key={v.id} className="border-t" style={{ borderColor: c.border }}>
                    <td className="px-5 py-3 font-medium">{v.fullName}</td>
                    <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{v.phone}</td>
                    <td className="px-5 py-3" style={{ color: c.textMuted }}>{v.county} · {v.subCounty}</td>
                    <td className="px-5 py-3 mf-mono text-xs">{v.completed}</td>
                    <td className="px-5 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        {v.status !== 'approved' && (
                          <Button
                            variant="teal"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={updatingId === v.id}
                            onClick={() => setStatus(v.id, 'approved')}
                          >
                            <Check size={13} /> Approve
                          </Button>
                        )}
                        {v.status !== 'suspended' ? (
                          <Button
                            variant="outline"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={updatingId === v.id}
                            onClick={() => setStatus(v.id, 'suspended')}
                          >
                            <Ban size={13} /> Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={updatingId === v.id}
                            onClick={() => setStatus(v.id, 'approved')}
                          >
                            <RotateCcw size={13} /> Reinstate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    No vets match this filter.
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
