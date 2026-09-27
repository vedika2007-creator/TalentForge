import React, { useState } from 'react';
import { Building2, MapPin, Search, Users } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, Field, FormError, MatchBadge, Modal, PageHeader, SkillChip, StatusPill, TextArea, TextInput, Tabs } from '../../components/common/workspace';
import { Opportunity } from '../../types';
import { joinParts, timeAgo } from '../../lib/format';
import confetti from 'canvas-confetti';

export const OpportunitiesPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const opps = useApi(() => talentforgeApi.getOpportunities(), [user.id]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('all');
  const [applyTo, setApplyTo] = useState<Opportunity | null>(null);
  const [cover, setCover] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const q = query.trim().toLowerCase();
  const list = (opps.data || []).filter((o) => {
    if (mode !== 'all' && o.locationType !== mode) return false;
    if (!q) return true;
    return [o.title, o.company, o.location, ...o.requiredSkills].some((v) => v?.toLowerCase().includes(q));
  });

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyTo) return;
    setBusy(true);
    setError(null);
    try {
      await talentforgeApi.applyToJob(applyTo.id, cover || undefined);
      await opps.reload();
      setApplyTo(null);
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {
        // ignore
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Discover Opportunities"
        subtitle="Roles ranked by how well your skills match what each job needs. Verified skills count fully; unverified ones count at 60%."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by role, company, skill or location" className="pl-9" />
        </div>
        <Tabs
          active={mode}
          onChange={setMode}
          tabs={[{ key: 'all', label: 'All' }, { key: 'Remote', label: 'Remote' }, { key: 'Hybrid', label: 'Hybrid' }, { key: 'Onsite', label: 'Onsite' }]}
        />
      </div>

      {opps.loading && !opps.data && <LoadingState label="Matching you with open roles…" />}
      {opps.error && <ErrorState message={opps.error} onRetry={opps.reload} />}
      {opps.data && list.length === 0 && <EmptyState title="No matching roles" hint="Try a different search." />}

      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">{o.title}</h3>
                  <p className="text-sm text-slate-600">{o.company || 'Company'}</p>
                  <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {joinParts([o.locationType, o.location])}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> {o.applicantCount} applicants
                    </span>
                    <span>Posted {timeAgo(o.createdAt).toLowerCase()}</span>
                  </p>
                </div>
              </div>
              <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                <MatchBadge value={o.match} />
                {o.application ? (
                  <button onClick={() => navigate('/student/applications')} className="flex items-center gap-2">
                    <StatusPill status={o.application.status} />
                  </button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setApplyTo(o);
                      setCover('');
                      setError(null);
                    }}
                  >
                    Apply
                  </Button>
                )}
              </div>
            </div>
            {o.description && <p className="text-sm text-slate-600 mt-3 line-clamp-2">{o.description}</p>}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {o.matchedSkills.map((s) => <SkillChip key={s} name={s} verified />)}
              {o.missingSkills.map((s) => <SkillChip key={s} name={s} missing />)}
              {o.requireFacultyVerification && (
                <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">Faculty-verified skills preferred</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!applyTo} title={`Apply: ${applyTo?.title ?? ''}`} subtitle={applyTo?.company} onClose={() => setApplyTo(null)}>
        <form onSubmit={apply} className="space-y-3">
          {applyTo && applyTo.missingSkills.length > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              You're missing {applyTo.missingSkills.join(', ')}. You can still apply — your verified profile will be shared with the recruiter.
            </p>
          )}
          <Field label="Note to the recruiter (optional)">
            <TextArea rows={4} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Why are you a great fit?" />
          </Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setApplyTo(null)}>Cancel</Button>
            <Button type="submit" busy={busy}>Submit application</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
