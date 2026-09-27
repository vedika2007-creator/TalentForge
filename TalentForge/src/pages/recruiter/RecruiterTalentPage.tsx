import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, MatchBadge, PageHeader, Select, SkillChip, StatusPill, TextInput } from '../../components/common/workspace';
import { StudentProfile } from '../../types';
import { queryParam } from '../../lib/format';

interface Row {
  student: StudentProfile;
  match?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  applicationStatus?: string | null;
}

/** Discover Talent: browse all students, or rank them against one of your jobs. */
export const RecruiterTalentPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const [jobId, setJobId] = useState(queryParam('job') || '');
  const [query, setQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const jobs = useApi(() => talentforgeApi.getJobs(true), [user.id]);
  const shortlist = useApi(() => talentforgeApi.getShortlist(), [user.id]);
  const rows = useApi<Row[]>(
    () => (jobId ? talentforgeApi.getJobCandidates(jobId) : talentforgeApi.getStudents().then((s) => s.map((student) => ({ student })))),
    [jobId]
  );

  const q = query.trim().toLowerCase();
  const list = (rows.data || []).filter(({ student: s }) => {
    if (verifiedOnly && s.verifiedCount === 0) return false;
    if (!q) return true;
    return [s.name, s.college, s.targetRole, s.headline, ...s.skills.map((k) => k.skillName)].some((v) => v?.toLowerCase().includes(q));
  });

  const toggle = async (id: string) => shortlist.setData(await talentforgeApi.toggleShortlist(id));

  return (
    <div>
      <PageHeader title="Discover Talent" subtitle="Find students by their verified skills. Pick one of your jobs to rank candidates by how well they match it." />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col lg:flex-row gap-3 lg:items-center">
        <Select value={jobId} onChange={(e) => setJobId(e.target.value)} className="lg:max-w-xs">
          <option value="">All students (no job selected)</option>
          {(jobs.data || []).filter((j) => j.isActive).map((j) => (
            <option key={j.id} value={j.id}>
              Rank for: {j.title}
            </option>
          ))}
        </Select>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, skill, college or role" className="pl-9" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
          <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
          Has verified skills
        </label>
      </div>

      {rows.loading && !rows.data && <LoadingState label="Finding candidates…" />}
      {rows.error && <ErrorState message={rows.error} onRetry={rows.reload} />}
      {rows.data && list.length === 0 && <EmptyState title="No candidates found" hint={jobId ? 'No students have any of this job’s skills yet.' : 'Try a different search.'} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(({ student: s, match, matchedSkills, missingSkills, applicationStatus }) => {
          const saved = (shortlist.data || []).includes(s.id);
          const verified = s.skills.filter((k) => k.status === 'verified');
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3 hover:border-cyan-400 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <Avatar src={s.avatar} name={s.name} className="w-12 h-12 rounded-xl" />
                  <div className="min-w-0">
                    <button onClick={() => navigate(`/profile/${s.id}`)} className="text-sm font-bold text-slate-900 hover:text-cyan-700 text-left">
                      {s.name}
                    </button>
                    <p className="text-[11px] text-slate-500 truncate">{s.college}</p>
                    <p className="text-[11px] text-slate-600 truncate">{s.targetRole}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  className={`p-2 rounded-lg shrink-0 ${saved ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                  aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
                  title={saved ? 'Remove from shortlist' : 'Add to shortlist'}
                >
                  <Star className={`w-4 h-4 ${saved ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {match !== undefined && <MatchBadge value={match} />}
                <span className="text-[11px] font-mono text-slate-500">Confidence {s.overallScore}%</span>
                {applicationStatus && <StatusPill status={applicationStatus} />}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {matchedSkills
                  ? [...matchedSkills.map((k) => <SkillChip key={k} name={k} verified={verified.some((v) => v.skillName === k)} />), ...(missingSkills || []).map((k) => <SkillChip key={k} name={k} missing />)]
                  : verified.slice(0, 5).map((k) => <SkillChip key={k.id} name={k.skillName} verified />)}
                {!matchedSkills && verified.length === 0 && <span className="text-[11px] text-slate-400">No verified skills yet</span>}
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-500">
                  {s.projectCount} projects · {verified.length} verified skills
                </span>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/profile/${s.id}`)}>
                  View profile
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
