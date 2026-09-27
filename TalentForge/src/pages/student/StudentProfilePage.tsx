import React, { useState } from 'react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { ErrorState, LoadingState } from '../../components/common/ui';
import { Button, Field, FormError, Modal, PageHeader, TextArea, TextInput } from '../../components/common/workspace';
import { ProfileView } from '../../components/profile/ProfileView';
import { StudentFullProfile } from '../../types';

type Dialog = null | 'intro' | 'education' | 'achievement';

export const StudentProfilePage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const profile = useApi(() => talentforgeApi.getMyProfile(), [user.id]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (profile.error) return <ErrorState message={profile.error} onRetry={profile.reload} />;
  const p = profile.data;
  if (!p) return <LoadingState label="Loading your profile…" />;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const str = (k: string) => (form[k] as string) ?? '';
  const num = (k: string) => (str(k) ? Number(str(k)) : undefined);

  const open = (d: Dialog) => {
    setError(null);
    setForm(
      d === 'intro'
        ? {
            name: p.name,
            headline: p.headline,
            bio: p.bio,
            location: p.location,
            college: p.college,
            batch_year: p.batchYear ? String(p.batchYear) : '',
            github_username: p.githubUsername,
            target_role: p.targetRole,
            available_for_hire: p.availableForHire,
          }
        : {}
    );
    setDialog(d);
  };

  const save = async (action: () => Promise<StudentFullProfile | unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (result && typeof result === 'object' && 'education' in result) profile.setData(result as StudentFullProfile);
      else profile.reload();
      setDialog(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (fn: () => Promise<StudentFullProfile>) => fn().then(profile.setData).catch((e) => setError(e.message));

  return (
    <div>
      <PageHeader title="My Profile" subtitle="This is what recruiters and faculty see. Verified skills carry the most weight." />
      <FormError message={dialog ? null : error} />
      <ProfileView
        profile={p}
        editable={{
          onEditIntro: () => open('intro'),
          onAddEducation: () => open('education'),
          onDeleteEducation: (id) => remove(() => talentforgeApi.deleteEducation(id)),
          onAddAchievement: () => open('achievement'),
          onDeleteAchievement: (id) => remove(() => talentforgeApi.deleteAchievement(id)),
          onManage: (section) => navigate(`/student/${section}`),
        }}
      />

      <Modal open={dialog === 'intro'} title="Edit intro" onClose={() => setDialog(null)} wide>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save(() =>
              talentforgeApi.updateMyProfile({
                name: str('name'),
                headline: str('headline'),
                bio: str('bio'),
                location: str('location'),
                college: str('college'),
                batch_year: num('batch_year'),
                github_username: str('github_username').replace(/^@/, ''),
                target_role: str('target_role'),
                available_for_hire: !!form.available_for_hire,
              })
            );
          }}
        >
          <Field label="Full name"><TextInput required value={str('name')} onChange={set('name')} /></Field>
          <Field label="Headline"><TextInput value={str('headline')} onChange={set('headline')} placeholder="Backend developer · Python & PostgreSQL" /></Field>
          <div className="sm:col-span-2">
            <Field label="About"><TextArea rows={4} value={str('bio')} onChange={set('bio')} placeholder="What do you build? What are you looking for?" /></Field>
          </div>
          <Field label="College"><TextInput value={str('college')} onChange={set('college')} /></Field>
          <Field label="Graduation year"><TextInput type="number" min={2000} max={2040} value={str('batch_year')} onChange={set('batch_year')} /></Field>
          <Field label="Location"><TextInput value={str('location')} onChange={set('location')} placeholder="Pune, India" /></Field>
          <Field label="Target role"><TextInput value={str('target_role')} onChange={set('target_role')} placeholder="Backend Developer" /></Field>
          <Field label="GitHub username"><TextInput value={str('github_username')} onChange={set('github_username')} placeholder="octocat" /></Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 self-end pb-2">
            <input
              type="checkbox"
              checked={!!form.available_for_hire}
              onChange={(e) => setForm({ ...form, available_for_hire: e.target.checked })}
              className="w-4 h-4 accent-blue-600"
            />
            Open to opportunities
          </label>
          <div className="sm:col-span-2 space-y-3">
            <FormError message={error} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
              <Button type="submit" busy={busy}>Save</Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal open={dialog === 'education'} title="Add education" onClose={() => setDialog(null)}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save(() =>
              talentforgeApi.addEducation({
                institution: str('institution'),
                degree: str('degree') || undefined,
                field_of_study: str('field') || undefined,
                start_year: num('start'),
                end_year: num('end'),
                grade: str('grade') || undefined,
              })
            );
          }}
        >
          <Field label="Institution"><TextInput required value={str('institution')} onChange={set('institution')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Degree"><TextInput value={str('degree')} onChange={set('degree')} placeholder="B.Tech" /></Field>
            <Field label="Field of study"><TextInput value={str('field')} onChange={set('field')} placeholder="Computer Science" /></Field>
            <Field label="Start year"><TextInput type="number" value={str('start')} onChange={set('start')} /></Field>
            <Field label="End year (or expected)"><TextInput type="number" value={str('end')} onChange={set('end')} /></Field>
          </div>
          <Field label="Grade"><TextInput value={str('grade')} onChange={set('grade')} placeholder="CGPA 8.9" /></Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button type="submit" busy={busy}>Add education</Button>
          </div>
        </form>
      </Modal>

      <Modal open={dialog === 'achievement'} title="Add achievement" onClose={() => setDialog(null)}>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save(() =>
              talentforgeApi.addAchievement({
                title: str('title'),
                description: str('description') || undefined,
                achieved_on: str('date') || undefined,
              })
            );
          }}
        >
          <Field label="Title"><TextInput required value={str('title')} onChange={set('title')} placeholder="Hackathon winner" /></Field>
          <Field label="Description"><TextArea value={str('description')} onChange={set('description')} /></Field>
          <Field label="Date"><TextInput type="date" value={str('date')} onChange={set('date')} /></Field>
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button type="submit" busy={busy}>Add achievement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
