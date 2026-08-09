import React, { useEffect, useState, useCallback } from 'react';
import { X, User, MapPin, FileText, ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { recentRequests as initialRequests, COUNTIES, formatDateTime } from '../data/mockData.js';
import { api, tryApi } from '../lib/api.js';

const STATUSES = ['all', 'pending', 'accepted', 'in_progress', 'completed'];

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

function RequestDetailDialog({ requestId, onClose, c }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/admin/service-requests/${requestId}`);
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [requestId]);

  const images = data?.images ?? [];
  const r = data?.request;

  function resolveImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden"
        style={{ border: `1px solid ${c.border}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: c.border }}>
          <div>
            <h2 className="font-bold text-base">Request Details</h2>
            {r && <p className="text-xs mf-mono mt-0.5" style={{ color: c.textFaint }}>{r.id}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surfaceHover transition-colors"
            style={{ color: c.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: c.teal }} />
            </div>
          ) : !r ? (
            <div className="py-10 text-center text-sm" style={{ color: c.textFaint }}>
              Could not load request details.
            </div>
          ) : (
            <>
              {/* Status + dates */}
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={r.status} />
                <span className="text-xs mf-mono" style={{ color: c.textFaint }}>
                  Submitted {formatDateTime(r.requestedAt)}
                </span>
                {r.completedAt && (
                  <span className="text-xs mf-mono" style={{ color: c.textFaint }}>
                    · Completed {formatDateTime(r.completedAt)}
                  </span>
                )}
              </div>

              {/* Info grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Farmer */}
                <div className="rounded-xl p-4 space-y-1" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} style={{ color: c.teal }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.textFaint }}>Farmer</span>
                  </div>
                  <p className="font-semibold">{r.farmerName || '—'}</p>
                  {r.farmerPhone && <p className="text-xs mf-mono" style={{ color: c.textMuted }}>{r.farmerPhone}</p>}
                </div>

                {/* Vet */}
                <div className="rounded-xl p-4 space-y-1" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} style={{ color: c.gold }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.textFaint }}>Vet</span>
                  </div>
                  <p className="font-semibold">{r.vetName || 'Not assigned'}</p>
                </div>

                {/* Location */}
                <div className="rounded-xl p-4" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} style={{ color: c.teal }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.textFaint }}>Location</span>
                  </div>
                  <p className="font-semibold">{r.county}</p>
                  <p className="text-xs" style={{ color: c.textMuted }}>{r.subCounty}</p>
                </div>

                {/* Type + fee */}
                <div className="rounded-xl p-4" style={{ background: c.bgElevated, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} style={{ color: c.gold }} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.textFaint }}>Type / Fee</span>
                  </div>
                  <p className="font-semibold capitalize">{r.animalOrCropType}</p>
                  {r.serviceFee != null && (
                    <p className="text-xs mf-mono" style={{ color: c.textMuted }}>
                      KES {r.serviceFee.toLocaleString()} · {r.feeStatus?.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {r.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: c.textFaint }}>Description</p>
                  <p className="text-sm leading-relaxed rounded-xl p-4" style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}>
                    {r.description}
                  </p>
                </div>
              )}

              {/* Image Gallery */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={14} style={{ color: c.teal }} />
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.textFaint }}>
                    Capture Images ({images.length})
                  </p>
                </div>
                {images.length === 0 ? (
                  <div className="rounded-xl p-6 text-center text-sm" style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.textFaint }}>
                    No images captured for this request.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setLightboxIdx(idx)}
                        className="relative rounded-xl overflow-hidden aspect-square hover:opacity-90 transition-opacity group"
                        style={{ border: `1px solid ${c.border}` }}
                      >
                        <img
                          src={resolveImageUrl(img.imageUrl)}
                          alt={img.notes || `Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-2">
                          {img.notes && (
                            <span className="text-white text-[10px] bg-black/60 rounded px-1.5 py-0.5 truncate">
                              {img.notes}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.max(0, i - 1)); }}
            disabled={lightboxIdx === 0}
            className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={20} color="white" />
          </button>

          <img
            src={resolveImageUrl(images[lightboxIdx]?.imageUrl)}
            alt={images[lightboxIdx]?.notes || 'Capture'}
            className="max-w-[80vw] max-h-[80vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.min(images.length - 1, i + 1)); }}
            disabled={lightboxIdx === images.length - 1}
            className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={20} color="white" />
          </button>

          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X size={20} color="white" />
          </button>

          {images.length > 1 && (
            <div className="absolute bottom-4 text-white/60 text-sm">
              {lightboxIdx + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminRequests() {
  const { c } = useTheme();
  const [status, setStatus] = useState('all');
  const [county, setCounty] = useState('all');
  const [requests, setRequests] = useState(initialRequests);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: initialRequests.length, total: initialRequests.length, totalPages: 1, hasPrev: false, hasNext: false });
  const [loading, setLoading] = useState(true);
  const [feeDialog, setFeeDialog] = useState({ open: false, requestId: null, amount: '', error: null, saving: false });
  const [detailRequestId, setDetailRequestId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      setLoading(true);
      const params = { page };
      if (status !== 'all') params.status = status;
      if (county !== 'all') params.county = county;

      const data = await tryApi(
        async () => (await api.get('/admin/service-requests?limit=10', { params })).data,
        { requests: initialRequests, pagination: { page: 1, limit: initialRequests.length, total: initialRequests.length, totalPages: 1, hasPrev: false, hasNext: false } },
      );

      if (!cancelled) {
        setRequests(data.requests ?? []);
        setPagination(data.pagination ?? { page: 1, limit: data.requests?.length ?? 0, total: data.requests?.length ?? 0, totalPages: 1, hasPrev: false, hasNext: false });
        setLoading(false);
      }
    }

    loadRequests();
    const interval = setInterval(loadRequests, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [status, county, page]);

  const openFeeDialog = (e, requestId) => {
    e.stopPropagation();
    setFeeDialog({ open: true, requestId, amount: '', error: null, saving: false });
  };
  const closeFeeDialog = () => setFeeDialog({ open: false, requestId: null, amount: '', error: null, saving: false });

  const submitFee = async () => {
    if (!feeDialog.amount || Number(feeDialog.amount) <= 0) {
      setFeeDialog((prev) => ({ ...prev, error: 'Enter a valid fee amount.' }));
      return;
    }

    setFeeDialog((prev) => ({ ...prev, saving: true, error: null }));
    try {
      await api.patch(`/service-requests/${feeDialog.requestId}/fee`, {
        amount: Number(feeDialog.amount),
        approve: true,
      });
      setRequests((prev) => prev.map((r) => (
        r.id === feeDialog.requestId ? { ...r, serviceFee: Number(feeDialog.amount), feeStatus: 'not_set' } : r
      )));
      closeFeeDialog();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Unable to submit fee.';
      setFeeDialog((prev) => ({ ...prev, error: message, saving: false }));
    }
  };

  const selectStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };

  return (
    <AdminLayout title="Requests" subtitle={`${pagination.total} total requests`}>
      <div className="flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg px-3 py-2 text-sm outline-none capitalize" style={selectStyle}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace('_', ' ')}</option>)}
        </select>
        <select value={county} onChange={(e) => { setCounty(e.target.value); setPage(1); }} className="rounded-lg px-3 py-2 text-sm outline-none" style={selectStyle}>
          <option value="all">All counties</option>
          {Object.keys(COUNTIES).map((cty) => <option key={cty} value={cty}>{cty}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                {['Request', 'Farmer', 'Vet', 'County', 'Status', 'Fee', 'Action'].map((h) => (
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
              ) : requests.length > 0 ? (
                requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t cursor-pointer hover:bg-surfaceHover transition-colors"
                    style={{ borderColor: c.border }}
                    onClick={() => setDetailRequestId(r.id)}
                  >
                    <td className="px-5 py-3 mf-mono text-xs max-w-[120px] truncate" style={{ color: c.textMuted }}>{r.id.substring(0, 8)}…</td>
                    <td className="px-5 py-3 font-medium">{r.farmerName ?? r.farmer}</td>
                    <td className="px-5 py-3" style={{ color: c.textMuted }}>{r.vetName ?? r.vet ?? '—'}</td>
                    <td className="px-5 py-3" style={{ color: c.textMuted }}>{r.county}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 mf-mono text-xs">{r.serviceFee != null ? `KES ${r.serviceFee.toLocaleString()}` : '—'}</td>
                    <td className="px-5 py-3">
                      {r.status === 'accepted' ? (
                        <button
                          type="button"
                          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                          onClick={(e) => openFeeDialog(e, r.id)}
                        >
                          Approve fee
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    No requests match these filters.
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

      {/* Request Detail Dialog */}
      {detailRequestId && (
        <RequestDetailDialog
          requestId={detailRequestId}
          onClose={() => setDetailRequestId(null)}
          c={c}
        />
      )}

      {/* Fee Dialog */}
      {feeDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <Card className="max-w-md w-full p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-sm font-semibold"
              style={{ color: c.textMuted }}
              onClick={closeFeeDialog}
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Approve fee</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: c.textFaint }}>Status</label>
                <input
                  type="text"
                  readOnly
                  value="approved"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                  style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide mb-1" style={{ color: c.textFaint }}>Fee amount</label>
                <input
                  type="number"
                  min="0"
                  value={feeDialog.amount}
                  onChange={(e) => setFeeDialog((prev) => ({ ...prev, amount: e.target.value, error: null }))}
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                  style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
                />
              </div>
              {feeDialog.error && (
                <p className="text-sm text-red-600">{feeDialog.error}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border px-4 py-2 text-sm"
                  style={{ borderColor: c.border, color: c.text }}
                  onClick={closeFeeDialog}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  disabled={feeDialog.saving}
                  onClick={submitFee}
                >
                  {feeDialog.saving ? 'Saving…' : 'Submit fee'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
