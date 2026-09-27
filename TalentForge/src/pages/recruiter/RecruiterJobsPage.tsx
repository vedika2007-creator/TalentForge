import React, { useState } from 'react';
import { MapPin, Plus, Search, Users } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, Field, FormError, Modal, PageHeader, Select, SkillChip, StatusPill, TextArea, TextInput } from '../../components/common/workspace';
import { Job } from '../../types';
import { joinParts, queryParam, timeAgo } from '../../lib/format';

const EMPTY = { title: '', company: '', location: '', locationType: 'Remote' as Job['locationType'], description: '', skills: '', verified: false };

export const RecruiterJobsPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const jobs = useApi(() => talentforgeApi.getJobs(true), [user.id]);
  const [open, setOpen] = useState(queryParam('new') === '1');
  const [form, setForm] = useState({ ...EMPTY, company: user.college || '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const job = await talentforgeApi.createJob({
        title: form.title,
        company: form.company || undefined,
        location: form.location || undefined,
        location_type: form.locationType,
        description: form.description || undefined,
        require_faculty_verification: form.verified,
        required_skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      jobs.setData([job, ...(jobs.data || [])]);
      setOpen(false);
      setForm({ ...EMPTY, company: user.college || '' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (job: Job) => {
    const updated = await talentforgeApi.setJobActive(job.id, !job.isActive);
    jobs.setData((jobs.data || []).map((j) => (j.id === job.id ? { ...j, ...updated } : j)));
  };

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle="Create opportunities. Students see them ranked by how well their verified skills match."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Create job
          </Button>
        }
      />

      {jobs.loading && !jobs.data && <LoadingState />}
      {jobs.error && <ErrorState message={jobs.error} onRetry={jobs.reload} />}
      {jobs.data?.length === 0 && <EmptyState title="No jobs yet" hint="Create your first opportunity to start receiving applications." />}

      <div className="space-y-3">
        {(jobs.data || []).map((j) => (
          <div key={j.id} className={`bg-white rounded-2xl border p-5 shadow-xs ${j.isActive ? 'border-slate-200' : 'border-slate-200 opacity-70'}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{j.title}</h3>
                  <StatusPill status={j.isActive ? 'verified' : 'withdrawn'} label={j.isActive ? 'Open' : 'Closed'} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3">
                  <span>{j.company}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {joinParts([j.locationType, j.location])}
                  </span>
                  <span>Posted {timeAgo(j.createdAt).toLowerCase()}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button size="sm" onClick={() => navigate(`/recruiter/applications?job=${j.id}`)}>
                  <Users className="w-3.5 h-3.5" /> {j.applicantCount} applicants
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/recruiter/talent?job=${j.id}`)}>
                  <Search className="w-3.5 h-3.5" /> Find candidates
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(j)}>
                  {j.isActive ? 'Close job' : 'Reopen'}
                </Button>
              </div>
            </div>
            {j.description && <p className="text-sm text-slate-600 mt-3">{j.description}</p>}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {j.requiredSkills.map((s) => <SkillChip key={s} name={s} />)}
              {j.requireFacultyVerification && <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">Prefers faculty-verified skills</span>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title="Create job" subtitle="Required skills drive candidate matching." onClose={() => setOpen(false)} wide>
        <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Field label="Job title"><TextInput required value={form.title} onChange={set('title')} placeholder="Backend Engineering Intern" /></Field></div>
          <Field label="Company"><TextInput value={form.company} onChange={set('company')} /></Field>
          <Field label="Work mode">
            <Select value={form.locationType} onChange={set('locationType')}>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>Onsite</option>
            </Select>
          </Field>
          <Field label="Location"><TextInput value={form.location} onChange={set('location')} placeholder="Bengaluru, India" /></Field>
          <Field label="Required skills" hint="Comma-separated"><TextInput required value={form.skills} onChange={set('skills')} placeholder="Python, PostgreSQL, Docker" /></Field>
          <div className="sm:col-span-2"><Field label="Description"><TextArea rows={4} value={form.description} onChange={set('description')} placeholder="What will the candidate work on?" /></Field></div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
            Prefer candidates whose skills are faculty-verified
          </label>
          <div className="sm:col-span-2 space-y-3">
            <FormError message={error} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" busy={busy}>Publish job</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
