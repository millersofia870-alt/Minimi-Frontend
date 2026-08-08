import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Phone, Loader2, Clock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';
import { formatDate, formatKes } from '../data/mockData.js';

export default function FarmerSubscriptions() {
  const { c } = useTheme();
  const { user } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // STK Modal state for renewal
  const [selectedSub, setSelectedSub] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '254796598108');
  const [submitting, setSubmitting] = useState(false);
  const [stkResponse, setStkResponse] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/subscriptions/my', { params: { page, limit: 10 } });
      setSubscriptions(data.subscriptions || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleSubUpdate = (data) => {
      fetchData();
      if (selectedSub && data?.subscription?.packageId === selectedSub.packageId) {
        setSelectedSub(null);
        setStkResponse(null);
      }
    };

    socket.on('subscription_status_update', handleSubUpdate);
    return () => {
      socket.off('subscription_status_update', handleSubUpdate);
    };
  }, [selectedSub, fetchData]);

  // Auto-trigger subscribe if packageId is passed from Landing page
  useEffect(() => {
    const pkgId = searchParams.get('packageId');
    if (pkgId) {
      api.get('/subscriptions/packages').then(res => {
        const pkgs = res.data.packages || [];
        const found = pkgs.find(p => p.id === pkgId);
        if (found) {
          setSelectedSub({
            packageId: found.id,
            packageName: found.name,
            amount: found.price,
            durationDays: found.durationDays,
            isNew: true
          });
          searchParams.delete('packageId');
          setSearchParams(searchParams, { replace: true });
        }
      }).catch(err => {
        console.error("Failed to fetch packages for auto-subscribe", err);
      });
    }
  }, [searchParams, setSearchParams]);

  const handleRenewClick = (sub) => {
    setSelectedSub(sub);
    setStkResponse(null);
    setPaymentSuccess(false);
    setPhone(user?.phone || '254796598108');
  };

  const handleInitiateStk = async (e) => {
    e.preventDefault();
    if (!selectedSub || !phone) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/subscriptions/subscribe-stk', {
        packageId: selectedSub.packageId,
        phone,
      });
      setStkResponse(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to initiate STK push payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!stkResponse?.checkoutRequestId) return;
    setSubmitting(true);
    try {
      await api.post('/mpesa/simulate-callback', {
        checkoutRequestId: stkResponse.checkoutRequestId,
        success: true,
      });
      setPaymentSuccess(true);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to confirm simulated payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FarmerLayout title="My Subscriptions" subtitle="Your active and past Minimi Agri service subscriptions.">
      {error && (
        <div className="mb-4 text-sm rounded-lg p-3 flex items-center gap-2" style={{ background: c.dangerSoft, color: c.danger }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: c.border }}>
          <h3 className="font-semibold text-sm">All Subscriptions</h3>
          {loading && <Loader2 size={16} className="animate-spin" style={{ color: c.teal }} />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="mf-mono text-[10px] uppercase border-b" style={{ borderColor: c.border, color: c.textFaint }}>
                <th className="font-semibold px-5 py-3 whitespace-nowrap">Package</th>
                <th className="font-semibold px-5 py-3 whitespace-nowrap">Description</th>
                <th className="font-semibold px-5 py-3 whitespace-nowrap">Start Date</th>
                <th className="font-semibold px-5 py-3 whitespace-nowrap">Expiry Date</th>
                <th className="font-semibold px-5 py-3 whitespace-nowrap">Status</th>
                <th className="font-semibold px-5 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: c.border }}>
              {loading && subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    <Loader2 size={22} className="animate-spin mx-auto mb-2" style={{ color: c.teal }} />
                    Loading subscriptions…
                  </td>
                </tr>
              ) : subscriptions.length > 0 ? (
                subscriptions.map((sub) => {
                  const isAlreadyActive = sub.status === 'active';
                  return (
                    <tr key={sub.id} className="hover:bg-surfaceHover transition-colors">
                      <td className="px-5 py-3 font-semibold">{sub.packageName}</td>
                      <td className="px-5 py-3 text-xs max-w-[200px] truncate" style={{ color: c.textMuted }}>{sub.packageDescription || '—'}</td>
                      <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{sub.startDate ? formatDate(sub.startDate) : '—'}</td>
                      <td className="px-5 py-3 mf-mono text-xs" style={{ color: c.textMuted }}>{sub.endDate ? formatDate(sub.endDate) : '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={sub.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRenewClick(sub)}
                          disabled={isAlreadyActive}
                          title={isAlreadyActive ? "You already have an active subscription for this package" : ""}
                        >
                          {isAlreadyActive ? 'Active' : 'Renew'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    <Clock size={28} color={c.textFaint} className="mx-auto mb-2" />
                    <p className="font-medium">No subscriptions yet</p>
                    <p className="text-xs mt-1" style={{ color: c.textMuted }}>Subscribe to a package to get started.</p>
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

      {/* STK Push Payment / Renewal Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold mb-1">
              {selectedSub.isNew ? 'Subscribe to' : 'Renew'} {selectedSub.packageName}
            </h3>
            <p className="text-xs mb-4" style={{ color: c.textMuted }}>
              Amount: <strong className="text-sm" style={{ color: c.gold }}>{formatKes(selectedSub.amount)}</strong> for {selectedSub.durationDays} days.
            </p>

            {!stkResponse ? (
              <form onSubmit={handleInitiateStk} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">M-Pesa Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3" color={c.textFaint} />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="254796598108"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none mf-mono border"
                      style={{ background: c.bgElevated, borderColor: c.border, color: c.text }}
                      required
                    />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: c.textFaint }}>
                    An M-Pesa STK push prompt will be sent to your phone to complete payment.
                  </p>
                </div>

                <div className="flex gap-2 justify-end mt-4">
                  <Button type="button" variant="ghost" onClick={() => setSelectedSub(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Send STK Push'}
                  </Button>
                </div>
              </form>
            ) : paymentSuccess ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 size={48} color={c.teal} className="mx-auto" />
                <h4 className="font-bold text-lg">Subscription {selectedSub.isNew ? 'Activated' : 'Renewed'}!</h4>
                <p className="text-xs text-muted">
                  Your subscription to <strong>{selectedSub.packageName}</strong> has been {selectedSub.isNew ? 'activated' : 'renewed'} successfully.
                </p>
                <Button variant="primary" className="w-full mt-2" onClick={() => setSelectedSub(null)}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <Loader2 size={36} color={c.gold} className="animate-spin mx-auto" />
                <div>
                  <p className="font-semibold text-sm">STK Push Sent!</p>
                  <p className="text-xs mt-1" style={{ color: c.textMuted }}>
                    Please check your phone (<strong>{phone}</strong>) and enter your M-Pesa PIN.
                  </p>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: c.border }}>
                  <p className="text-[11px] mb-2" style={{ color: c.goldText }}>
                    Dev Mode Helper: Confirm Payment
                  </p>
                  <Button
                    variant="teal"
                    size="sm"
                    className="w-full"
                    disabled={submitting}
                    onClick={handleSimulateSuccess}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Dev Payment'}
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSub(null)}>
                  Close
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </FarmerLayout>
  );
}
