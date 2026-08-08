import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Banknote, CheckCircle2, Loader2, Tag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api, tryApi } from '../lib/api.js';
import Card from '../components/ui/Card.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';
import { formatDateTime, formatKes } from '../data/mockData.js';

const MOCK_FARMER_PAYMENTS = [
  {
    id: "1aa9c434-3937-45cb-9cd6-2b348c8aeeca",
    type: "vet_service",
    amount: 1,
    status: "success",
    mpesaReceiptNumber: "UH36P1F3SJ",
    phone: "0796598108",
    description: "Livestock",
    createdAt: "2026-08-03T09:55:46.000Z",
    completedAt: "2026-08-03T09:55:58.000Z",
  },
  {
    id: "3039f7c4-aba1-4ce9-8517-85559f8741c6",
    type: "subscription",
    amount: 500,
    status: "success",
    mpesaReceiptNumber: null,
    phone: null,
    description: "Premium Plan",
    createdAt: "2026-08-03T09:52:05.000Z",
    completedAt: "2026-08-03T09:52:27.000Z",
  }
];

const TYPE_LABELS = {
  vet_service: { label: 'Vet Service', color: '#0ea5e9' },
  subscription: { label: 'Subscription', color: '#f59e0b' },
};

export default function FarmerPayments() {
  const { c } = useTheme();
  const { user } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });

  const farmerId = user?.id;

  const loadPayments = useCallback(async (currentPage) => {
    if (!farmerId) return;
    setLoading(true);
    const data = await tryApi(
      async () => (await api.get(`/payments/farmer/${farmerId}/unified?page=${currentPage}&limit=10`)).data,
      { payments: MOCK_FARMER_PAYMENTS, pagination: { total: MOCK_FARMER_PAYMENTS.length, totalPages: 1, page: 1, limit: 10 } }
    );
    setPayments(data?.payments || []);
    if (data?.pagination) setPagination(data.pagination);
    setLoading(false);
  }, [farmerId]);

  useEffect(() => {
    loadPayments(page);
  }, [loadPayments, page]);

  // Stats computed from current page — for real totals we rely on pagination.total
  const totalPaid = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === 'success').length;

  return (
    <FarmerLayout title="Payments" subtitle="All M-Pesa payments — vet services and subscriptions.">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase mf-mono" style={{ color: c.textFaint }}>Total Paid (Page)</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.tealSoft }}>
              <TrendingUp size={16} color={c.teal} />
            </div>
          </div>
          <div className="mf-display text-2xl font-semibold mt-3">{formatKes(totalPaid)}</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase mf-mono" style={{ color: c.textFaint }}>Successful</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.tealSoft }}>
              <CheckCircle2 size={16} color={c.teal} />
            </div>
          </div>
          <div className="mf-display text-2xl font-semibold mt-3">{successfulCount}</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase mf-mono" style={{ color: c.textFaint }}>Total Transactions</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.goldSoft }}>
              <Banknote size={16} color={c.gold} />
            </div>
          </div>
          <div className="mf-display text-2xl font-semibold mt-3">{pagination.total}</div>
        </Card>
      </div>

      {/* Payments History Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: c.border }}>
          <h3 className="font-semibold text-sm">Payment History</h3>
          <span className="text-xs mf-mono" style={{ color: c.textFaint }}>{pagination.total} transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="mf-mono text-[10px] uppercase border-b" style={{ borderColor: c.border, color: c.textFaint }}>
                {['Receipt / ID', 'Type', 'Description', 'Date', 'Status', 'Amount'].map((h) => (
                  <th key={h} className="font-semibold px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: c.border }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" color={c.teal} />
                    Loading payments…
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => {
                  const typeInfo = TYPE_LABELS[p.type] || { label: p.type, color: c.textMuted };
                  return (
                    <tr key={p.id} className="hover:bg-surfaceHover transition-colors">
                      <td className="px-5 py-3 mf-mono text-xs font-semibold" style={{ color: c.text }}>
                        {p.mpesaReceiptNumber || p.id.substring(0, 8)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase rounded-full px-2 py-0.5"
                          style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                        >
                          <Tag size={9} />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm max-w-[160px] truncate" style={{ color: c.textMuted }}>{p.description}</td>
                      <td className="px-5 py-3 mf-mono text-xs whitespace-nowrap" style={{ color: c.textFaint }}>
                        {formatDateTime(p.completedAt || p.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3 font-semibold mf-mono text-xs whitespace-nowrap">
                        {formatKes(p.amount)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t" style={{ borderColor: c.border }}>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={loading}
            />
          </div>
        )}
      </Card>
    </FarmerLayout>
  );
}
