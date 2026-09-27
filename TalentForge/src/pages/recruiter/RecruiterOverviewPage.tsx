import React from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, LoadingState } from '../../components/common/ui';
import { Button, Card, MatchBadge, PageHeader, StatTile, StatusPill } from '../../components/common/workspace';
import { formatDateTime, timeAgo } from '../../lib/format';

const FUNNEL = [
  ['applied', 'Applied', 'bg-blue-500'],
  ['shortlisted', 'Shortlisted', 'bg-purple-500'],
  ['interview', 'Interview', 'bg-cyan-500'],
  ['selected', 'Selected', 'bg-emerald-500'],
  ['rejected', 'Not selected', 'bg-rose-400'],
] as const;

export const RecruiterOverviewPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const jobs = useApi(() => talentforgeApi.getJobs(true), [user.id]);
  const apps = useApi(() => talentforgeApi.getRecruiterApplications(), [user.id]);

  if (!jobs.data || !apps.data) return <LoadingState label="Loading your hiring pipeline…" />;

  const all = apps.data;
  const count = (s: string) => all.filter((a) => a.status === s).length;
  const maxCount = Math.max(1, ...FUNNEL.map(([s]) => count(s)));
  const interviews = all
    .flatMap((a) => a.interviews.filter((i) => i.status === 'scheduled').map((i) => ({ ...i, app: a })))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return (
    <div>
      <PageHeader
        eyebrow="Recruiter workspace"
        title={`Hiring overview — ${user.college || user.name}`}
        subtitle="Post roles, review verified candidates, interview and hire."
        actions={
          <Button onClick={() => navigate('/recruiter/jobs?new=1')}>
            <Plus className="w-4 h-4" /> Post a job
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Active jobs" value={jobs.data.filter((j) => j.isActive).length} onClick={() => navigate('/recruiter/jobs')} />
        <StatTile label="Applications" value={all.length} tone="text-blue-600" onClick={() => navigate('/recruiter/applications')} />
        <StatTile label="Needs review" value={count('applied')} tone="text-amber-600" onClick={() => navigate('/recruiter/applications?status=applied')} />
        <StatTile label="Hired" value={count('selected')} tone="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Pipeline">
            <div className="space-y-2.5">
              {FUNNEL.map(([status, label, color]) => (
                <button key={status} onClick={() => navigate(`/recruiter/applications?status=${status}`)} className="w-full flex items-center gap-3 group">
                  <span className="w-24 text-xs text-slate-600 text-left">{label}</span>
                  <span className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                    <span className={`block h-full ${color} rounded-md transition-all group-hover:opacity-80`} style={{ width: `${(count(status) / maxCount) * 100}%` }} />
                  </span>
                  <span className="w-8 text-right text-sm font-mono font-bold text-slate-800 tabular-nums">{count(status)}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card
            title="Latest applications"
            action={<button onClick={() => navigate('/recruiter/applications')} className="text-xs font-semibold text-blue-600 hover:underline">View all</button>}
          >
            {all.length === 0 && <p className="text-sm text-slate-500">No applications yet. Post a job and invite talent.</p>}
            <div className="divide-y divide-slate-100">
              {all.slice(0, 6).map((a) => (
                <button key={a.id} onClick={() => navigate(`/recruiter/applications?job=${a.job.id}`)} className="w-full py-3 flex items-center gap-3 text-left">
                  <Avatar src={a.student.avatar} name={a.student.name} className="w-9 h-9 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{a.student.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{a.job.title} · {timeAgo(a.createdAt)}</p>
                  </div>
                  <MatchBadge value={a.match} />
                  <StatusPill status={a.status} />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Upcoming interviews">
            {interviews.length === 0 && <p className="text-sm text-slate-500">No interviews scheduled.</p>}
            <div className="space-y-3">
              {interviews.slice(0, 5).map((i) => (
                <div key={i.id} className="flex gap-3">
                  <CalendarClock className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900">{i.app.student.name}</p>
                    <p className="text-slate-500">{i.app.job.title}</p>
                    <p className="text-slate-400">{formatDateTime(i.scheduledAt)} · {i.mode}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Your jobs" action={<button onClick={() => navigate('/recruiter/jobs')} className="text-xs font-semibold text-blue-600 hover:underline">Manage</button>}>
            <div className="space-y-2.5">
              {jobs.data.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-800 font-medium truncate">{j.title}</span>
                  <span className="text-slate-500 shrink-0">{j.applicantCount} applicants</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
