import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, PageHeader, SkillChip, TextInput } from '../../components/common/workspace';

/** Student Verification: every student's verification progress, with a link to their full profile. */
export const TeacherStudentsPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const students = useApi(() => talentforgeApi.getStudents(), [user.id]);
  const queue = useApi(() => talentforgeApi.getVerificationRequests({ status: 'pending' }), [user.id]);
  const [query, setQuery] = useState('');
  const [mineOnly, setMineOnly] = useState(false);

  const pendingBy = (id: string) => (queue.data || []).filter((r) => r.studentId === id).length;
  const q = query.trim().toLowerCase();
  const list = (students.data || []).filter(
    (s) =>
      (!mineOnly || s.college === user.college) &&
      (!q || [s.name, s.college, s.targetRole, ...s.skills.map((k) => k.skillName)].some((v) => v?.toLowerCase().includes(q)))
  );

  return (
    <div>
      <PageHeader title="Student Verification" subtitle="Verification progress for every student. Open a profile to see all of their evidence." />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students or skills" className="pl-9" />
        </div>
        {user.college && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="w-4 h-4 accent-purple-600" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
            Only {user.college}
          </label>
        )}
      </div>

      {students.loading && !students.data && <LoadingState />}
      {students.error && <ErrorState message={students.error} onRetry={students.reload} />}
      {students.data && list.length === 0 && <EmptyState title="No students found" />}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {list.map((s) => {
          const verified = s.skills.filter((k) => k.status === 'verified');
          const pending = pendingBy(s.id);
          return (
            <div key={s.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar src={s.avatar} name={s.name} className="w-11 h-11 rounded-xl" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{s.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.college} · {s.targetRole}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {verified.slice(0, 4).map((k) => <SkillChip key={k.id} name={k.skillName} verified />)}
                    {s.skills.length > verified.length && <span className="text-[11px] text-slate-400">+{s.skills.length - verified.length} unverified</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-lg font-extrabold font-mono text-emerald-600 tabular-nums">{verified.length}/{s.skills.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase">Verified</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-extrabold font-mono tabular-nums ${pending ? 'text-amber-600' : 'text-slate-300'}`}>{pending}</p>
                  <p className="text-[10px] text-slate-400 uppercase">Pending</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/profile/${s.id}`)}>View profile</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
