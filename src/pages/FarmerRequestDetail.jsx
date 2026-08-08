import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Stethoscope, Wallet, CheckCircle2, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';
import { myFarmerRequests, sampleChatMessages, formatDateTime } from '../data/mockData.js';
import { api } from '../lib/api.js';

export default function FarmerRequestDetail() {
  const { c } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const request = myFarmerRequests.find((r) => r.id === id) ?? { ...myFarmerRequests[0], id };
  const [balance, setBalance] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payNotice, setPayNotice] = useState('');

  useEffect(() => {
    api.get('/wallet?limit=1')
      .then(({ data }) => setBalance(data.wallet?.balance ?? 0))
      .catch(() => setBalance(0));
  }, []);

  const payFee = async () => {
    if (request.serviceFee == null) return;
    setPaying(true);
    setPayNotice('');
    try {
      await api.post(`/payments/service-requests/${id}/pay`, { amount: request.serviceFee });
      setPayNotice('Payment successful. Your request is now being processed.');
    } catch (e) {
      setPayNotice(e.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const canPay = request.serviceFee != null && request.feeStatus !== 'paid' && balance >= request.serviceFee;

  return (
    <FarmerLayout title={request.id} subtitle="Request detail">
      <button
        onClick={() => navigate('/farmer/requests')}
        className="flex items-center gap-1.5 text-sm mb-4"
        style={{ color: c.textMuted }}
      >
        <ArrowLeft size={14} /> Back to requests
      </button>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="mf-mono text-xs" style={{ color: c.textFaint }}>{request.id}</span>
              <StatusBadge status={request.status} />
            </div>
            <h2 className="mf-display text-lg font-semibold">{request.animalOrCropType}</h2>
            <p className="text-sm mt-2" style={{ color: c.textMuted }}>{request.description}</p>

            <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: c.border }}>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} color={c.textFaint} />
                <span style={{ color: c.textMuted }}>{request.county} · {request.subCounty}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope size={14} color={c.textFaint} />
                <span style={{ color: c.textMuted }}>{request.vetName ?? 'Awaiting a vet to accept'}</span>
              </div>
              <p className="mf-mono text-[11px]" style={{ color: c.textFaint }}>
                Requested {formatDateTime(request.requestedAt)}
              </p>
            </div>
          </Card>

          {request.serviceFee != null && (
            <Card className="p-5" style={{ border: `1px solid ${c.gold}40` }}>
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} color={c.goldText} />
                <h3 className="text-sm font-semibold">Service fee</h3>
              </div>
              <p className="mf-display text-2xl font-semibold" style={{ color: c.goldText }}>
                KES {request.serviceFee.toLocaleString()}
              </p>
              <p className="text-xs mt-1" style={{ color: c.textMuted }}>
                Status: <span className="capitalize font-medium">{(request.feeStatus || 'pending').replace('_', ' ')}</span>
              </p>
              {canPay && (
                <Button
                  variant="teal"
                  className="mt-3 w-full"
                  onClick={payFee}
                  disabled={paying}
                >
                  {paying ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
                  {paying ? 'Processing…' : `Pay KES ${request.serviceFee.toLocaleString()}`}
                </Button>
              )}
              {payNotice && (
                <p className={`mt-3 text-sm flex gap-2 ${payNotice.includes('successful') ? '' : ''}`} style={{ color: payNotice.includes('successful') ? c.tealText : c.danger }}>
                  <CheckCircle2 size={16} />
                  {payNotice}
                </p>
              )}
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Status</h3>
            <div className="space-y-3">
              {['pending', 'accepted', 'in_progress', 'completed'].map((stage, i) => {
                const stages = ['pending', 'accepted', 'in_progress', 'completed'];
                const currentIdx = stages.indexOf(request.status);
                const reached = i <= currentIdx;
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: reached ? c.gold : c.border }}
                    />
                    <span className="text-sm capitalize" style={{ color: reached ? c.text : c.textFaint }}>
                      {stage.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2">
          <h3 className="text-sm font-semibold mb-3">Chat {request.vetName ? `with ${request.vetName}` : ''}</h3>
          <ChatWindow
            requestId={request.id}
            myRole="farmer"
            fallbackMessages={id === 'REQ-3402' ? sampleChatMessages : []}
          />
        </div>
      </div>
    </FarmerLayout>
  );
}
