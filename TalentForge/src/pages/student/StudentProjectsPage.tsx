import React, { useState } from 'react';
import { ExternalLink, Github, Plus } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, Field, FormError, Modal, PageHeader, Select, StatusPill, TextArea, TextInput } from '../../components/common/workspace';
import { ProjectItem, VerificationRequest } from '../../types';
import { timeAgo } from '../../lib/format';
import confetti from 'canvas-confetti';

const DOMAINS: ProjectItem['domain'][] = ['Web Development', 'AI & Machine Learning', 'Cloud & Systems', 'Mobile', 'Cybersecurity'];

export const StudentProjectsPage: React.FC = () => {
  const { user } = useWorkspace();
  const projects = useApi(() => talentforgeApi.getProjects({ authorId: user.id }), [user.id]);
  const requests = useApi(() => talentforgeApi.getVerificationRequests({ type: 'project' }), [user.id]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', tagline: '', description: '', domain: DOMAINS[0] as ProjectItem['domain'], tech: '', repo: '', demo: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const byProject = new Map<string, VerificationRequest>();
  (requests.data || []).forEach((r) => r.projectId && !byProject.has(r.projectId) && byProject.set(r.projectId, r));

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await talentforgeApi.submitProject({
        title: form.title,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        domain: form.domain,
        github_url: form.repo || undefined,
        demo_url: form.demo || undefined,
        technologies: form.tech.split(',').map((t) => t.trim()).filter(Boolean),
      });
      projects.setData([created, ...(projects.data || [])]);
      requests.reload();
      setOpen(false);
      setForm({ title: '', tagline: '', description: '', domain: DOMAINS[0], tech: '', repo: '', demo: '' });
      try {
        confetti({ particleCount: 40, spread: 50 });
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
        title="Projects"
        subtitle="Every project goes to faculty for verification. When it's accepted, each technology you used gets added as evidence for that skill."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Submit project
          </Button>
        }
      />

      {projects.loading && !projects.data && <LoadingState />}
      {projects.error && <ErrorState message={projects.error} onRetry={projects.reload} />}
      {projects.data?.length === 0 && <EmptyState title="No projects yet" hint="Submit your first project for faculty verification." />}

      <div className="space-y-3">
        {(projects.data || []).map((p) => {
          const req = byProject.get(p.id);
          const status = p.isFacultyVerified ? 'verified' : req?.status === 'rejected' ? 'rejected' : req?.status === 'changes_requested' ? 'changes_requested' : 'pending';
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                    <StatusPill
                      status={status === 'rejected' ? 'needs_revision' : status}
                      label={{ verified: 'Faculty verified', rejected: 'Declined', changes_requested: 'Changes requested', pending: 'Pending review' }[status]}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{p.tagline}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.domain}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                      <Github className="w-3.5 h-3.5" /> Code
                    </a>
                  )}
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                      <ExternalLink className="w-3.5 h-3.5" /> Demo
                    </a>
                  )}
                </div>
              </div>
              {p.technologies.length > 0 && <p className="text-xs font-mono text-slate-600 mt-3">{p.technologies.join(' · ')}</p>}
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px]">
                {p.verifiedBy ? (
                  <span className="text-slate-500">Verified by <strong>{p.verifiedBy}</strong> on {p.verificationDate}</span>
                ) : req && req.status !== 'pending' && req.notes ? (
                  <span className="text-rose-700"><strong>{req.reviewerName || 'Faculty'}:</strong> {req.notes}</span>
                ) : req ? (
                  <span className="text-slate-400">Submitted {timeAgo(req.submittedAt).toLowerCase()} — waiting for faculty review</span>
                ) : (
                  <span className="text-slate-400">Collaborator on this project</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} title="Submit project for verification" subtitle="Faculty will review the code and accept or decline it." onClose={() => setOpen(false)} wide>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Field label="Project title"><TextInput required value={form.title} onChange={set('title')} placeholder="Distributed Consensus Engine" /></Field></div>
          <div className="sm:col-span-2"><Field label="One-line summary"><TextInput value={form.tagline} onChange={set('tagline')} /></Field></div>
          <div className="sm:col-span-2"><Field label="Description"><TextArea value={form.description} onChange={set('description')} placeholder="What does it do? What was your role?" /></Field></div>
          <Field label="Domain">
            <Select value={form.domain} onChange={set('domain')}>
              {DOMAINS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Technologies" hint="Comma-separated"><TextInput required value={form.tech} onChange={set('tech')} placeholder="Python, FastAPI, Docker" /></Field>
          <Field label="GitHub repository"><TextInput type="url" value={form.repo} onChange={set('repo')} placeholder="https://github.com/…" /></Field>
          <Field label="Live demo"><TextInput type="url" value={form.demo} onChange={set('demo')} placeholder="https://…" /></Field>
          <div className="sm:col-span-2 space-y-3">
            <FormError message={error} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" busy={busy}>Submit for faculty review</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
