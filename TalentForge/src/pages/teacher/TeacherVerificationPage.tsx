import React, { useState } from 'react';
import { AlertCircle, Award, Check, ExternalLink, FileText, FolderGit2, Github, Search, Sparkles, UserRound, X } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, PageHeader, StatTile, StatusPill, Tabs, TextArea, TextInput } from '../../components/common/workspace';
import { VerificationRequest } from '../../types';
import { timeAgo } from '../../lib/format';
import confetti from 'canvas-confetti';

const TYPE_META: Record<VerificationRequest['type'], { label: string; icon: React.ElementType; tone: string }> = {
  project: { label: 'Project', icon: FolderGit2, tone: 'text-blue-700 bg-blue-50' },
  certificate: { label: 'Certificate', icon: Award, tone: 'text-amber-700 bg-amber-50' },
  skill_assessment: { label: 'Skill evidence', icon: Sparkles, tone: 'text-purple-700 bg-purple-50' },
};

const STATUS_LABEL: Record<string, string> = { approved: 'Accepted', rejected: 'Declined', changes_requested: 'Changes requested', pending: 'Awaiting review' };

const EvidenceLink: React.FC<{ href: string; icon: React.ElementType; label: string }> = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:border-purple-300 hover:text-purple-700 rounded-lg"
  >
    <Icon className="w-3.5 h-3.5" /> {label} <ExternalLink className="w-3 h-3 text-slate-400" />
  </a>
);

/**
 * Faculty review queue. `types` limits it to certain evidence kinds
 * (the "Certificate & Evidence Review" page shows only certificates and skill evidence).
 */
export const TeacherVerificationPage: React.FC<{ types?: VerificationRequest['type'][]; title: string; subtitle: string }> = ({
  types,
  title,
  subtitle,
}) => {
  const { user, navigate, refreshNotifications } = useWorkspace();
  const queue = useApi(() => talentforgeApi.getVerificationRequests(), [user.id]);
  const [status, setStatus] = useState('pending');
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reopened, setReopened] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const scoped = (queue.data || []).filter((r) => !types || types.includes(r.type));
  const count = (s: string) => scoped.filter((r) => r.status === s).length;
  const q = query.trim().toLowerCase();
  const list = scoped.filter(
    (r) => (status === 'all' || r.status === status) && (!q || r.studentName.toLowerCase().includes(q) || r.skillOrProjectTitle.toLowerCase().includes(q))
  );

  const review = async (r: VerificationRequest, decision: 'approved' | 'rejected' | 'changes_requested') => {
    const note = notes[r.id]?.trim();
    if (decision !== 'approved' && !note) {
      setMessage({ ok: false, text: `Add a note explaining why before you ${decision === 'rejected' ? 'decline' : 'request changes'}.` });
      return;
    }
    setBusyId(r.id);
    setMessage(null);
    try {
      const updated = await talentforgeApi.updateVerificationStatus(r.id, decision, note || undefined);
      queue.setData((queue.data || []).map((x) => (x.id === r.id ? updated : x)));
      setReopened((ids) => ids.filter((x) => x !== r.id));
      setNotes((n) => ({ ...n, [r.id]: '' }));
      refreshNotifications();
      setMessage({ ok: true, text: `${STATUS_LABEL[decision]}: ${r.skillOrProjectTitle} (${r.studentName}). The student has been notified.` });
      if (decision === 'approved') {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore
        }
      }
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Faculty workspace" title={title} subtitle={subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatTile label="Awaiting review" value={count('pending')} tone="text-amber-600" onClick={() => setStatus('pending')} />
        <StatTile label="Accepted" value={count('approved')} tone="text-emerald-600" onClick={() => setStatus('approved')} />
        <StatTile label="Declined" value={count('rejected')} tone="text-rose-600" onClick={() => setStatus('rejected')} />
        <StatTile label="Changes requested" value={count('changes_requested')} onClick={() => setStatus('changes_requested')} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs
          active={status}
          onChange={setStatus}
          tabs={[
            { key: 'pending', label: 'Pending', count: count('pending') },
            { key: 'approved', label: 'Accepted', count: count('approved') },
            { key: 'rejected', label: 'Declined', count: count('rejected') },
            { key: 'changes_requested', label: 'Changes', count: count('changes_requested') },
            { key: 'all', label: 'All', count: scoped.length },
          ]}
        />
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student or submission" className="pl-9" />
        </div>
      </div>

      {message && (
        <div className={`mb-4 text-sm rounded-xl px-4 py-3 border ${message.ok ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-rose-800 bg-rose-50 border-rose-200'}`}>
          {message.text}
        </div>
      )}
      {queue.loading && !queue.data && <LoadingState />}
      {queue.error && <ErrorState message={queue.error} onRetry={queue.reload} />}
      {queue.data && list.length === 0 && <EmptyState title="Nothing to review here" hint={status === 'pending' ? 'All caught up — new submissions will notify you.' : undefined} />}

      <div className="space-y-3">
        {list.map((r) => {
          const meta = TYPE_META[r.type];
          const Icon = meta.icon;
          const reviewing = r.status === 'pending' || reopened.includes(r.id);
          const ev = r.submittedEvidence;
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <Avatar src={r.studentAvatar} name={r.studentName} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{r.studentName}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${meta.tone}`}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 mt-0.5">{r.skillOrProjectTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      {r.studentDepartment && `${r.studentDepartment} · `}submitted {timeAgo(r.submittedAt).toLowerCase()}
                    </p>
                  </div>
                </div>
                <StatusPill status={r.status === 'rejected' ? 'rejected' : r.status} label={STATUS_LABEL[r.status]} />
              </div>

              <div className="flex flex-wrap gap-2">
                {ev.githubRepo && <EvidenceLink href={ev.githubRepo} icon={Github} label="Repository / proof" />}
                {ev.demoUrl && <EvidenceLink href={ev.demoUrl} icon={ExternalLink} label={r.type === 'certificate' ? 'Credential' : 'Demo'} />}
                {ev.projectReportUrl && <EvidenceLink href={ev.projectReportUrl} icon={FileText} label="Report" />}
                {ev.certificateIssuer && <span className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5">Issuer: {ev.certificateIssuer}</span>}
                {ev.assessmentScore != null && <span className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5">Score: {ev.assessmentScore}%</span>}
                <button onClick={() => navigate(`/profile/${r.studentId}`)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50 rounded-lg">
                  <UserRound className="w-3.5 h-3.5" /> Student profile
                </button>
              </div>

              {r.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                  <strong>{r.status === 'pending' ? 'Student note' : `Review${r.reviewerName ? ` by ${r.reviewerName}` : ''}`}:</strong> {r.notes}
                </p>
              )}

              {reviewing ? (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <TextArea
                    rows={2}
                    value={notes[r.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    placeholder="Note for the student (required to decline or request changes)"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    {reopened.includes(r.id) && (
                      <Button size="sm" variant="ghost" className="mr-auto" onClick={() => setReopened(reopened.filter((x) => x !== r.id))}>
                        Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" busy={busyId === r.id} onClick={() => review(r, 'changes_requested')}>
                      <AlertCircle className="w-3.5 h-3.5" /> Request changes
                    </Button>
                    <Button size="sm" variant="danger" busy={busyId === r.id} onClick={() => review(r, 'rejected')}>
                      <X className="w-3.5 h-3.5" /> Decline
                    </Button>
                    <Button size="sm" variant="success" busy={busyId === r.id} onClick={() => review(r, 'approved')}>
                      <Check className="w-3.5 h-3.5" /> Accept & verify
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                  <span>{r.reviewedAt && `Reviewed ${timeAgo(r.reviewedAt).toLowerCase()}`}</span>
                  <button onClick={() => setReopened([...reopened, r.id])} className="font-semibold text-purple-700 hover:underline">
                    Change decision
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
