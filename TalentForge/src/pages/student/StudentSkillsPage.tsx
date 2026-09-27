import React, { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, Card, Field, FormError, Modal, PageHeader, StatusPill, TextArea, TextInput } from '../../components/common/workspace';
import { SkillEvidenceModal } from '../../components/common/SkillEvidenceModal';
import { SkillEvidence } from '../../types';

export const StudentSkillsPage: React.FC = () => {
  const { user } = useWorkspace();
  const profile = useApi(() => talentforgeApi.getMyProfile(), [user.id]);
  const requests = useApi(() => talentforgeApi.getVerificationRequests({ type: 'skill_assessment' }), [user.id]);
  const [newSkill, setNewSkill] = useState('');
  const [evidenceFor, setEvidenceFor] = useState<SkillEvidence | null>(null);
  const [inspect, setInspect] = useState<SkillEvidence | null>(null);
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (profile.error) return <ErrorState message={profile.error} onRetry={profile.reload} />;
  const p = profile.data;
  if (!p) return <LoadingState />;

  const latestRequest = (skillName: string) => (requests.data || []).find((r) => r.skillName === skillName);

  const run = async (fn: () => Promise<typeof p>, after?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      profile.setData(await fn());
      requests.reload();
      after?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Skills"
        subtitle="Add the skills you have, then submit evidence. Once faculty verify a skill it's marked verified on your profile and counts fully in job matching."
      />

      <Card className="mb-5">
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newSkill.trim()) run(() => talentforgeApi.addSkill(newSkill.trim()), () => setNewSkill(''));
          }}
        >
          <TextInput value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill, e.g. Python, React, Docker" />
          <Button type="submit" busy={busy && !evidenceFor} className="shrink-0">
            <Plus className="w-4 h-4" /> Add skill
          </Button>
        </form>
        {!evidenceFor && <div className="mt-3"><FormError message={error} /></div>}
      </Card>

      {p.skills.length === 0 ? (
        <EmptyState title="No skills yet" hint="Add your first skill above." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {p.skills.map((s) => {
            const req = latestRequest(s.skillName);
            const awaiting = s.status === 'pending' && req?.status === 'pending';
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-400">{s.category}</p>
                    <h3 className="text-sm font-bold text-slate-900">{s.skillName}</h3>
                  </div>
                  <StatusPill
                    status={s.status}
                    label={s.status === 'verified' ? 'Faculty verified' : awaiting ? 'Under review' : s.status === 'needs_revision' ? 'Needs revision' : 'Not verified'}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Confidence</span>
                    <span className="font-mono font-bold text-slate-700">{s.confidenceScore}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.status === 'verified' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${s.confidenceScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {s.evidenceSources.projectsCount} projects · {s.evidenceSources.certificatesCount} certificates ·{' '}
                    {s.evidenceSources.assessmentsCompleted} faculty reviews
                  </p>
                </div>
                {req && req.status !== 'pending' && req.status !== 'approved' && req.notes && (
                  <p className="text-[11px] text-rose-700 bg-rose-50 rounded-lg px-2.5 py-1.5">
                    <strong>{req.reviewerName || 'Faculty'}:</strong> {req.notes}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button onClick={() => setInspect(s)} className="text-xs font-semibold text-slate-600 hover:text-blue-600">
                    Evidence breakdown
                  </button>
                  <div className="flex items-center gap-1">
                    {s.status !== 'verified' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={awaiting}
                        onClick={() => {
                          setEvidenceFor(s);
                          setDescription('');
                          setUrl('');
                          setError(null);
                        }}
                      >
                        <Upload className="w-3.5 h-3.5" /> {awaiting ? 'Awaiting review' : 'Submit evidence'}
                      </Button>
                    )}
                    <button
                      onClick={() => confirm(`Remove ${s.skillName} from your profile?`) && run(() => talentforgeApi.deleteSkill(s.id))}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg"
                      aria-label={`Remove ${s.skillName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!evidenceFor}
        title={`Submit evidence: ${evidenceFor?.skillName ?? ''}`}
        subtitle="Faculty will review this and accept or decline it. You'll get a notification either way."
        onClose={() => setEvidenceFor(null)}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (evidenceFor)
              run(() => talentforgeApi.submitSkillEvidence(evidenceFor.id, description, url || undefined), () => setEvidenceFor(null));
          }}
        >
          <Field label="What did you build or do with this skill?">
            <TextArea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work, your role and the outcome." />
          </Field>
          <Field label="Link to proof" hint="GitHub repository, deployed demo, assessment result…">
            <TextInput type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/you/project" />
          </Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEvidenceFor(null)}>Cancel</Button>
            <Button type="submit" busy={busy}>Submit for verification</Button>
          </div>
        </form>
      </Modal>

      <SkillEvidenceModal isOpen={!!inspect} skill={inspect} studentName={p.name} onClose={() => setInspect(null)} />
    </div>
  );
};
