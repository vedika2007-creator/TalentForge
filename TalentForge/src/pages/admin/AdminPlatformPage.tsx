import React, { useState } from 'react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { ErrorState, LoadingState } from '../../components/common/ui';
import { Button, Card, PageHeader, SkillChip, StatusPill, Tabs } from '../../components/common/workspace';
import { Job } from '../../types';
import { timeAgo } from '../../lib/format';

/** Platform Management: moderate job postings and collaboration posts. */
export const AdminPlatformPage: React.FC = () => {
  const jobs = useApi(() => talentforgeApi.getAllJobs(), []);
  const posts = useApi(() => talentforgeApi.getCollaborationPosts(), []);
  const [tab, setTab] = useState('jobs');
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (j: Job) => {
    setBusyId(j.id);
    try {
      const updated = await talentforgeApi.setJobActive(j.id, !j.isActive);
      jobs.setData((jobs.data || []).map((x) => (x.id === j.id ? { ...x, ...updated } : x)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Platform Management" subtitle="Moderate what's published on TalentForge." />
      <div className="mb-5">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'jobs', label: 'Job postings', count: jobs.data?.length },
            { key: 'collab', label: 'Collaboration posts', count: posts.data?.length },
          ]}
        />
      </div>

      {tab === 'jobs' && (
        <Card>
          {jobs.loading && !jobs.data && <LoadingState />}
          {jobs.error && <ErrorState message={jobs.error} onRetry={jobs.reload} />}
          <div className="divide-y divide-slate-100">
            {(jobs.data || []).map((j) => (
              <div key={j.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{j.title}</p>
                    <StatusPill status={j.isActive ? 'verified' : 'withdrawn'} label={j.isActive ? 'Open' : 'Closed'} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {j.company} · posted by {j.recruiterName} {timeAgo(j.createdAt).toLowerCase()} · {j.applicantCount} applicants
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">{j.requiredSkills.map((s) => <SkillChip key={s} name={s} />)}</div>
                </div>
                <Button size="sm" variant={j.isActive ? 'danger' : 'secondary'} busy={busyId === j.id} onClick={() => toggle(j)}>
                  {j.isActive ? 'Take down' : 'Republish'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'collab' && (
        <Card>
          {posts.loading && !posts.data && <LoadingState />}
          <div className="divide-y divide-slate-100">
            {(posts.data || []).map((p) => (
              <div key={p.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-bold text-slate-900">{p.title}</p>
                <p className="text-[11px] text-slate-500">
                  {p.domain} · by {p.creatorName} · {p.currentMembers}/{p.maxMembers} members · {timeAgo(p.postedDate)}
                </p>
                <p className="text-xs text-slate-600 mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
