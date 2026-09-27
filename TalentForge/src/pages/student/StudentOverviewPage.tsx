import React from 'react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { ErrorState, LoadingState } from '../../components/common/ui';
import { Card, MatchBadge, PageHeader, StatTile, StatusPill } from '../../components/common/workspace';
import { timeAgo } from '../../lib/format';

export const StudentOverviewPage: React.FC = () => {
  const { user, navigate, notifications } = useWorkspace();
  const profile = useApi(() => talentforgeApi.getMyProfile(), [user.id]);
  const opps = useApi(() => talentforgeApi.getOpportunities(), [user.id]);
  const apps = useApi(() => talentforgeApi.getMyApplications(), [user.id]);
  const reqs = useApi(() => talentforgeApi.getVerificationRequests(), [user.id]);

  if (profile.error) return <ErrorState message={profile.error} onRetry={profile.reload} />;
  const p = profile.data;
  if (!p) return <LoadingState label="Loading your workspace…" />;

  const verified = p.skills.filter((s) => s.status === 'verified').length;
  const activeApps = (apps.data || []).filter((a) => !['rejected', 'withdrawn'].includes(a.status));

  // The platform workflow, as a checklist the student works through.
  const steps = [
    { label: 'Complete your profile (headline, about, education)', done: !!p.headline && !!p.bio && p.education.length > 0, path: '/student/profile' },
    { label: 'Add your skills', done: p.skills.length > 0, path: '/student/skills' },
    { label: 'Add a project', done: p.projects.length > 0, path: '/student/projects' },
    { label: 'Add a certificate', done: p.certificates.length > 0, path: '/student/certificates' },
    { label: 'Submit evidence for faculty verification', done: (reqs.data || []).length > 0, path: '/student/skills' },
    { label: 'Get a skill verified by faculty', done: verified > 0, path: '/student/skills' },
    { label: 'Apply to an opportunity', done: (apps.data || []).length > 0, path: '/student/opportunities' },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div>
      <PageHeader
        eyebrow="Student workspace"
        title={`Welcome${p.skills.length ? ' back' : ''}, ${p.name.split(' ')[0]}`}
        subtitle="Build verified proof of your skills, then turn it into interviews and offers."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Skill confidence" value={`${p.overallScore}%`} tone="text-blue-600" onClick={() => navigate('/student/profile')} />
        <StatTile label="Verified skills" value={`${verified}/${p.skills.length}`} tone="text-emerald-600" onClick={() => navigate('/student/skills')} />
        <StatTile label="Active applications" value={activeApps.length} onClick={() => navigate('/student/applications')} />
        <StatTile
          label="Pending reviews"
          value={(reqs.data || []).filter((r) => r.status === 'pending').length}
          tone="text-amber-600"
          onClick={() => navigate('/student/certificates')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Your path to getting hired" action={<span className="text-xs font-mono text-slate-500">{doneCount}/{steps.length} done</span>}>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
            </div>
            <ol className="space-y-1">
              {steps.map((s) => (
                <li key={s.label}>
                  <button
                    onClick={() => navigate(s.path)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 text-left group"
                  >
                    {s.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                    <span className={`text-sm flex-1 ${s.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{s.label}</span>
                    {!s.done && <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />}
                  </button>
                </li>
              ))}
            </ol>
          </Card>

          <Card
            title="Top matches for you"
            action={
              <button onClick={() => navigate('/student/opportunities')} className="text-xs font-semibold text-blue-600 hover:underline">
                All opportunities
              </button>
            }
          >
            {opps.data?.length === 0 && <p className="text-sm text-slate-500">No open roles right now.</p>}
            <div className="divide-y divide-slate-100">
              {(opps.data || []).slice(0, 4).map((o) => (
                <button key={o.id} onClick={() => navigate('/student/opportunities')} className="w-full py-3 flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{o.title}</p>
                    <p className="text-xs text-slate-500">
                      {o.company} · {o.locationType}
                      {o.missingSkills.length > 0 && ` · missing ${o.missingSkills.join(', ')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {o.application && <StatusPill status={o.application.status} />}
                    <MatchBadge value={o.match} />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card
            title="Applications"
            action={
              <button onClick={() => navigate('/student/applications')} className="text-xs font-semibold text-blue-600 hover:underline">
                View all
              </button>
            }
          >
            {apps.data?.length === 0 && <p className="text-sm text-slate-500">You haven't applied anywhere yet.</p>}
            <div className="space-y-3">
              {(apps.data || []).slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{a.job.title}</p>
                    <p className="text-[11px] text-slate-500">{a.job.company} · {timeAgo(a.updatedAt)}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Recent activity"
            action={
              <button onClick={() => navigate('/notifications')} className="text-xs font-semibold text-blue-600 hover:underline">
                All
              </button>
            }
          >
            {notifications.length === 0 && <p className="text-sm text-slate-500">Nothing yet.</p>}
            <div className="space-y-3">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="text-xs">
                  <p className={`font-semibold ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                  <p className="text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
