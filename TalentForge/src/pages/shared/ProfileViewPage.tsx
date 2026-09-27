import React, { useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { ErrorState, LoadingState } from '../../components/common/ui';
import { Button, StatusPill } from '../../components/common/workspace';
import { ProfileView } from '../../components/profile/ProfileView';

/** Read-only verified profile, for recruiters (with shortlist) and faculty/admins. */
export const ProfileViewPage: React.FC<{ studentId: string }> = ({ studentId }) => {
  const { user } = useWorkspace();
  const profile = useApi(() => talentforgeApi.getProfile(studentId), [studentId]);
  const [busy, setBusy] = useState(false);

  if (profile.error) return <ErrorState message={profile.error} onRetry={profile.reload} />;
  const p = profile.data;
  if (!p) return <LoadingState label="Loading profile…" />;

  const toggleShortlist = async () => {
    setBusy(true);
    try {
      const list = await talentforgeApi.toggleShortlist(p.id);
      profile.setData({ ...p, shortlisted: list.includes(p.id) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={() => window.history.back()} className="mb-4 text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      {user.role === 'recruiter' && p.applications && p.applications.length > 0 && (
        <div className="mb-4 bg-white border border-slate-200 rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-slate-700">Applied to your jobs:</span>
          {p.applications.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1.5 text-xs text-slate-700">
              {a.jobTitle} <StatusPill status={a.status} />
            </span>
          ))}
        </div>
      )}
      <ProfileView
        profile={p}
        actions={
          user.role === 'recruiter' && (
            <Button variant={p.shortlisted ? 'secondary' : 'primary'} busy={busy} onClick={toggleShortlist}>
              <Star className={`w-4 h-4 ${p.shortlisted ? 'fill-amber-400 text-amber-500' : ''}`} />
              {p.shortlisted ? 'In your shortlist' : 'Add to shortlist'}
            </Button>
          )
        }
      />
    </div>
  );
};
