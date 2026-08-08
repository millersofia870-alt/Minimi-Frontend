import React, { useState, useRef, useEffect } from 'react';
import { Send, WifiOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { api, tryApi } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import { formatDateTime } from '../data/mockData.js';

/**
 * Live chat over the backend's Socket.io server (src/sockets/index.ts):
 * join_request_room -> send_message -> receive_message, with typing_indicator.
 * Falls back to `fallbackMessages` (mock data) if there's no `requestId`
 * (e.g. previewing the UI without a real backend/request yet) or if the
 * initial history fetch fails, so the component still renders something
 * useful standalone.
 */
export default function ChatWindow({ requestId, myRole, fallbackMessages = [], title, heightClass = 'h-[420px]' }) {
  const { c } = useTheme();
  const { accessToken } = useSession();
  const [messages, setMessages] = useState(fallbackMessages);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const endRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  // Load history + wire socket events for this request's room.
  useEffect(() => {
    if (!requestId || !accessToken) return;

    let cancelled = false;

    (async () => {
      const history = await tryApi(
        async () => (await api.get(`/chat/${requestId}/messages`)).data.messages,
        null
      );
      if (!cancelled && history) setMessages(history);
    })();

    const socket = getSocket();
    if (!socket) return;

    setConnected(socket.connected);
    socket.emit('join_request_room', { requestId });

    const onConnect = () => { setConnected(true); socket.emit('join_request_room', { requestId }); };
    const onDisconnect = () => setConnected(false);
    const onReceive = (msg) => {
      if (msg.requestId !== requestId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };
    const onTyping = ({ requestId: rid, senderRole }) => {
      if (rid !== requestId || senderRole === myRole) return;
      setOtherTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setOtherTyping(false), 2000);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceive);
    socket.on('typing_indicator', onTyping);

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceive);
      socket.off('typing_indicator', onTyping);
    };
  }, [requestId, accessToken, myRole]);

  const send = () => {
    if (!draft.trim()) return;

    const socket = getSocket();
    if (requestId && socket) {
      socket.emit('send_message', { requestId, message: draft.trim() });
    } else {
      // Offline/demo fallback: show it locally so the UI still feels alive.
      setMessages((prev) => [...prev, {
        id: `local-${Date.now()}`, senderRole: myRole, message: draft.trim(), sentAt: new Date().toISOString(),
      }]);
    }
    setDraft('');
  };

  const onDraftChange = (e) => {
    setDraft(e.target.value);
    const socket = getSocket();
    if (requestId && socket?.connected) socket.emit('typing', { requestId });
  };

  return (
    <div className={`rounded-2xl flex flex-col ${heightClass}`} style={{ background: c.surface, border: `1px solid ${c.border}` }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: c.border }}>
        <span className="text-xs font-semibold truncate" style={{ color: c.textMuted }}>
          {otherTyping ? 'Typing…' : (title || 'Conversation')}
        </span>
        {requestId && (
          <span className="flex items-center gap-1.5 mf-mono text-[10px] uppercase" style={{ color: connected ? c.teal : c.textFaint }}>
            {!connected && <WifiOff size={11} />}
            {connected ? 'Live' : 'Offline'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-center mt-10" style={{ color: c.textFaint }}>No messages yet — say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderRole === myRole;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%]">
                <div
                  className="rounded-2xl px-3.5 py-2 text-sm break-words"
                  style={mine
                    ? { background: myRole === 'vet' ? c.teal : c.gold, color: '#0c0f0a' }
                    : { background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
                >
                  {m.message}
                </div>
                <div className={`mf-mono text-[10px] mt-1 ${mine ? 'text-right' : ''}`} style={{ color: c.textFaint }}>
                  {formatDateTime(m.sentAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 p-3 border-t" style={{ borderColor: c.border }}>
        <input
          value={draft}
          onChange={onDraftChange}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-lg px-3.5 py-2.5 text-sm outline-none min-w-0"
          style={{ background: c.bgElevated, border: `1px solid ${c.border}`, color: c.text }}
        />
        <button onClick={send} className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: myRole === 'vet' ? c.teal : c.gold, color: '#0c0f0a' }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
