import React, { useState } from 'react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { ErrorState, LoadingState } from '../../components/common/ui';
import { Button, PageHeader, Select, StatTile, StatusPill } from '../../components/common/workspace';
import { timeAgo } from '../../lib/format';

const TYPE_LABEL: Record<string, string> = { project: 'Project', certificate: 'Certificate', skill_assessment: 'Skill evidence' };
const STATUS_LABEL: Record<string, string> = { approved: 'Accepted', rejected: 'Declined', changes_requested: 'Changes requested', pending: 'Pending' };

const hoursBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 36e5;

/** Verification Monitoring: read-only audit of every faculty review across the platform. */
export const AdminVerificationsPage: React.FC = () => {
  const { navigate } = useWorkspace();
  const queue = useApi(() => talentforgeApi.getVerificationRequests(), []);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  if (queue.error) return <ErrorState message={queue.error} onRetry={queue.reload} />;
  if (!queue.data) return <LoadingState />;

  const all = queue.data;
  const list = all.filter((r) => (!status || r.status === status) && (!type || r.type === type));
  const stale = all.filter((r) => r.status === 'pending' && hoursBetween(r.submittedAt, new Date().toISOString()) > 72);

  return (
    <div>
      <PageHeader
        title="Verification Monitoring"
        subtitle="Audit trail of every submission and faculty decision."
        actions={<Button variant="secondary" onClick={() => navigate('/teacher')}>Open review queue</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatTile label="Total submissions" value={all.length} />
        <StatTile label="Pending" value={all.filter((r) => r.status === 'pending').length} tone="text-amber-600" />
        <StatTile label="Waiting > 3 days" value={stale.length} tone={stale.length ? 'text-rose-600' : 'text-slate-900'} />
        <StatTile label="Accepted" value={all.filter((r) => r.status === 'approved').length} tone="text-emerald-600" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto">
          <option value="">All types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-semibold">Submission</th>
              <th className="px-3 py-3 font-semibold">Student</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold hidden md:table-cell">Reviewer</th>
              <th className="px-5 py-3 font-semibold hidden sm:table-cell">Turnaround</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{r.skillOrProjectTitle}</p>
                  <p className="text-[11px] text-slate-500">{TYPE_LABEL[r.type]} · {timeAgo(r.submittedAt)}</p>
                </td>
                <td className="px-3 py-3">
                  <button onClick={() => navigate(`/profile/${r.studentId}`)} className="text-xs font-semibold text-slate-700 hover:text-blue-600">
                    {r.studentName}
                  </button>
                </td>
                <td className="px-3 py-3"><StatusPill status={r.status} label={STATUS_LABEL[r.status]} /></td>
                <td className="px-3 py-3 text-xs text-slate-500 hidden md:table-cell">{r.reviewerName || '—'}</td>
                <td className="px-5 py-3 text-xs font-mono text-slate-500 hidden sm:table-cell">
                  {r.reviewedAt ? `${Math.max(0, hoursBetween(r.submittedAt, r.reviewedAt)).toFixed(1)}h` : `${Math.round(hoursBetween(r.submittedAt, new Date().toISOString()))}h waiting`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-sm text-slate-500 py-8">No submissions match.</p>}
      </div>
    </div>
  );
};
