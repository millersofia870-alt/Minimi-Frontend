import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, X, Loader2, CheckCircle2, Camera, Upload, Image } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { api, tryApi } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import VetLayout from '../components/vet/VetLayout.jsx';
import { myVetRequests, formatDateTime } from '../data/mockData.js';
import { PhoneInput, COUNTRIES } from '../components/ui/PhoneInput.jsx';

const FILTERS = ['all', 'pending', 'accepted', 'completed'];

const DEFAULT_PAY_DIALOG = { open: false, requestId: null, farmerName: '', phone: '', amount: '', loading: false, result: null };
const DEFAULT_UPLOAD_DIALOG = { open: false, requestId: null, farmerName: '', notes: '', uploading: false, done: false, error: null };

export default function VetDashboard() {
  const { c } = useTheme();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(myVetRequests);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: myVetRequests.length, total: myVetRequests.length, totalPages: 1, hasPrev: false, hasNext: false });
  const [loading, setLoading] = useState(true);

  // STK push modal state
  const [payDialog, setPayDialog] = useState(DEFAULT_PAY_DIALOG);

  // Upload / camera modal state
  const [uploadDialog, setUploadDialog] = useState(DEFAULT_UPLOAD_DIALOG);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Two separate hidden file inputs: gallery + camera
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      setLoading(true);
      const params = { page };
      if (filter !== 'all') params.status = filter;

      const data = await tryApi(
        async () => (await api.get('/vet/requests?limit=5', { params })).data,
        { requests: myVetRequests, pagination: { page: 1, limit: myVetRequests.length, total: myVetRequests.length, totalPages: 1, hasPrev: false, hasNext: false } }
      );

      if (!cancelled) {
        setRequests(data?.requests ?? []);
        setPagination(data?.pagination ?? { page: 1, limit: data?.requests?.length ?? 0, total: data?.requests?.length ?? 0, totalPages: 1, hasPrev: false, hasNext: false });
        setLoading(false);
      }
    }

    loadRequests();
    const interval = setInterval(loadRequests, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [filter, page]);

  // Socket: auto-close STK push dialog and update request status
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePaymentStatus = (data) => {
      if (data?.requestId && payDialog.open && payDialog.requestId === data.requestId) {
        if (data?.status === 'success') {
          setPayDialog((prev) => ({ ...prev, result: 'success' }));
        } else if (data?.status === 'failed') {
          setPayDialog((prev) => ({ ...prev, result: 'failed' }));
        }
      }
    };

    const handleRequestStatus = (data) => {
      if (data?.requestId) {
        setRequests((prev) => prev.map((r) => (r.id === data.requestId ? { ...r, status: data.status } : r)));
      }
    };

    socket.on('payment_status_update', handlePaymentStatus);
    socket.on('request_status_update', handleRequestStatus);
    return () => {
      socket.off('payment_status_update', handlePaymentStatus);
      socket.off('request_status_update', handleRequestStatus);
    };
  }, [payDialog.open, payDialog.requestId]);

  // ── Accept ──────────────────────────────────────────────────────────────────
  const accept = async (id, e) => {
    e.stopPropagation();
    const updated = await tryApi(
      async () => (await api.patch(`/service-requests/${id}/accept`)).data.request,
      null
    );
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated?.status ?? 'accepted' } : r)));
  };

  // ── STK Push ────────────────────────────────────────────────────────────────
  const openPayDialog = (r, e) => {
    e.stopPropagation();
    const raw = r.farmerPhone ?? '';
    const matched = COUNTRIES.find((c) => raw.startsWith(c.code.replace('+', '')));
    setPayDialog({
      open: true,
      requestId: r.id,
      farmerName: r.farmerName,
      phone: matched ? raw.slice(matched.code.replace('+', '').length) : raw,
      amount: r.serviceFee != null ? String(r.serviceFee) : '',
      loading: false,
      result: null,
    });
  };

  const closePayDialog = () => setPayDialog(DEFAULT_PAY_DIALOG);

  const sendStkPush = async () => {
    if (!payDialog.amount || Number(payDialog.amount) <= 0 || !payDialog.phone) return;
    setPayDialog((prev) => ({ ...prev, loading: true, result: null }));

    const result = await tryApi(
      async () => (await api.post('/mpesa/stk-push', {
        requestId: payDialog.requestId,
        amount: Number(payDialog.amount),
        phone: COUNTRIES[0].code.replace('+', '') + payDialog.phone,
      })).data,
      { mock: true }
    );

    setPayDialog((prev) => ({ ...prev, loading: false, result: result ? 'sent' : 'error' }));
  };

  const sendWalletRequest = async () => {
    if (!payDialog.amount || Number(payDialog.amount) <= 0) return;
    setPayDialog((prev) => ({ ...prev, loading: true, result: null }));
    const result = await tryApi(
      async () => (await api.post(`/wallet/payment-requests/${payDialog.requestId}`, { amount: Number(payDialog.amount) })).data,
      { mock: true },
    );
    setPayDialog((prev) => ({ ...prev, loading: false, result: result ? 'wallet-sent' : 'error' }));
  };

  // ── Image Upload ─────────────────────────────────────────────────────────────
  const openUploadDialog = (r, e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadDialog({ open: true, requestId: r.id, farmerName: r.farmerName, notes: '', uploading: false, done: false, error: null });
  };

  const closeUploadDialog = () => {
    setUploadDialog(DEFAULT_UPLOAD_DIALOG);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const onFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadDialog((prev) => ({ ...prev, error: null, done: false }));
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submitUpload = async () => {
    if (!selectedFile || !uploadDialog.requestId) return;
    setUploadDialog((prev) => ({ ...prev, uploading: true, error: null }));

    try {
      const dataUrl = await fileToBase64(selectedFile);
      const result = await tryApi(
        async () => (await api.post(`/vet/requests/${uploadDialog.requestId}/capture-image`, {
          image: dataUrl,
          type: 'livestock',
          notes: uploadDialog.notes || undefined,
        })).data.capture,
        { mock: true }
      );

      if (result) {
        setUploadDialog((prev) => ({ ...prev, uploading: false, done: true }));
      } else {
        setUploadDialog((prev) => ({ ...prev, uploading: false, error: 'Upload failed — please try again.' }));
      }
    } catch {
      setUploadDialog((prev) => ({ ...prev, uploading: false, error: 'Failed to process image.' }));
    }
  };

  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };

  return (
    <VetLayout title="Requests" subtitle="Requests in your county/sub-county, and ones assigned to you.">

      {/* Hidden file inputs — shared across all cards */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChosen}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChosen}
      />

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors"
            style={filter === f
              ? { background: c.tealSoft, color: c.tealText, border: `1px solid ${c.teal}` }
              : { border: `1px solid ${c.border}`, color: c.textMuted }}>
            {f}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="mf-mono text-[10px] uppercase" style={{ color: c.textFaint }}>
                {['Request', 'Farmer', 'County', 'Status', 'Fee', 'Actions'].map((h) => (
                  <th key={h} className="text-left font-semibold px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
                    <Loader2 size={22} className="animate-spin mx-auto mb-2" style={{ color: c.teal }} />
                    Loading requests…
                  </td>
                </tr>
              ) : requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-surfaceHover transition-colors cursor-pointer"
                    style={{ borderColor: c.border }}
                    onClick={() => navigate(`/vet/requests/${r.id}`)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="mf-mono text-xs" style={{ color: c.textFaint }}>{r.id.substring(0, 8)}…</span>
                        <StatusBadge status={r.status} />
                        {r.feeStatus === 'approved' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.tealSoft, color: c.tealText }}>Fee Approved</span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1 capitalize">{r.animalOrCropType}</p>
                      <p className="text-xs mt-0.5 truncate max-w-[260px]" style={{ color: c.textMuted }}>{r.description}</p>
                    </td>
                    <td className="px-5 py-3 font-medium">{r.farmerName}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: c.textMuted }}>
                      {r.county} · {r.subCounty}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 mf-mono text-xs">
                      {r.serviceFee != null ? `KES ${r.serviceFee.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {r.status === 'pending' && (
                          <Button variant="teal" className="!px-2.5 !py-1.5 text-xs" onClick={(e) => { e.stopPropagation(); accept(r.id, e); }}>Accept</Button>
                        )}
                        {(r.status === 'accepted' || r.status === 'in_progress') && (
                          <Button variant="outline" className="!px-2.5 !py-1.5 text-xs" onClick={(e) => { e.stopPropagation(); openUploadDialog(r, e); }}>
                            <Camera size={13} /> Photo
                          </Button>
                        )}
                        {(r.status === 'accepted' || r.status === 'in_progress') && r.feeStatus === 'approved' && (
                          <Button variant="teal" className="!px-2.5 !py-1.5 text-xs" onClick={(e) => { e.stopPropagation(); openPayDialog(r, e); }}>
                            <Banknote size={13} /> Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: c.textFaint }}>
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

      {/* ── Upload / Camera Modal ─────────────────────────────────────────── */}
      {uploadDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <Card className="max-w-md w-full p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 rounded-full p-1"
              style={{ color: c.textMuted }}
              onClick={closeUploadDialog}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: c.tealSoft }}>
                <Camera size={18} color={c.tealText} />
              </div>
              <div>
                <h2 className="text-base font-semibold">Upload Image</h2>
                <p className="text-xs" style={{ color: c.textMuted }}>For {uploadDialog.farmerName}'s request</p>
              </div>
            </div>

            {uploadDialog.done ? (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: c.tealSoft, color: c.tealText }}>
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Image uploaded!</p>
                  <p className="text-sm mt-0.5">The photo has been saved to this request.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Source picker */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-xl py-4 border-2 border-dashed transition-colors"
                    style={{ borderColor: c.border, color: c.textMuted }}
                  >
                    <Upload size={22} />
                    <span className="text-xs font-medium">Upload from Gallery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-xl py-4 border-2 border-dashed transition-colors"
                    style={{ borderColor: c.border, color: c.textMuted }}
                  >
                    <Camera size={22} />
                    <span className="text-xs font-medium">Use Camera</span>
                  </button>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-end p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
                      <span className="text-white text-xs font-medium flex items-center gap-1"><Image size={12} /> Preview</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.textFaint }}>
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add a note for this photo…"
                    value={uploadDialog.notes}
                    onChange={(e) => setUploadDialog((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none"
                    style={inputStyle}
                  />
                </div>

                {uploadDialog.error && (
                  <p className="text-sm" style={{ color: c.danger }}>{uploadDialog.error}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium"
                    style={{ borderColor: c.border, color: c.text }}
                    onClick={closeUploadDialog}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || uploadDialog.uploading}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: c.teal }}
                    onClick={submitUpload}
                  >
                    {uploadDialog.uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploadDialog.uploading ? 'Uploading…' : 'Upload Photo'}
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── STK Push Payment Modal ────────────────────────────────────────── */}
      {payDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <Card className="max-w-md w-full p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 rounded-full p-1 transition-colors"
              style={{ color: c.textMuted }}
              onClick={closePayDialog}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: c.tealSoft }}>
                <Banknote size={18} color={c.tealText} />
              </div>
              <div>
                <h2 className="text-base font-semibold">Request M-Pesa Payment</h2>
                <p className="text-xs" style={{ color: c.textMuted }}>Send STK push to {payDialog.farmerName}</p>
              </div>
            </div>

            {payDialog.result === 'sent' ? (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: c.tealSoft, color: c.tealText }}>
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">M-Pesa prompt sent!</p>
                   <p className="text-sm mt-0.5">The farmer will receive a payment prompt on {COUNTRIES[0].code}{payDialog.phone}.</p>
                </div>
              </div>
            ) : payDialog.result === 'wallet-sent' ? (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: c.tealSoft, color: c.tealText }}>
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <div><p className="font-semibold text-sm">Wallet request sent!</p><p className="text-sm mt-0.5">The farmer can approve it from their Wallet using their available balance.</p></div>
              </div>
             ) : (
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.textFaint }}>
                     Farmer Phone Number
                   </label>
                    <PhoneInput
                      value={payDialog.phone}
                      onChange={(val) => setPayDialog((prev) => ({ ...prev, phone: val }))}
                      placeholder="712345678"
                      prefix={COUNTRIES[0].code}
                      className="w-full"
                    />
                 </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: c.textFaint }}>
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1500"
                    value={payDialog.amount}
                    onChange={(e) => setPayDialog((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none font-mono"
                    style={inputStyle}
                  />
                </div>

                {payDialog.result === 'error' && (
                  <p className="text-sm" style={{ color: c.danger }}>Failed to send STK push — please try again.</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium"
                    style={{ borderColor: c.border, color: c.text }}
                    onClick={closePayDialog}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={payDialog.loading}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: c.teal }}
                    onClick={sendStkPush}
                  >
                    {payDialog.loading ? <Loader2 size={15} className="animate-spin" /> : null}
                    {payDialog.loading ? 'Sending…' : 'Send M-Pesa Prompt'}
                  </button>
                  <button
                    type="button"
                    disabled={payDialog.loading}
                    className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                    style={{ borderColor: c.teal, color: c.tealText }}
                    onClick={sendWalletRequest}
                  >
                    Request Wallet Payment
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </VetLayout>
  );
}
