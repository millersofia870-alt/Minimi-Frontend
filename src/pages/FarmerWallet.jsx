import React, { useEffect, useState } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, Loader2, CheckCircle2, History, ClipboardList, XCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import { useTheme } from '../context/ThemeContext.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { formatDateTime, formatKes } from '../data/mockData.js';

export default function FarmerWallet() {
  const { c } = useTheme();
  const [tab, setTab] = useState('balance');
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [notice, setNotice] = useState('');
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPagination, setRequestsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    api.get('/wallet', { params: { page: historyPage, limit: 10 } })
      .then(({ data: d }) => {
        setData(d);
        setHistoryPagination(d.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 });
      })
      .catch(() => setData({ wallet: { balance: 0 }, transactions: [
        { id: 'TXN-001', type: 'deposit', amount: 2000, status: 'success', createdAt: '2026-08-01T10:00:00Z' },
        { id: 'TXN-002', type: 'payment', amount: 1500, status: 'success', createdAt: '2026-08-02T08:30:00Z' },
        { id: 'TXN-003', type: 'payment', amount: 800, status: 'failed', createdAt: '2026-08-03T14:15:00Z' },
      ] }));
    const interval = setInterval(() => {
      api.get('/wallet', { params: { page: historyPage, limit: 10 } }).then(({ data: d }) => {
        setData(d);
        setHistoryPagination(d.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 });
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [historyPage]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleWalletUpdate = () => {
      api.get('/wallet', { params: { page: historyPage, limit: 10 } }).then(({ data: d }) => {
        setData(d);
        setHistoryPagination(d.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 });
      }).catch(() => {});
      if (tab === 'requests') {
        loadPaymentRequests(requestsPage);
      }
    };

    socket.on('wallet_payment_requested', handleWalletUpdate);
    socket.on('wallet_payment_completed', handleWalletUpdate);
    socket.on('payment_status_update', handleWalletUpdate);
    return () => {
      socket.off('wallet_payment_requested', handleWalletUpdate);
      socket.off('wallet_payment_completed', handleWalletUpdate);
      socket.off('payment_status_update', handleWalletUpdate);
    };
  }, [tab, historyPage, requestsPage]);

  const loadPaymentRequests = async (page = 1) => {
    setRequestsLoading(true);
    try {
      const { data } = await api.get('/wallet/payment-requests', { params: { page, limit: 10 } });
      setPaymentRequests(data.paymentRequests ?? []);
      setRequestsPagination(data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch {
      setPaymentRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'requests') {
      loadPaymentRequests(requestsPage);
    }
  }, [tab, requestsPage]);

  useEffect(() => {
    if (tab !== 'requests') return;
    const interval = setInterval(loadPaymentRequests, 15000);
    return () => clearInterval(interval);
  }, [tab]);

  const deposit = async () => {
    if (!Number(amount) || !phone) return;
    setDepositing(true);
    try {
      await api.post('/wallet/deposits/stk-push', { amount: Number(amount), phone });
      setNotice('STK push sent. Your wallet balance will update after you approve the M-Pesa prompt.');
      setAmount('');
    } catch (e) {
      setNotice(e.response?.data?.error || 'Could not start the deposit.');
    } finally {
      setDepositing(false);
    }
  };

  const approvePaymentRequest = async (id) => {
    setProcessingId(id);
    try {
      const { data } = await api.post(`/wallet/payment-requests/${id}/accept`);
      setNotice(`Payment of ${formatKes(data.amountPaid || 0)} processed. New balance: ${formatKes(data.newBalance || 0)}`);
      await loadPaymentRequests();
    } catch (e) {
      const msg = e.response?.data?.error || 'Could not process payment.';
      if (msg.includes('already been paid')) {
        setNotice('This request was already paid via M-Pesa. The payment request is no longer valid.');
      } else {
        setNotice(msg);
      }
      await loadPaymentRequests();
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPaymentRequest = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/wallet/payment-requests/${id}/reject`);
      setNotice('Payment request rejected.');
      await loadPaymentRequests();
    } catch (e) {
      setNotice(e.response?.data?.error || 'Could not reject payment request.');
    } finally {
      setProcessingId(null);
    }
  };

  const txns = data?.transactions ?? [];
  const pendingRequests = paymentRequests.filter((r) => r.status === 'pending');

  const isNoticeError = notice && /error|failed|could not|insufficient|already been paid|rejected/i.test(notice);
  const noticeColor = isNoticeError ? c.danger : c.tealText;
  const NoticeIcon = isNoticeError ? XCircle : CheckCircle2;

  return (
    <FarmerLayout title="Wallet" subtitle="Deposit safely and pay approved vet fees from your balance.">
      {notice && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: isNoticeError ? c.dangerSoft : c.tealSoft, color: noticeColor, border: `1px solid ${isNoticeError ? c.danger : c.teal}` }}>
          <NoticeIcon size={16} />
          {notice}
        </div>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: 'balance', label: 'Balance', icon: Wallet },
          { key: 'history', label: 'History', icon: History },
          { key: 'requests', label: `Requests ${pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}`, icon: ClipboardList },
          { key: 'deposit', label: 'Deposit', icon: Plus },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              background: tab === key ? c.goldSoft : 'transparent',
              color: tab === key ? c.goldText : c.textMuted,
              border: `1px solid ${tab === key ? c.gold : c.border}`,
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'balance' && (
        <Card className="p-6" style={{ background: c.goldSoft }}>
          <Wallet size={22} color={c.goldText} />
          <p className="text-xs mt-5" style={{ color: c.textMuted }}>Available balance</p>
          <p className="mf-display text-3xl font-semibold mt-1">{formatKes(data?.wallet?.balance ?? 0)}</p>
          <p className="text-xs mt-3" style={{ color: c.textFaint }}>Only confirmed M-Pesa deposits are spendable.</p>
        </Card>
      )}

      {tab === 'history' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: c.border }}>
            <h2 className="font-semibold">Transaction history</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                  {['Type', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data === null ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                      <Loader2 size={22} className="animate-spin mx-auto mb-2" style={{ color: c.teal }} />
                      Loading transactions…
                    </td>
                  </tr>
                ) : txns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  txns.map((t) => (
                    <tr key={t.id} className="border-t" style={{ borderColor: c.border }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: t.type === 'deposit' ? c.tealSoft : c.goldSoft }}
                          >
                            {t.type === 'deposit' ? (
                              <ArrowDownLeft size={16} color={c.teal} />
                            ) : (
                              <ArrowUpRight size={16} color={c.gold} />
                            )}
                          </div>
                          <span className="text-sm font-medium capitalize">
                            {t.type?.replace('_', ' ') || 'Transaction'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 mf-mono text-sm font-semibold" style={{ color: t.type === 'deposit' ? c.tealText : c.goldText }}>
                        {t.type === 'deposit' ? '+' : '-'}{formatKes(t.amount)}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: c.textMuted }}>
                        {formatDateTime(t.createdAt || t.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t" style={{ borderColor: c.border }}>
            <Pagination
              page={historyPagination.page}
              totalPages={historyPagination.totalPages}
              onPrevious={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setHistoryPage((prev) => prev + 1)}
              disabled={data === null}
            />
          </div>
        </Card>
      )}

      {tab === 'requests' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: c.border }}>
            <h2 className="font-semibold">Payment requests</h2>
            <p className="text-xs mt-1" style={{ color: c.textFaint }}>Approve or reject vet payment requests from your wallet.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                  {['Request', 'Type', 'Vet', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requestsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                      <Loader2 size={22} className="animate-spin mx-auto mb-2" style={{ color: c.teal }} />
                      Loading payment requests…
                    </td>
                  </tr>
                ) : paymentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                      No payment requests yet.
                    </td>
                  </tr>
                ) : (
                  paymentRequests.map((pr) => (
                    <tr key={pr.id} className="border-t" style={{ borderColor: c.border }}>
                      <td className="px-5 py-3.5">
                        <span className="mf-mono text-xs" style={{ color: c.textFaint }}>{pr.requestId.substring(0, 8)}…</span>
                      </td>
                      <td className="px-5 py-3.5 font-medium capitalize">{pr.animalOrCropType || 'Service request'}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: c.textMuted }}>{pr.vetName || '—'}</td>
                      <td className="px-5 py-3.5 mf-mono text-xs font-semibold" style={{ color: c.goldText }}>{formatKes(pr.amount)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={pr.status} /></td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: c.textMuted }}>{formatDateTime(pr.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        {pr.status === 'pending' && !pr.paidAt ? (
                          <div className="flex gap-2">
                            <Button
                              variant="teal"
                              className="!px-2.5 !py-1.5 text-xs"
                              disabled={processingId === pr.id}
                              onClick={() => approvePaymentRequest(pr.id)}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="!px-2.5 !py-1.5 text-xs"
                              disabled={processingId === pr.id}
                              onClick={() => rejectPaymentRequest(pr.id)}
                            >
                              <XCircle size={13} /> Reject
                            </Button>
                          </div>
                        ) : pr.status === 'pending' && pr.paidAt ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: c.tealSoft, color: c.tealText }}>
                            Already paid
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: c.textFaint }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t" style={{ borderColor: c.border }}>
            <Pagination
              page={requestsPagination.page}
              totalPages={requestsPagination.totalPages}
              onPrevious={() => setRequestsPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setRequestsPage((prev) => prev + 1)}
              disabled={requestsLoading}
            />
          </div>
        </Card>
      )}

      {tab === 'deposit' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={17} color={c.teal} />
            <h2 className="font-semibold">Deposit via M-Pesa</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (KES)"
              type="number"
              min="1"
              className="rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="M-Pesa phone e.g. 2547..."
              className="rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
            />
          </div>
          <Button className="mt-3" variant="teal" onClick={deposit} disabled={depositing}>
            {depositing ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {depositing ? 'Sending…' : 'Deposit'}
          </Button>
        </Card>
      )}
    </FarmerLayout>
  );
}
