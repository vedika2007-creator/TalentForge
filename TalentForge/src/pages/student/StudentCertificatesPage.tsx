import React, { useState } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, Card, Field, FormError, Modal, PageHeader, StatusPill, TextInput } from '../../components/common/workspace';
import { timeAgo } from '../../lib/format';

const TYPE_LABEL: Record<string, string> = { project: 'Project', certificate: 'Certificate', skill_assessment: 'Skill' };

export const StudentCertificatesPage: React.FC = () => {
  const { user } = useWorkspace();
  const profile = useApi(() => talentforgeApi.getMyProfile(), [user.id]);
  const requests = useApi(() => talentforgeApi.getVerificationRequests(), [user.id]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', issuer: '', url: '', date: '', skill: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (profile.error) return <ErrorState message={profile.error} onRetry={profile.reload} />;
  const p = profile.data;
  if (!p) return <LoadingState />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      profile.setData(
        await talentforgeApi.addCertificate({
          title: form.title,
          issuer: form.issuer || undefined,
          certificate_url: form.url || undefined,
          issued_date: form.date || undefined,
          skill: form.skill || undefined,
        })
      );
      requests.reload();
      setOpen(false);
      setForm({ title: '', issuer: '', url: '', date: '', skill: '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Certificates & Evidence"
        subtitle="Upload certificates for faculty verification and track every piece of evidence you've submitted."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Add certificate
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        <Card title={`Certificates (${p.certificates.length})`} className="lg:col-span-2">
          {p.certificates.length === 0 && <p className="text-sm text-slate-500">No certificates yet.</p>}
          <div className="space-y-4">
            {p.certificates.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {[c.issuer, c.skillName && `Skill: ${c.skillName}`, c.issuedDate].filter(Boolean).join(' · ')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusPill status={c.status} />
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    )}
                  </div>
                </div>
                {c.status !== 'verified' && (
                  <button
                    onClick={() =>
                      confirm(`Delete "${c.title}"?`) &&
                      talentforgeApi.deleteCertificate(c.id).then((d) => {
                        profile.setData(d);
                        requests.reload();
                      })
                    }
                    className="p-1 text-slate-300 hover:text-rose-600"
                    aria-label={`Delete ${c.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Evidence submissions" className="lg:col-span-3">
          {requests.loading && !requests.data && <LoadingState />}
          {requests.data?.length === 0 && <EmptyState title="Nothing submitted yet" hint="Projects, certificates and skill evidence you submit appear here." />}
          <div className="divide-y divide-slate-100">
            {(requests.data || []).map((r) => (
              <div key={r.id} className="py-3 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{r.skillOrProjectTitle}</p>
                    <p className="text-[11px] text-slate-500">
                      {TYPE_LABEL[r.type]} · submitted {timeAgo(r.submittedAt).toLowerCase()}
                      {r.reviewerName && ` · reviewed by ${r.reviewerName}`}
                    </p>
                  </div>
                  <StatusPill status={r.status === 'rejected' ? 'rejected' : r.status} label={r.status === 'rejected' ? 'Declined' : undefined} />
                </div>
                {r.status !== 'pending' && r.notes && (
                  <p className={`text-[11px] mt-1.5 rounded-lg px-2.5 py-1.5 ${r.status === 'approved' ? 'text-emerald-800 bg-emerald-50' : 'text-rose-800 bg-rose-50'}`}>
                    {r.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={open} title="Add certificate" subtitle="It will be sent to faculty for verification." onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Certificate name"><TextInput required value={form.title} onChange={set('title')} placeholder="AWS Certified Developer" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Issuer"><TextInput value={form.issuer} onChange={set('issuer')} placeholder="Amazon Web Services" /></Field>
            <Field label="Issued on"><TextInput type="date" value={form.date} onChange={set('date')} /></Field>
          </div>
          <Field label="Credential URL"><TextInput type="url" value={form.url} onChange={set('url')} placeholder="https://…" /></Field>
          <Field label="Related skill" hint="Once verified, it's added as evidence for this skill."><TextInput value={form.skill} onChange={set('skill')} placeholder="Python" /></Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" busy={busy}>Submit certificate</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
