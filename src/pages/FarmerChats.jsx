import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Stethoscope, MapPin, MessageCircle, Loader2, Search, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api, tryApi } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { SelectField } from '../components/ui/Field.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import FarmerLayout from '../components/farmer/FarmerLayout.jsx';
import { COUNTIES, formatDateTime } from '../data/mockData.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FarmerChats() {
  const { c } = useTheme();
  const { user } = useSession();

  const [tab, setTab] = useState('conversations'); // 'conversations' | 'find-vet'
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // Find-a-vet tab
  const [county, setCounty] = useState(user?.county || 'Kiambu');
  const [nearbyVets, setNearbyVets] = useState([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [startingId, setStartingId] = useState(null);

  // Load inbox threads from real API
  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    const data = await tryApi(
      async () => (await api.get('/chat/inbox')).data.threads,
      []
    );
    setThreads(data || []);
    setLoadingThreads(false);
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Refresh thread list when a new message comes in (updates lastMessage preview)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMsg = () => loadThreads();
    socket.on('receive_message', onMsg);
    return () => socket.off('receive_message', onMsg);
  }, [loadThreads]);

  // Load nearby vets
  useEffect(() => {
    if (tab !== 'find-vet') return;
    let cancelled = false;
    setLoadingVets(true);
    (async () => {
      const data = await tryApi(
        async () => (await api.get('/vets/nearby', { params: { county } })).data.vets,
        []
      );
      if (!cancelled) { setNearbyVets(data || []); setLoadingVets(false); }
    })();
    return () => { cancelled = true; };
  }, [tab, county]);

  const openChatWith = async (vet) => {
    // Check if there's already a thread with this vet
    const existing = threads.find((t) => t.vetId === vet.id);
    if (existing) {
      setSelectedId(existing.requestId);
      setTab('conversations');
      return;
    }

    setStartingId(vet.id);
    const created = await tryApi(
      async () => (await api.post('/service-requests', {
        county, subCounty: vet.subCounty || COUNTIES[county]?.[0] || county,
        description: 'General inquiry', animalOrCropType: 'General', vetId: vet.id,
      })).data.request,
      null
    );

    setStartingId(null);
    if (created) {
      await loadThreads();
      setSelectedId(created.id);
      setTab('conversations');
    }
  };

  const selected = threads.find((t) => t.requestId === selectedId);

  return (
    <FarmerLayout title="Chat with Vets" subtitle="Message vets on your requests, or find a new vet near you.">
      {/* Tabs */}
      <div className="flex rounded-xl p-1 max-w-xs mb-5" style={{ background: c.bgElevated }}>
        {[['conversations', 'Conversations'], ['find-vet', 'Find a Vet']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSelectedId(null); }}
            className="flex-1 text-sm font-semibold py-1.5 rounded-lg transition-colors"
            style={tab === id
              ? { background: c.surface, color: c.text, border: `1px solid ${c.border}` }
              : { color: c.textMuted }}
          >
            {label}
            {id === 'conversations' && threads.length > 0 && (
              <span
                className="ml-1.5 text-[10px] font-bold rounded-full px-1.5 py-0.5"
                style={{ background: c.goldSoft, color: c.gold }}
              >
                {threads.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conversations tab */}
      {tab === 'conversations' && (
        <div className="grid md:grid-cols-[minmax(0,300px)_1fr] gap-4 items-start">
          {/* Thread list */}
          <Card className={`overflow-hidden ${selected ? 'hidden md:block' : 'block'}`}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: c.border }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.textFaint }}>
                Conversations
              </span>
              <button
                onClick={loadThreads}
                disabled={loadingThreads}
                className="w-6 h-6 flex items-center justify-center rounded hover:opacity-70 transition-opacity"
                style={{ color: c.textMuted }}
              >
                <RefreshCw size={12} className={loadingThreads ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: c.border }}>
              {loadingThreads ? (
                <div className="flex items-center justify-center gap-2 py-12" style={{ color: c.textFaint }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageCircle size={24} className="mx-auto mb-2" style={{ color: c.textFaint }} />
                  <p className="text-sm mb-3" style={{ color: c.textFaint }}>No conversations yet.</p>
                  <Button variant="primary" className="!text-xs !py-1.5" onClick={() => setTab('find-vet')}>
                    Find a vet
                  </Button>
                </div>
              ) : (
                threads.map((t) => (
                  <button
                    key={t.requestId}
                    onClick={() => {
                      setSelectedId(t.requestId);
                      if (t.unreadCount > 0) {
                        api.patch(`/chat/${t.requestId}/read`).catch(() => {});
                        setThreads((prev) => prev.map((item) => item.requestId === t.requestId ? { ...item, unreadCount: 0 } : item));
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:opacity-80 relative"
                    style={{
                      background: t.requestId === selectedId ? c.bgElevated : 'transparent',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative"
                      style={{ background: c.goldSoft }}
                    >
                      <Stethoscope size={16} style={{ color: c.gold }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm truncate ${t.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
                          {t.vetName || 'Vet'}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {t.unreadCount > 0 && (
                            <span
                              className="text-[10px] font-bold rounded-full px-1.5 py-0.2 min-w-[18px] text-center"
                              style={{ background: '#ef4444', color: '#ffffff' }}
                            >
                              {t.unreadCount}
                            </span>
                          )}
                          <span className="text-[10px] mf-mono" style={{ color: c.textFaint }}>
                            {timeAgo(t.lastSentAt)}
                          </span>
                        </div>
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${t.unreadCount > 0 ? 'font-medium' : ''}`} style={{ color: t.unreadCount > 0 ? c.text : c.textMuted }}>
                        {t.lastMessage
                          ? (t.lastSenderRole === 'farmer' ? 'You: ' : '') + t.lastMessage
                          : `${t.animalOrCropType} · ${t.county}`}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Chat window */}
          <div className={selected ? 'block' : 'hidden md:block'}>
            {selected ? (
              <>
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden flex items-center gap-1.5 text-sm mb-3"
                  style={{ color: c.textMuted }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <ChatWindow
                  requestId={selected.requestId}
                  myRole="farmer"
                  title={`Dr. ${selected.vetName || 'Vet'} — ${selected.animalOrCropType || 'Request'}`}
                  heightClass="h-[calc(100vh-300px)] md:h-[580px]"
                />
              </>
            ) : (
              <Card className="p-10 text-center hidden md:flex flex-col items-center justify-center h-[580px]">
                <MessageCircle size={28} className="mb-3" style={{ color: c.textFaint }} />
                <p style={{ color: c.textFaint }}>Select a conversation to view messages.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Find a vet tab */}
      {tab === 'find-vet' && (
        <div>
          <div className="max-w-xs mb-4">
            <SelectField label="County" value={county} onChange={setCounty} options={Object.keys(COUNTIES)} />
          </div>

          {loadingVets ? (
            <div className="flex items-center gap-2 py-16 justify-center" style={{ color: c.textFaint }}>
              <Loader2 size={16} className="animate-spin" /> Finding vets near you…
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {nearbyVets.map((v) => (
                <Card key={v.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: c.tealSoft }}
                    >
                      <Stethoscope size={16} style={{ color: c.teal }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{v.fullName}</div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: c.textFaint }}>
                        <MapPin size={11} /> {v.subCounty || county}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="teal"
                    className="!px-3 !py-2 text-xs shrink-0"
                    disabled={startingId === v.id}
                    onClick={() => openChatWith(v)}
                  >
                    {startingId === v.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <><MessageCircle size={14} /> Chat</>}
                  </Button>
                </Card>
              ))}
              {nearbyVets.length === 0 && (
                <Card className="p-10 text-center sm:col-span-2">
                  <Search size={22} className="mx-auto mb-2" style={{ color: c.textFaint }} />
                  <p style={{ color: c.textFaint }}>No approved vets found in {county} yet.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </FarmerLayout>
  );
}
