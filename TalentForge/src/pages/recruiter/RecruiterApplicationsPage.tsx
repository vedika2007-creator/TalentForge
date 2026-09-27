import React, { useState } from 'react';
import { CalendarClock, CalendarPlus, Check, MessageSquare, UserRound, X } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../../components/common/ui';
import {
  Button,
  Field,
  FormError,
  MatchBadge,
  Modal,
  PageHeader,
  Select,
  SkillChip,
  StatusPill,
  Tabs,
  TextArea,
  TextInput,
} from '../../components/common/workspace';
import { Application, ApplicationStatus, Interview } from '../../types';
import { formatDateTime, queryParam, timeAgo } from '../../lib/format';

type Decision = Exclude<ApplicationStatus, 'withdrawn'>;

const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const RecruiterApplicationsPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const [jobId, setJobId] = useState(queryParam('job') || '');
  const [status, setStatus] = useState(queryParam('status') || 'all');
  const jobs = useApi(() => talentforgeApi.getJobs(true), [user.id]);
  const apps = useApi(() => talentforgeApi.getRecruiterApplications(jobId ? { job_id: jobId } : undefined), [jobId]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState<Application | null>(null);
  const [interview, setInterview] = useState({ when: '', duration: '45', mode: 'Online' as Interview['mode'], location: '', notes: '' });

  const all = apps.data || [];
  const count = (s: string) => all.filter((a) => a.status === s).length;
  const list = status === 'all' ? all : all.filter((a) => a.status === status);

  const replace = (updated: Application) => apps.setData(all.map((a) => (a.id === updated.id ? updated : a)));

  const decide = async (a: Application, next: Decision) => {
    if (next === 'rejected' && !confirm(`Reject ${a.student.name} for ${a.job.title}? They will be notified.`)) return;
    setBusyId(a.id);
    setError(null);
    try {
      replace(await talentforgeApi.updateApplication(a.id, next));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const openSchedule = (a: Application) => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(10, 0, 0, 0);
    setInterview({ when: toLocalInput(d), duration: '45', mode: 'Online', location: '', notes: '' });
    setError(null);
    setScheduling(a);
  };

  const schedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduling) return;
    setBusyId(scheduling.id);
    setError(null);
    try {
      replace(
        await talentforgeApi.scheduleInterview(scheduling.id, {
          scheduled_at: new Date(interview.when).toISOString(),
          duration_minutes: Number(interview.duration),
          mode: interview.mode,
          location: interview.location || undefined,
          notes: interview.notes || undefined,
        })
      );
      setScheduling(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const setInterviewStatus = async (a: Application, i: Interview, s: Interview['status']) => {
    setBusyId(a.id);
    try {
      replace(await talentforgeApi.updateInterview(i.id, s));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Review applicants, shortlist, interview, and select or reject. Candidates are notified at every step."
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <Select value={jobId} onChange={(e) => setJobId(e.target.value)} className="md:max-w-xs">
          <option value="">All jobs</option>
          {(jobs.data || []).map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </Select>
        <Tabs
          active={status}
          onChange={setStatus}
          tabs={[
            { key: 'all', label: 'All', count: all.length },
            { key: 'applied', label: 'New', count: count('applied') },
            { key: 'shortlisted', label: 'Shortlisted', count: count('shortlisted') },
            { key: 'interview', label: 'Interview', count: count('interview') },
            { key: 'selected', label: 'Selected', count: count('selected') },
            { key: 'rejected', label: 'Rejected', count: count('rejected') },
          ]}
        />
      </div>

      {error && !scheduling && <div className="mb-4"><FormError message={error} /></div>}
      {apps.loading && !apps.data && <LoadingState />}
      {apps.error && <ErrorState message={apps.error} onRetry={apps.reload} />}
      {apps.data && list.length === 0 && <EmptyState title="No applications here" hint="Try another job or status." />}

      <div className="space-y-3">
        {list.map((a) => {
          const busy = busyId === a.id;
          const scheduled = a.interviews.filter((i) => i.status === 'scheduled');
          return (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <Avatar src={a.student.avatar} name={a.student.name} className="w-12 h-12 rounded-xl" />
                  <div className="min-w-0">
                    <button onClick={() => navigate(`/profile/${a.student.id}`)} className="text-base font-bold text-slate-900 hover:text-blue-600 text-left">
                      {a.student.name}
                    </button>
                    <p className="text-xs text-slate-600">{a.student.headline || a.student.college}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      For <strong className="text-slate-600">{a.job.title}</strong> · applied {timeAgo(a.createdAt).toLowerCase()} ·{' '}
                      {a.student.verifiedCount} verified skills · confidence {a.student.overallScore}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <MatchBadge value={a.match} />
                  <StatusPill status={a.status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {a.matchedSkills.map((s) => <SkillChip key={s} name={s} verified />)}
                {a.missingSkills.map((s) => <SkillChip key={s} name={s} missing />)}
              </div>

              {a.coverNote && <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-2.5 mt-3 italic">“{a.coverNote}”</p>}

              {scheduled.map((i) => (
                <div key={i.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2.5 text-xs text-cyan-900">
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" />
                    {i.mode} interview · {formatDateTime(i.scheduledAt)} · {i.durationMinutes} min{i.location && ` · ${i.location}`}
                  </span>
                  <span className="flex gap-2">
                    <button disabled={busy} onClick={() => setInterviewStatus(a, i, 'completed')} className="font-semibold hover:underline">Mark done</button>
                    <button disabled={busy} onClick={() => setInterviewStatus(a, i, 'cancelled')} className="font-semibold text-rose-700 hover:underline">Cancel</button>
                  </span>
                </div>
              ))}

              <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/${a.student.id}`)}>
                  <UserRound className="w-3.5 h-3.5" /> View profile
                </Button>
                {a.canMessage && (
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/messages?app=${a.id}`)}>
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                    {a.unreadMessages > 0 && <span className="ml-1 text-white bg-blue-600 rounded-full px-1.5">{a.unreadMessages}</span>}
                  </Button>
                )}
                {a.status === 'applied' && (
                  <Button size="sm" busy={busy} onClick={() => decide(a, 'shortlisted')}>
                    Shortlist
                  </Button>
                )}
                {(a.status === 'shortlisted' || a.status === 'interview') && (
                  <>
                    <Button size="sm" variant="secondary" busy={busy} onClick={() => openSchedule(a)}>
                      <CalendarPlus className="w-3.5 h-3.5" /> {a.interviews.length ? 'Schedule another' : 'Schedule interview'}
                    </Button>
                    <Button size="sm" variant="success" busy={busy} onClick={() => decide(a, 'selected')}>
                      <Check className="w-3.5 h-3.5" /> Select
                    </Button>
                  </>
                )}
                {['applied', 'shortlisted', 'interview'].includes(a.status) && (
                  <Button size="sm" variant="danger" busy={busy} onClick={() => decide(a, 'rejected')}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                )}
                {(a.status === 'rejected' || a.status === 'selected') && (
                  <Button size="sm" variant="ghost" busy={busy} onClick={() => decide(a, 'shortlisted')}>
                    Reopen
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!scheduling}
        title="Schedule interview"
        subtitle={scheduling ? `${scheduling.student.name} · ${scheduling.job.title}` : ''}
        onClose={() => setScheduling(null)}
      >
        <form onSubmit={schedule} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date & time"><TextInput required type="datetime-local" value={interview.when} onChange={(e) => setInterview({ ...interview, when: e.target.value })} /></Field>
            <Field label="Duration (minutes)"><TextInput required type="number" min={10} max={480} value={interview.duration} onChange={(e) => setInterview({ ...interview, duration: e.target.value })} /></Field>
          </div>
          <Field label="Mode">
            <Select value={interview.mode} onChange={(e) => setInterview({ ...interview, mode: e.target.value as Interview['mode'] })}>
              <option>Online</option>
              <option>Onsite</option>
              <option>Phone</option>
            </Select>
          </Field>
          <Field label={interview.mode === 'Online' ? 'Meeting link' : interview.mode === 'Onsite' ? 'Address' : 'Phone number'}>
            <TextInput value={interview.location} onChange={(e) => setInterview({ ...interview, location: e.target.value })} />
          </Field>
          <Field label="Notes for the candidate"><TextArea value={interview.notes} onChange={(e) => setInterview({ ...interview, notes: e.target.value })} placeholder="What should they prepare?" /></Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setScheduling(null)}>Cancel</Button>
            <Button type="submit" busy={!!busyId}>Schedule & notify</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
