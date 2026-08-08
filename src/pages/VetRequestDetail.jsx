import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Camera, Upload, Banknote, Loader2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { api, tryApi } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { Field } from '../components/ui/Field.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import VetLayout from '../components/vet/VetLayout.jsx';
import { myVetRequests, sampleChatMessages, formatDateTime } from '../data/mockData.js';

export default function VetRequestDetail() {
  const { c } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initial = myVetRequests.find((r) => r.id === id) ?? { ...myVetRequests[0], id };
  const [request, setRequest] = useState(initial);
  const [captures, setCaptures] = useState([]);
  const [notes, setNotes] = useState('');

  const [showPayForm, setShowPayForm] = useState(false);
  const [amount, setAmount] = useState(initial.serviceFee?.toString() || '');
  const [phone, setPhone] = useState(initial.farmerPhone || '');
  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState(null); // null | 'sent' | 'success' | 'failed' | 'error'
  const [payReceipt, setPayReceipt] = useState(null);

  // Listen for M-Pesa callback over socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handlePaymentStatus = (data) => {
      if (data?.requestId !== id) return;
      if (data?.status === 'success') {
        setPayResult('success');
        setPayReceipt(data?.mpesaReceiptNumber || null);
      } else {
        setPayResult('failed');
      }
    };
    socket.on('payment_status_update', handlePaymentStatus);
    return () => socket.off('payment_status_update', handlePaymentStatus);
  }, [id]);

  const inputStyle = { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text };

  const accept = async () => {
    const updated = await tryApi(async () => (await api.patch(`/service-requests/${id}/accept`)).data.request, null);
    setRequest((r) => ({ ...r, status: updated?.status ?? 'accepted' }));
  };

  const complete = async () => {
    const updated = await tryApi(async () => (await api.patch(`/service-requests/${id}/complete`)).data.request, null);
    setRequest((r) => ({ ...r, status: updated?.status ?? 'completed' }));
    setShowPayForm(true);
  };

  const onFileChosen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      await tryApi(async () => (await api.post(`/vet/requests/${id}/capture-image`, {
        image: dataUrl,
        type: 'livestock',
        notes: notes || undefined,
      })).data.capture, null);

      setCaptures((prev) => [...prev, { id: `local-${Date.now()}`, url, notes }]);
      setNotes('');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const initiateStkPush = async () => {
    if (!amount || Number(amount) <= 0 || !phone) return;
    setPayLoading(true);
    setPayResult(null);

    const result = await tryApi(
      async () => (await api.post('/mpesa/stk-push', {
        requestId: id, amount: Number(amount), phone: phone,
      })).data.payment,
      { mock: true } // fallback still counts as "sent" for demo purposes
    );

    setPayLoading(false);
    setPayResult(result ? 'sent' : 'error');
  };

  return (
    <VetLayout title={request.id} subtitle="Request detail">
      <button onClick={() => navigate('/vet')} className="flex items-center gap-1.5 text-sm mb-4" style={{ color: c.textMuted }}>
        <ArrowLeft size={14} /> Back to requests
      </button>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="mf-mono text-xs" style={{ color: c.textFaint }}>{request.id}</span>
              <StatusBadge status={request.status} />
            </div>
            <h2 className="mf-display text-lg font-semibold">{request.animalOrCropType} — {request.farmerName}</h2>
            <p className="text-sm mt-2" style={{ color: c.textMuted }}>{request.description}</p>

            <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: c.border }}>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} color={c.textFaint} />
                <span style={{ color: c.textMuted }}>{request.county} · {request.subCounty}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} color={c.textFaint} />
                <span style={{ color: c.textMuted }}>{request.farmerPhone}</span>
              </div>
              <p className="mf-mono text-[11px]" style={{ color: c.textFaint }}>Requested {formatDateTime(request.requestedAt)}</p>
            </div>

            <div className="mt-4 flex gap-2">
              {request.status === 'pending' && <Button variant="teal" className="flex-1" onClick={accept}>Accept request</Button>}
              {(request.status === 'accepted' || request.status === 'in_progress') && request.feeStatus === 'approved' && (
                <Button variant="teal" className="flex-1" onClick={complete}>Mark completed</Button>
              )}
            </div>
          </Card>

          {/* M-Pesa STK push — appears once the service is completed */}
          {request.status === 'completed' && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Banknote size={15} /> Request payment</h3>

              {payResult === 'success' ? (
                <div className="flex items-start gap-2 text-sm rounded-lg px-3 py-2.5" style={{ background: c.tealSoft, color: c.tealText }}>
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>Payment confirmed! {payReceipt && <span className="mf-mono font-bold">Receipt: {payReceipt}</span>}</span>
                </div>
              ) : payResult === 'failed' ? (
                <div className="flex items-start gap-2 text-sm rounded-lg px-3 py-2.5" style={{ background: c.dangerSoft, color: c.danger }}>
                  <span>Payment was not completed by the farmer. You can try sending again.</span>
                  <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => { setPayResult(null); setShowPayForm(true); }}>Retry</Button>
                </div>
              ) : payResult === 'sent' ? (
                <div className="text-center space-y-2 py-2">
                  <Loader2 size={28} className="animate-spin mx-auto" color={c.gold} />
                  <p className="text-sm font-semibold">STK Push Sent</p>
                  <p className="text-xs" style={{ color: c.textMuted }}>Waiting for the farmer to confirm on <strong>{phone}</strong>…</p>
                </div>
              ) : showPayForm ? (
                <div className="space-y-3">
                  <Field label="Farmer phone number" placeholder="e.g. 254..." mono type="text"
                    value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Field label={`Amount to charge ${request.farmerName}`} placeholder="e.g. 1500" mono type="number"
                    value={amount} onChange={(e) => setAmount(e.target.value)} />
                  {payResult === 'error' && (
                    <p className="text-xs" style={{ color: c.danger }}>Couldn't send the STK push — try again.</p>
                  )}
                  <Button variant="primary" className="w-full" disabled={payLoading} onClick={initiateStkPush}>
                    {payLoading ? <Loader2 size={15} className="animate-spin" /> : 'Send M-Pesa prompt'}
                  </Button>
                </div>
              ) : (
                <Button variant="primary" className="w-full" onClick={() => setShowPayForm(true)}>Request payment via M-Pesa</Button>
              )}
            </Card>
          )}

          {/* Image capture */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Camera size={15} /> Capture images</h3>
            <textarea
              rows={2}
              placeholder="Optional notes for this photo…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3"
              style={inputStyle}
            />
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChosen} />
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload size={15} /> Upload photo
            </Button>

            {captures.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {captures.map((cap) => (
                  <div key={cap.id} className="relative rounded-lg overflow-hidden aspect-square" style={{ border: `1px solid ${c.border}` }}>
                    <img src={cap.url} alt="Capture" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2">
          <h3 className="text-sm font-semibold mb-3">Chat with {request.farmerName}</h3>
          <ChatWindow
            requestId={request.id}
            myRole="vet"
            fallbackMessages={id === 'REQ-3402' ? sampleChatMessages : []}
          />
        </div>
      </div>
    </VetLayout>
  );
}
