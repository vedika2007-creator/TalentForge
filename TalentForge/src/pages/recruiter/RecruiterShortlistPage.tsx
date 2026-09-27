import React from 'react';
import { Star } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, PageHeader, SkillChip } from '../../components/common/workspace';
import { timeAgo } from '../../lib/format';

/** The recruiter's saved talent pool (independent of any single job). */
export const RecruiterShortlistPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const list = useApi(() => talentforgeApi.getShortlistProfiles(), [user.id]);

  const remove = async (id: string) => {
    await talentforgeApi.toggleShortlist(id);
    list.setData((list.data || []).filter((s) => s.id !== id));
  };

  return (
    <div>
      <PageHeader
        title="Shortlist"
        subtitle="Candidates you've saved from Discover Talent. They're notified when you add them."
        actions={<Button variant="secondary" onClick={() => navigate('/recruiter/talent')}>Discover more talent</Button>}
      />
      {list.loading && !list.data && <LoadingState />}
      {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
      {list.data?.length === 0 && <EmptyState title="Your shortlist is empty" hint="Star candidates in Discover Talent to save them here." />}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {(list.data || []).map((s) => (
          <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar src={s.avatar} name={s.name} className="w-11 h-11 rounded-xl" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{s.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{s.headline || s.targetRole} · {s.college}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {s.skills.filter((k) => k.status === 'verified').slice(0, 4).map((k) => <SkillChip key={k.id} name={k.skillName} verified />)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-400 mr-2">Saved {timeAgo(s.shortlistedAt).toLowerCase()}</span>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/profile/${s.id}`)}>View profile</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(s.id)} aria-label={`Remove ${s.name}`}>
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
