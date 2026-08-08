import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Banknote, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api, tryApi } from '../lib/api.js';
import Card from '../components/ui/Card.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import VetLayout from '../components/vet/VetLayout.jsx';
import { formatDateTime, formatKes } from '../data/mockData.js';

const MOCK_PAYMENTS = [
  {
    id: "1aa9c434-3937-45cb-9cd6-2b348c8aeeca",
    requestId: "f783d0a7-cae3-4d90-aef7-7438c0bdca68",
    farmerId: "906f13c4-f2d5-4a49-a187-4eab66668c2c",
    vetId: "9bf0756e-3981-4ecd-bad0-a75b07ef5526",
    amount: 1,
    mpesaReceiptNumber: "UH36P1F3SJ",
    phone: "0796598108",
    status: "success",
    checkoutRequestId: "ws_CO_030820261255513796598108",
    createdAt: "2026-08-03T09:55:46.000Z",
    completedAt: "2026-08-03T09:55:58.000Z",
    farmerName: "James Maina",
    vetName: "Clement Kariuki"
  },
  {
    id: "6514a021-9e56-4f07-b8d2-a1fe77e3689d",
    requestId: "f783d0a7-cae3-4d90-aef7-7438c0bdca68",
    farmerId: "906f13c4-f2d5-4a49-a187-4eab66668c2c",
    vetId: "9bf0756e-3981-4ecd-bad0-a75b07ef5526",
    amount: 1,
    mpesaReceiptNumber: null,
    phone: "0796598108",
    status: "failed",
    checkoutRequestId: "ws_CO_030820261253051796598108",
    createdAt: "2026-08-03T09:52:59.000Z",
    completedAt: "2026-08-03T09:53:15.000Z",
    farmerName: "James Maina",
    vetName: "Clement Kariuki"
  },
  {
    id: "3039f7c4-aba1-4ce9-8517-85559f8741c6",
    requestId: "f783d0a7-cae3-4d90-aef7-7438c0bdca68",
    farmerId: "906f13c4-f2d5-4a49-a187-4eab66668c2c",
    vetId: "9bf0756e-3981-4ecd-bad0-a75b07ef5526",
    amount: 1,
    mpesaReceiptNumber: "UH36P1F1AW",
    phone: "0796598108",
    status: "success",
    checkoutRequestId: "ws_CO_030820261252112796598108",
    createdAt: "2026-08-03T09:52:05.000Z",
    completedAt: "2026-08-03T09:52:27.000Z",
    farmerName: "James Maina",
    vetName: "Clement Kariuki"
  }
];

export default function VetEarnings() {
  const { c } = useTheme();
  const { user } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });

  const vetId = user?.id || "9bf0756e-3981-4ecd-bad0-a75b07ef5526";

  const loadPayments = useCallback(async (currentPage = page) => {
    setLoading(true);
    const data = await tryApi(
      async () => (await api.get(`/payments/vet/${vetId}?page=${currentPage}&limit=10`)).data,
      { payments: MOCK_PAYMENTS, pagination: { total: MOCK_PAYMENTS.length, totalPages: 1, page: 1, limit: 10 } }
    );
    setPayments(data?.payments || []);
    if (data?.pagination) setPagination(data.pagination);
    setLoading(false);
  }, [vetId, page]);

  useEffect(() => {
    loadPayments(page);
  }, [loadPayments, page]);

  // Calculations from payments response
  const totalEarned = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === 'success').length;
  const totalCount = payments.length;

  return (
    <VetLayout title="Payments" subtitle="Payments received for completed requests via M-Pesa.">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase mf-mono" style={{ color: c.textFaint }}>Total Paid</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.tealSoft }}>
              <TrendingUp size={16} color={c.teal} />
            </div>
          </div>
          <div className="mf-display text-2xl font-semibold mt-3">{formatKes(totalEarned)}</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase mf-mono" style={{ color: c.textFaint }}>Successful Payments</span>
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
          <div className="mf-display text-2xl font-semibold mt-3">{totalCount}</div>
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
                {['M-Pesa Receipt / ID', 'Farmer', 'Phone', 'Date', 'Status', 'Amount'].map((h) => (
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
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surfaceHover transition-colors">
                    <td className="px-5 py-3 mf-mono text-xs font-semibold" style={{ color: c.text }}>
                      {p.mpesaReceiptNumber || p.id.substring(0, 8)}
                    </td>
                    <td className="px-5 py-3 font-medium">{p.farmerName || 'Farmer'}</td>
                    <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{p.phone || '—'}</td>
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
                ))
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
    </VetLayout>
  );
}
