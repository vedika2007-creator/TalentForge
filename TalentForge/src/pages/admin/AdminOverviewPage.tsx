import React from 'react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { ErrorState, LoadingState } from '../../components/common/ui';
import { Card, PageHeader, StatTile } from '../../components/common/workspace';

const BarList: React.FC<{ rows: [string, number, string][] }> = ({ rows }) => {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <div className="space-y-2.5">
      {rows.map(([label, n, color]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-32 text-xs text-slate-600 truncate">{label}</span>
          <span className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden">
            <span className={`block h-full rounded-md ${color}`} style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className="w-8 text-right text-sm font-mono font-bold text-slate-800 tabular-nums">{n}</span>
        </div>
      ))}
    </div>
  );
};

export const AdminOverviewPage: React.FC = () => {
  const { navigate } = useWorkspace();
  const reports = useApi(() => talentforgeApi.getReports(), []);

  if (reports.error) return <ErrorState message={reports.error} onRetry={reports.reload} />;
  const r = reports.data;
  if (!r) return <LoadingState label="Building reports…" />;

  const users = r.usersByRole;
  const total = Object.values(users).reduce((sum: number, n) => sum + (n as number), 0);
  const v = r.verificationsByStatus;
  const a = r.applicationsByStatus;

  return (
    <div>
      <PageHeader eyebrow="Admin console" title="Overview & Reports" subtitle="Live platform health across users, verification and hiring." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Users" value={total} hint={`${users.student || 0} students · ${users.recruiter || 0} recruiters`} onClick={() => navigate('/admin/users')} />
        <StatTile
          label="Faculty awaiting approval"
          value={r.pendingFaculty}
          tone={r.pendingFaculty ? 'text-amber-600' : 'text-slate-900'}
          onClick={() => navigate('/admin/users')}
        />
        <StatTile label="Pending verifications" value={v.pending || 0} tone="text-purple-600" onClick={() => navigate('/admin/verifications')} />
        <StatTile label="Avg. review time" value={r.avgReviewHours != null ? `${r.avgReviewHours}h` : '—'} hint="submission → faculty decision" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Users by role">
          <BarList
            rows={[
              ['Students', users.student || 0, 'bg-blue-500'],
              ['Faculty', users.teacher || 0, 'bg-purple-500'],
              ['Recruiters', users.recruiter || 0, 'bg-cyan-500'],
              ['Admins', users.admin || 0, 'bg-teal-500'],
              ['Suspended / inactive', r.suspendedUsers, 'bg-rose-400'],
            ]}
          />
        </Card>
        <Card title="Hiring funnel" action={<span className="text-xs text-slate-500">{r.jobs.active} open · {r.jobs.closed} closed jobs</span>}>
          <BarList
            rows={[
              ['Applied', a.applied || 0, 'bg-blue-500'],
              ['Shortlisted', a.shortlisted || 0, 'bg-purple-500'],
              ['Interview', a.interview || 0, 'bg-cyan-500'],
              ['Selected', a.selected || 0, 'bg-emerald-500'],
              ['Rejected', a.rejected || 0, 'bg-rose-400'],
              ['Withdrawn', a.withdrawn || 0, 'bg-slate-300'],
            ]}
          />
        </Card>
        <Card title="Verification outcomes">
          <BarList
            rows={[
              ['Pending', v.pending || 0, 'bg-amber-400'],
              ['Accepted', v.approved || 0, 'bg-emerald-500'],
              ['Declined', v.rejected || 0, 'bg-rose-400'],
              ['Changes requested', v.changes_requested || 0, 'bg-slate-400'],
            ]}
          />
          <p className="text-[11px] text-slate-500 mt-4">
            By type: {r.verificationsByType.project || 0} projects · {r.verificationsByType.certificate || 0} certificates ·{' '}
            {r.verificationsByType.skill_assessment || 0} skill evidence
          </p>
        </Card>
        <Card title="Most verified skills">
          {r.topVerifiedSkills.length === 0 ? (
            <p className="text-sm text-slate-500">No verified skills yet.</p>
          ) : (
            <BarList rows={r.topVerifiedSkills.map((s) => [s.name, s.count, 'bg-emerald-500'] as [string, number, string])} />
          )}
        </Card>
      </div>
    </div>
  );
};
