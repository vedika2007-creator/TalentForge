import React, { useState } from 'react';
import { CalendarClock, Check, MessageSquare, Video } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, MatchBadge, PageHeader, StatusPill, Tabs } from '../../components/common/workspace';
import { Application, ApplicationStatus } from '../../types';
import { formatDateTime, joinParts, timeAgo } from '../../lib/format';

const STAGES: { key: ApplicationStatus; label: string }[] = [
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'selected', label: 'Selected' },
];

export const PipelineStepper: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const closed = status === 'rejected' || status === 'withdrawn';
  const reached = STAGES.findIndex((s) => s.key === status);
  return (
    <ol className="flex items-center gap-1 sm:gap-2 w-full">
      {STAGES.map((s, i) => {
        const done = !closed && i <= reached;
        return (
          <li key={s.key} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {done ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span className={`text-[11px] truncate ${done ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>{s.label}</span>
            {i < STAGES.length - 1 && <span className={`hidden sm:block flex-1 h-px ${done && i < reached ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
};

export const StudentApplicationsPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const apps = useApi(() => talentforgeApi.getMyApplications(), [user.id]);
  const [tab, setTab] = useState('active');
  const [busyId, setBusyId] = useState<string | null>(null);

  const all = apps.data || [];
  const groups: Record<string, Application[]> = {
    active: all.filter((a) => ['applied', 'shortlisted', 'interview'].includes(a.status)),
    selected: all.filter((a) => a.status === 'selected'),
    closed: all.filter((a) => a.status === 'rejected' || a.status === 'withdrawn'),
  };

  const withdraw = async (a: Application) => {
    if (!confirm(`Withdraw your application to ${a.job.title}?`)) return;
    setBusyId(a.id);
    try {
      const updated = await talentforgeApi.withdrawApplication(a.id);
      apps.setData(all.map((x) => (x.id === a.id ? updated : x)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Track every application from submission to offer. Messaging opens once a recruiter shortlists you."
        actions={<Button variant="secondary" onClick={() => navigate('/student/opportunities')}>Find more roles</Button>}
      />
      <div className="mb-5">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'active', label: 'In progress', count: groups.active.length },
            { key: 'selected', label: 'Offers', count: groups.selected.length },
            { key: 'closed', label: 'Closed', count: groups.closed.length },
          ]}
        />
      </div>

      {apps.loading && !apps.data && <LoadingState />}
      {apps.error && <ErrorState message={apps.error} onRetry={apps.reload} />}
      {apps.data && groups[tab].length === 0 && (
        <EmptyState title="Nothing here yet" hint={tab === 'active' ? 'Apply to a role from Discover Opportunities.' : undefined} />
      )}

      <div className="space-y-3">
        {groups[tab].map((a) => {
          const upcoming = a.interviews.filter((i) => i.status === 'scheduled');
          return (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{a.job.title}</h3>
                  <p className="text-sm text-slate-600">
                    {a.job.company} · {joinParts([a.job.locationType, a.job.location], ', ')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Applied {timeAgo(a.createdAt).toLowerCase()} · updated {timeAgo(a.updatedAt).toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MatchBadge value={a.match} />
                  <StatusPill status={a.status} />
                </div>
              </div>

              {a.status === 'selected' && (
                <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  🎉 Congratulations — {a.job.company} selected you for this role.
                </p>
              )}
              {a.status === 'rejected' && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
                  The recruiter decided not to move forward this time. Keep strengthening your verified skills.
                </p>
              )}

              {a.status !== 'withdrawn' && a.status !== 'rejected' && <PipelineStepper status={a.status} />}

              {upcoming.map((i) => (
                <div key={i.id} className="flex items-start gap-3 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
                  <CalendarClock className="w-4 h-4 text-cyan-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-cyan-900 min-w-0">
                    <p className="font-semibold">
                      {i.mode} interview · {formatDateTime(i.scheduledAt)} · {i.durationMinutes} min
                    </p>
                    {i.location &&
                      (i.location.startsWith('http') ? (
                        <a href={i.location} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline break-all">
                          <Video className="w-3 h-3" /> {i.location}
                        </a>
                      ) : (
                        <p>{i.location}</p>
                      ))}
                    {i.notes && <p className="text-cyan-800 mt-0.5">{i.notes}</p>}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                {['applied', 'shortlisted', 'interview'].includes(a.status) && (
                  <Button variant="ghost" size="sm" busy={busyId === a.id} onClick={() => withdraw(a)}>
                    Withdraw
                  </Button>
                )}
                {a.canMessage ? (
                  <Button size="sm" onClick={() => navigate(`/messages?app=${a.id}`)}>
                    <MessageSquare className="w-3.5 h-3.5" /> Message recruiter
                    {a.unreadMessages > 0 && <span className="ml-1 bg-white/25 rounded-full px-1.5">{a.unreadMessages}</span>}
                  </Button>
                ) : (
                  a.status === 'applied' && <span className="text-[11px] text-slate-400">Messaging opens after shortlisting</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
