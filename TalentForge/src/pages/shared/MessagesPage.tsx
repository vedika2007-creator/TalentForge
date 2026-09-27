import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, Send } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, PageHeader, StatusPill } from '../../components/common/workspace';
import { ChatMessage } from '../../types';
import { formatDateTime, queryParam, timeAgo } from '../../lib/format';

const THREAD_POLL_MS = 8000;

export const MessagesPage: React.FC = () => {
  const { user, refreshNotifications } = useWorkspace();
  const convos = useApi(() => talentforgeApi.getConversations(), [user.id]);
  const [activeId, setActiveId] = useState<string | null>(queryParam('app'));
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Desktop: open the most recent conversation by default.
  useEffect(() => {
    if (!activeId && convos.data?.length && window.matchMedia('(min-width: 1024px)').matches) setActiveId(convos.data[0].applicationId);
  }, [convos.data, activeId]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    const load = () =>
      talentforgeApi
        .getMessages(activeId)
        .then((m) => {
          if (cancelled) return;
          setMessages(m);
          setError(null);
        })
        .catch((e: Error) => !cancelled && setError(e.message));
    setMessages(null);
    load().then(() => {
      convos.reload();
      refreshNotifications();
    });
    const t = setInterval(load, THREAD_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length]);

  const active = convos.data?.find((c) => c.applicationId === activeId);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      setMessages(await talentforgeApi.sendMessage(activeId, draft.trim()));
      setDraft('');
      convos.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const who = user.role === 'student' ? 'recruiters' : 'candidates';

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle={`Conversations with ${who}. A conversation opens when a candidate is shortlisted for a job.`}
      />
      {convos.error && <ErrorState message={convos.error} onRetry={convos.reload} />}
      {convos.loading && !convos.data && <LoadingState />}
      {convos.data?.length === 0 && (
        <EmptyState
          title="No conversations yet"
          hint={user.role === 'student' ? 'When a recruiter shortlists you, you can message them here.' : 'Shortlist an applicant to start a conversation.'}
        />
      )}

      {!!convos.data?.length && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-[300px_1fr] h-[calc(100vh-220px)] min-h-[480px]">
          {/* Conversation list */}
          <div className={`border-r border-slate-200 overflow-y-auto ${activeId ? 'hidden lg:block' : ''}`}>
            {convos.data.map((c) => (
              <button
                key={c.applicationId}
                onClick={() => setActiveId(c.applicationId)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 flex gap-3 hover:bg-slate-50 ${
                  c.applicationId === activeId ? 'bg-blue-50/60' : ''
                }`}
              >
                <Avatar src={c.other.avatar} name={c.other.name} className="w-10 h-10 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${c.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{c.other.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(c.lastAt)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {c.jobTitle}
                    {c.company && ` · ${c.company}`}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-xs truncate ${c.unread ? 'text-slate-900' : 'text-slate-400'}`}>{c.lastMessage || 'No messages yet'}</p>
                    {c.unread > 0 && <span className="text-[10px] font-bold text-white bg-blue-600 rounded-full px-1.5 shrink-0">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Thread */}
          <div className={`flex flex-col min-h-0 ${activeId ? '' : 'hidden lg:flex'}`}>
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">Select a conversation</div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                  <button onClick={() => setActiveId(null)} className="lg:hidden p-1 -ml-1 text-slate-500" aria-label="Back to conversations">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <Avatar src={active.other.avatar} name={active.other.name} className="w-9 h-9 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{active.other.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {active.jobTitle}
                      {active.company && ` · ${active.company}`}
                    </p>
                  </div>
                  <StatusPill status={active.status} />
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/60">
                  {!messages && <LoadingState />}
                  {messages?.length === 0 && <p className="text-center text-xs text-slate-400 py-8">Say hello 👋</p>}
                  {messages?.map((m) => (
                    <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                          m.mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`text-[10px] mt-1 ${m.mine ? 'text-blue-100' : 'text-slate-400'}`}>{formatDateTime(m.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {active.canMessage ? (
                  <form onSubmit={send} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a message…"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600"
                    />
                    <Button type="submit" busy={sending} disabled={!draft.trim()} aria-label="Send">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <p className="p-3 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2 bg-white">
                    <Lock className="w-3.5 h-3.5" /> This conversation is closed because the application is {active.status}.
                  </p>
                )}
                {error && <p className="px-3 pb-3 text-xs text-rose-600 bg-white">{error}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
