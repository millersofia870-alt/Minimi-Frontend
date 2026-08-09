import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Loader2, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api, tryApi } from '../lib/api.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';
import { myFarmerRequests, formatDateTime } from '../data/mockData.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export default function FarmerRequests() {
  const { c } = useTheme();
  const { user } = useSession();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(myFarmerRequests);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: myFarmerRequests.length, totalPages: 1, hasPrev: false, hasNext: false });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const data = await tryApi(
        async () => (await api.get('/service-requests/my?limit=8', { params: { page } })).data,
        { requests: myFarmerRequests, pagination: { page: 1, limit: 8, total: myFarmerRequests.length, totalPages: 1, hasPrev: false, hasNext: false } }
      );
      if (!cancelled) {
        setRequests(data.requests ?? []);
        setPagination(data.pagination ?? { page: 1, limit: 8?? 0, total: data.requests?.length ?? 0, totalPages: 1, hasPrev: false, hasNext: false });
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [page]);

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <FarmerLayout title="My requests" subtitle="Track and manage your service requests.">
      {!loading && requests.length === 0 ? (
        <Card className="p-10 text-center">
          <ClipboardList size={36} color={c.textFaint} className="mx-auto mb-3" />
          <p className="font-medium">No requests yet</p>
          <p className="text-sm mt-1" style={{ color: c.textMuted }}>
            When you request a vet, it will appear here.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/farmer/request-service')}>
            <Plus size={15} />
            Request a vet
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-1 p-1.5 border-b" style={{ borderColor: c.border, background: c.bgElevated }}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                style={{
                  background: filter === f.id ? c.border : 'transparent',
                  color: filter === f.id ? c.text : c.textMuted,
                }}
                onMouseEnter={(e) => { if (filter !== f.id) e.currentTarget.style.background = c.border + '40'; }}
                onMouseLeave={(e) => { if (filter !== f.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                  {['Request', 'Type', 'Vet', 'County', 'Status', 'Fee', 'Date'].map((h) => (
                    <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                      <Loader2 size={22} className="animate-spin mx-auto mb-2" style={{ color: c.teal }} />
                      Loading requests…
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-surfaceHover transition-colors cursor-pointer"
                      style={{ borderColor: c.border }}
                      onClick={() => navigate(`/farmer/requests/${r.id}`)}>
                      <td className="px-5 py-3">
                        <span className="mf-mono text-xs" style={{ color: c.textFaint }}>{r.id.substring(0, 8)}…</span>
                      </td>
                      <td className="px-5 py-3 font-medium capitalize">{r.animalOrCropType}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: c.textMuted }}>{r.vetName || 'Awaiting a vet'}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: c.textMuted }}>{r.county} · {r.subCounty}</td>
                      <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-3 mf-mono text-xs">
                        {r.serviceFee != null ? `KES ${r.serviceFee.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: c.textFaint }}>
                        {formatDateTime(r.requestedAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                      No requests match this filter.
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
      )}
    </FarmerLayout>
  );
}
