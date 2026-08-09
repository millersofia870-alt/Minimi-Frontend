import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, User, MessageCircle, Loader2, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api, tryApi } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import Card from '../components/ui/Card.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import VetLayout from '../components/vet/VetLayout.jsx';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function VetChats() {
  const { c } = useTheme();
  const { user } = useSession();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [threadPage, setThreadPage] = useState(1);
  const [threadPagination, setThreadPagination] = useState({ page: 1, totalPages: 1, hasNext: false });

  const loadThreads = useCallback(async (page = 1, reset = true) => {
    setLoading(true);
    const data = await tryApi(
      async () => (await api.get('/chat/inbox', { params: { page, limit: 8 } })).data,
      { threads: [], pagination: { page: 1, totalPages: 1, hasNext: false } }
    );
    const newThreads = data.threads || [];
    setThreads((prev) => reset ? newThreads : [...prev, ...newThreads]);
    setThreadPagination(data.pagination || { page: 1, totalPages: 1, hasNext: false });
    setThreadPage(page);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadThreads(1, true);
  }, [loadThreads]);

  // Live refresh thread list when a new message arrives
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMsg = () => loadThreads(1, true);
    socket.on('receive_message', onMsg);
    return () => socket.off('receive_message', onMsg);
  }, [loadThreads]);

  const selected = threads.find((t) => t.requestId === selectedId);

  const handleThreadScroll = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60 && threadPagination.hasNext && !loading) {
      loadThreads(threadPage + 1, false);
    }
  }, [threadPagination, threadPage, loading, loadThreads]);

  return (
    <VetLayout title="Messages" subtitle="Conversations with farmers across your active requests.">
      <div className="grid md:grid-cols-[minmax(0,300px)_1fr] gap-4 items-start">
        {/* Thread list */}
        <Card className={`overflow-hidden ${selected ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: c.border }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.textFaint }}>
              Farmer Messages
            </span>
            <button
              onClick={loadThreads}
              disabled={loading}
              className="w-6 h-6 flex items-center justify-center rounded hover:opacity-70 transition-opacity"
              style={{ color: c.textMuted }}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="divide-y overflow-y-auto max-h-[60vh]" style={{ borderColor: c.border }} onScroll={handleThreadScroll}>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12" style={{ color: c.textFaint }}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageCircle size={24} className="mx-auto mb-2" style={{ color: c.textFaint }} />
                <p className="text-sm" style={{ color: c.textFaint }}>
                  No conversations yet. Accept a service request to start chatting.
                </p>
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
                  className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:opacity-80"
                  style={{
                    background: t.requestId === selectedId ? c.bgElevated : 'transparent',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative"
                    style={{ background: c.tealSoft }}
                  >
                    <User size={16} style={{ color: c.teal }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm truncate ${t.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
                        {t.farmerName || 'Farmer'}
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs truncate flex-1 ${t.unreadCount > 0 ? 'font-medium' : ''}`} style={{ color: t.unreadCount > 0 ? c.text : c.textMuted }}>
                        {t.lastMessage
                          ? (t.lastSenderRole === 'vet' ? 'You: ' : '') + t.lastMessage
                          : `${t.animalOrCropType || 'Request'} · ${t.county}`}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                  </button>
                ))
              )}
              {loading && threadPage > 1 && (
                <div className="flex items-center justify-center gap-2 py-3" style={{ color: c.textFaint }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Loading more…</span>
                </div>
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
                myRole="vet"
                title={`${selected.farmerName || 'Farmer'} — ${selected.animalOrCropType || 'Request'} (${selected.county})`}
                heightClass="h-[calc(100vh-260px)] md:h-[580px]"
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
    </VetLayout>
  );
}
