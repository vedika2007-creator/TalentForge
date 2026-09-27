import React, { useState } from 'react';
import { Check, Clock, Inbox, Plus, Send, UserCheck, Users, X } from 'lucide-react';
import { talentforgeApi } from '../services/api';
import { useApi } from '../hooks/useApi';
import { timeAgo } from '../lib/format';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../components/common/ui';
import { Button, Field, FormError, Modal, PageHeader, Select, SkillChip, StatusPill, Tabs, TextArea, TextInput } from '../components/common/workspace';
import { AuthUser, CollabJoinRequest, CollaborationPost } from '../types';

const DOMAINS = ['AI & Machine Learning', 'Cloud & Systems', 'Web & Mobile', 'Robotics & IoT', 'Healthcare AI', 'CleanTech & IoT'];

/**
 * Collaboration hub. Joining a team is a request: the team creator reviews it and
 * accepts or declines — nobody is added to a team without the creator's permission.
 */
export const CollaboratePage: React.FC<{
  user: AuthUser | null;
  onNavigate: (path: string) => void;
  onOpenAuth: (role?: string) => void;
}> = ({ user }) => {
  const postsApi = useApi(() => talentforgeApi.getCollaborationPosts(), [user?.id]);
  const posts = postsApi.data || [];
  const [tab, setTab] = useState('explore');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Join-request dialog
  const [joining, setJoining] = useState<CollaborationPost | null>(null);
  const [joinMessage, setJoinMessage] = useState('');

  // Creator: manage requests dialog
  const [managing, setManaging] = useState<CollaborationPost | null>(null);
  const [requests, setRequests] = useState<CollabJoinRequest[] | null>(null);

  // Create dialog
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', domain: DOMAINS[0], description: '', lookingFor: '', maxMembers: '4' });

  const replace = (updated: CollaborationPost) => postsApi.setData(posts.map((p) => (p.id === updated.id ? updated : p)));

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const sendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joining) return;
    run(joining.id, async () => {
      replace(await talentforgeApi.requestToJoinCollaboration(joining.id, joinMessage.trim() || undefined));
      setJoining(null);
    });
  };

  const withdraw = (p: CollaborationPost) =>
    run(p.id, async () => replace(await talentforgeApi.withdrawCollaborationRequest(p.id)));

  const openRequests = (p: CollaborationPost) => {
    setManaging(p);
    setRequests(null);
    talentforgeApi.getCollaborationRequests(p.id).then(setRequests).catch((e) => setError(e.message));
  };

  const decide = (r: CollabJoinRequest, accept: boolean) =>
    run(r.id, async () => {
      setRequests(await talentforgeApi.decideCollaborationRequest(r.id, accept));
      await postsApi.reload(); // member counts and pending badges change
    });

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    run('create', async () => {
      const created = await talentforgeApi.createCollaborationPost({
        title: form.title,
        domain: form.domain,
        description: form.description,
        maxMembers: Math.max(2, Number(form.maxMembers) || 4),
        lookingFor: form.lookingFor.split(',').map((s) => s.trim()).filter(Boolean),
        tags: [form.domain],
      });
      postsApi.setData([created, ...posts]);
      setCreating(false);
      setForm({ title: '', domain: DOMAINS[0], description: '', lookingFor: '', maxMembers: '4' });
    });
  };

  const mine = posts.filter((p) => p.isOwner || p.isMember);
  const requested = posts.filter((p) => !p.isMember && p.myRequestStatus);
  const pendingForMe = posts.reduce((n, p) => n + (p.pendingRequests || 0), 0);
  const list = tab === 'mine' ? mine : tab === 'requests' ? requested : posts;

  const action = (p: CollaborationPost) => {
    const busy = busyId === p.id;
    if (p.isOwner) {
      return (
        <Button size="sm" variant={p.pendingRequests ? 'primary' : 'secondary'} onClick={() => openRequests(p)}>
          <Inbox className="w-3.5 h-3.5" /> Join requests
          {!!p.pendingRequests && <span className="ml-1 bg-white/25 rounded-full px-1.5">{p.pendingRequests}</span>}
        </Button>
      );
    }
    if (p.isMember) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-3.5 h-3.5" /> Member
        </span>
      );
    }
    if (p.myRequestStatus === 'pending') {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock className="w-3.5 h-3.5" /> Awaiting approval
          </span>
          <Button size="sm" variant="ghost" busy={busy} onClick={() => withdraw(p)}>
            Withdraw
          </Button>
        </div>
      );
    }
    if (p.currentMembers >= p.maxMembers) {
      return <span className="text-xs font-semibold text-slate-400">Team full</span>;
    }
    return (
      <Button
        size="sm"
        busy={busy}
        onClick={() => {
          setJoining(p);
          setJoinMessage('');
          setError(null);
        }}
      >
        <Send className="w-3.5 h-3.5" /> {p.myRequestStatus === 'declined' ? 'Request again' : 'Request to join'}
      </Button>
    );
  };

  return (
    <div>
      <PageHeader
        title="Collaborate & Build Teams"
        subtitle="Find teammates for hackathons and capstones. Joining a team needs the creator's approval — send a request and they'll accept or decline."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> Post a team
          </Button>
        }
      />

      <div className="mb-5">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'explore', label: 'Explore teams', count: posts.length },
            { key: 'mine', label: pendingForMe ? `My teams · ${pendingForMe} new` : 'My teams', count: mine.length },
            { key: 'requests', label: 'My requests', count: requested.length },
          ]}
        />
      </div>

      {error && !joining && !managing && !creating && <div className="mb-4"><FormError message={error} /></div>}
      {postsApi.loading && !postsApi.data && <LoadingState />}
      {postsApi.error && <ErrorState message={postsApi.error} onRetry={postsApi.reload} />}
      {postsApi.data && list.length === 0 && (
        <EmptyState
          title={tab === 'mine' ? 'You are not in any team yet' : tab === 'requests' ? 'No join requests sent' : 'No teams yet'}
          hint={tab === 'explore' ? 'Post the first team idea.' : undefined}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-3 hover:border-teal-300 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full truncate">{p.domain}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 shrink-0">
                <Users className="w-3 h-3" /> {p.currentMembers}/{p.maxMembers}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mt-1">{p.description}</p>
            </div>

            {p.lookingFor.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Looking for</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.lookingFor.map((role) => <SkillChip key={role} name={role} />)}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 mt-auto">
              <Avatar src={p.creatorAvatar} name={p.creatorName} className="w-7 h-7 rounded-full" textClass="text-[9px]" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-800 truncate">
                  {p.creatorName}
                  {p.isOwner && <span className="ml-1.5 text-teal-700">(you)</span>}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {p.creatorCollege} · {timeAgo(p.postedDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              {p.myRequestStatus === 'declined' && !p.isMember ? <StatusPill status="rejected" label="Declined" /> : <span />}
              {action(p)}
            </div>
          </div>
        ))}
      </div>

      {/* Request to join */}
      <Modal
        open={!!joining}
        title={`Request to join: ${joining?.title ?? ''}`}
        subtitle={`${joining?.creatorName ?? 'The creator'} will review your request and accept or decline it.`}
        onClose={() => setJoining(null)}
      >
        <form onSubmit={sendRequest} className="space-y-3">
          <Field label="Message to the team creator" hint="Say which role you'd take and what you'd bring.">
            <TextArea rows={4} value={joinMessage} onChange={(e) => setJoinMessage(e.target.value)} placeholder="I can build the FastAPI backend and set up CI…" />
          </Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setJoining(null)}>Cancel</Button>
            <Button type="submit" busy={!!busyId}>
              <Send className="w-3.5 h-3.5" /> Send request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Creator: review join requests */}
      <Modal
        open={!!managing}
        title="Join requests"
        subtitle={managing ? `${managing.title} · ${posts.find((x) => x.id === managing.id)?.currentMembers ?? managing.currentMembers}/${managing.maxMembers} members` : ''}
        onClose={() => setManaging(null)}
        wide
      >
        <FormError message={error} />
        {!requests && <LoadingState />}
        {requests?.length === 0 && <EmptyState title="No requests yet" hint="When someone asks to join, they'll appear here and you'll get a notification." />}
        <div className="space-y-3">
          {requests?.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar src={r.user.avatar} name={r.user.name} className="w-10 h-10 rounded-xl" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{r.user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {[r.user.headline, r.user.college].filter(Boolean).join(' · ')} · {timeAgo(r.createdAt)}
                    </p>
                    {r.user.verifiedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.user.verifiedSkills.slice(0, 5).map((s) => <SkillChip key={s} name={s} verified />)}
                      </div>
                    )}
                  </div>
                </div>
                <StatusPill
                  status={r.status === 'accepted' ? 'verified' : r.status === 'declined' ? 'rejected' : 'pending'}
                  label={r.status === 'accepted' ? 'Accepted' : r.status === 'declined' ? 'Declined' : 'Pending'}
                />
              </div>
              {r.message && <p className="text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2 mt-3 italic">“{r.message}”</p>}
              {r.status === 'pending' && (
                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" variant="danger" busy={busyId === r.id} onClick={() => decide(r, false)}>
                    <X className="w-3.5 h-3.5" /> Decline
                  </Button>
                  <Button size="sm" variant="success" busy={busyId === r.id} onClick={() => decide(r, true)}>
                    <UserCheck className="w-3.5 h-3.5" /> Accept
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Create team */}
      <Modal open={creating} title="Post a team" subtitle="Others can request to join; you decide who gets in." onClose={() => setCreating(false)}>
        <form onSubmit={create} className="space-y-3">
          <Field label="Project title">
            <TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Real-time drone mesh network" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Domain">
              <Select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}>
                {DOMAINS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Team size (incl. you)">
              <TextInput type="number" min={2} max={20} value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value })} />
            </Field>
          </div>
          <Field label="Description">
            <TextArea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will the team build?" />
          </Field>
          <Field label="Roles needed" hint="Comma-separated">
            <TextInput required value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })} placeholder="Embedded developer, React lead" />
          </Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button type="submit" busy={busyId === 'create'}>Publish team</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
