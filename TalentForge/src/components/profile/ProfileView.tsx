import React from 'react';
import {
  Award,
  BadgeCheck,
  Briefcase,
  ExternalLink,
  Github,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
  FolderGit2,
} from 'lucide-react';
import { StudentFullProfile } from '../../types';
import { Avatar } from '../common/ui';
import { StatusPill } from '../common/workspace';

interface Props {
  profile: StudentFullProfile;
  /** Buttons shown in the header (e.g. Shortlist for recruiters, Edit for the owner). */
  actions?: React.ReactNode;
  editable?: {
    onEditIntro: () => void;
    onAddEducation: () => void;
    onDeleteEducation: (id: string) => void;
    onAddAchievement: () => void;
    onDeleteAchievement: (id: string) => void;
    onManage: (section: 'skills' | 'projects' | 'certificates') => void;
  };
}

const Section: React.FC<{
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon: Icon, action, children }) => (
  <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const SectionButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
    {children}
  </button>
);

const Empty: React.FC<{ text: string }> = ({ text }) => <p className="text-sm text-slate-400">{text}</p>;

const years = (a: number | null, b: number | null) => [a, b ?? 'Present'].filter(Boolean).join(' – ');

export const ProfileView: React.FC<Props> = ({ profile, actions, editable }) => {
  const verified = profile.skills.filter((s) => s.status === 'verified');
  const other = profile.skills.filter((s) => s.status !== 'verified');

  return (
    <div className="space-y-5">
      {/* Intro card */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-24 sm:h-28 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400" />
        <div className="px-5 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12">
            <div className="rounded-2xl ring-4 ring-white w-fit bg-white">
              <Avatar src={profile.avatar} name={profile.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl" textClass="text-2xl" />
            </div>
            <div className="flex flex-wrap gap-2">
              {actions}
              {editable && (
                <button
                  onClick={editable.onEditIntro}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit intro
                </button>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{profile.name}</h1>
              {verified.length > 0 && (
                <span title="Has faculty-verified skills" className="text-emerald-600">
                  <BadgeCheck className="w-5 h-5" />
                </span>
              )}
              {profile.availableForHire && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Open to opportunities
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 mt-0.5">{profile.headline || (editable ? 'Add a headline — e.g. “Backend developer”' : '')}</p>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {profile.college && <span>{profile.college}{profile.batchYear ? ` · Class of ${profile.batchYear}` : ''}</span>}
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.location}
                </span>
              )}
              {profile.targetRole && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Target: {profile.targetRole}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            {[
              ['Skill confidence', `${profile.overallScore}%`, 'text-blue-600'],
              ['Verified skills', `${verified.length}/${profile.skills.length}`, 'text-emerald-600'],
              ['Projects', profile.projects.length, 'text-slate-900'],
              ['Certificates', profile.certificates.filter((c) => c.status === 'verified').length + ' verified', 'text-slate-900'],
            ].map(([label, value, tone]) => (
              <div key={label as string} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                <p className={`text-lg font-extrabold font-mono tabular-nums ${tone}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Section title="About" icon={Pencil}>
            {profile.bio ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            ) : (
              <Empty text={editable ? 'Tell recruiters about yourself — use “Edit intro”.' : 'No summary yet.'} />
            )}
          </Section>

          <Section
            title="Verified skills"
            icon={ShieldCheck}
            action={editable && <SectionButton onClick={() => editable.onManage('skills')}>Manage skills</SectionButton>}
          >
            {verified.length === 0 && <Empty text="No faculty-verified skills yet." />}
            <div className="space-y-3">
              {verified.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      {s.skillName}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">{s.confidenceScore}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${s.confidenceScore}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {s.evidenceSources.verifierName ? `Verified by ${s.evidenceSources.verifierName}` : 'Faculty verified'}
                    {s.evidenceSources.verifiedDate ? ` · ${s.evidenceSources.verifiedDate}` : ''} · {s.evidenceSources.projectsCount} projects ·{' '}
                    {s.evidenceSources.certificatesCount} certificates
                  </p>
                </div>
              ))}
            </div>
            {other.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Other skills (awaiting verification)</p>
                <div className="flex flex-wrap gap-1.5">
                  {other.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                      {s.skillName}
                      <StatusPill status={s.status} />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section
            title="Projects"
            icon={FolderGit2}
            action={editable && <SectionButton onClick={() => editable.onManage('projects')}>Manage projects</SectionButton>}
          >
            {profile.projects.length === 0 && <Empty text="No projects yet." />}
            <div className="space-y-4">
              {profile.projects.map((p) => (
                <div key={p.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                    {p.isFacultyVerified ? <StatusPill status="verified" label="Faculty verified" /> : <StatusPill status="pending" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{p.tagline}</p>
                  {p.technologies.length > 0 && <p className="text-[11px] font-mono text-slate-500 mt-1.5">{p.technologies.join(' · ')}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                        <Github className="w-3 h-3" /> Repository
                      </a>
                    )}
                    {p.demoUrl && (
                      <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Demo
                      </a>
                    )}
                    {p.verifiedBy && <span className="text-slate-400">Verified by {p.verifiedBy}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Achievements"
            icon={Trophy}
            action={editable && <SectionButton onClick={editable.onAddAchievement}><Plus className="w-3.5 h-3.5" /> Add</SectionButton>}
          >
            {profile.achievements.length === 0 && <Empty text="No achievements added." />}
            <div className="space-y-3">
              {profile.achievements.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                    {a.description && <p className="text-xs text-slate-600">{a.description}</p>}
                    {a.achievedOn && <p className="text-[11px] text-slate-400 mt-0.5">{new Date(a.achievedOn).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>}
                  </div>
                  {editable && (
                    <button onClick={() => editable.onDeleteAchievement(a.id)} className="p-1 text-slate-300 hover:text-rose-600" aria-label="Remove achievement">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section
            title="Education"
            icon={GraduationCap}
            action={editable && <SectionButton onClick={editable.onAddEducation}><Plus className="w-3.5 h-3.5" /> Add</SectionButton>}
          >
            {profile.education.length === 0 && <Empty text="No education added." />}
            <div className="space-y-4">
              {profile.education.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{e.institution}</p>
                    <p className="text-xs text-slate-600">{[e.degree, e.fieldOfStudy].filter(Boolean).join(', ')}</p>
                    <p className="text-[11px] text-slate-400">{[years(e.startYear, e.endYear), e.grade].filter(Boolean).join(' · ')}</p>
                  </div>
                  {editable && (
                    <button onClick={() => editable.onDeleteEducation(e.id)} className="p-1 text-slate-300 hover:text-rose-600" aria-label="Remove education">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Certifications"
            icon={Award}
            action={editable && <SectionButton onClick={() => editable.onManage('certificates')}>Manage</SectionButton>}
          >
            {profile.certificates.length === 0 && <Empty text="No certificates yet." />}
            <div className="space-y-3">
              {profile.certificates.map((c) => (
                <div key={c.id}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {[c.issuer, c.issuedDate && new Date(c.issuedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="GitHub" icon={Github}>
            {profile.githubUsername ? (
              <div className="space-y-2 text-xs">
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-blue-600 hover:underline"
                >
                  @{profile.githubUsername}
                </a>
                <div className="flex justify-between text-slate-600">
                  <span>Public commits</span>
                  <span className="font-mono font-bold tabular-nums">{profile.totalGithubCommits}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Repositories</span>
                  <span className="font-mono font-bold tabular-nums">{profile.repositoryCount ?? 0}</span>
                </div>
              </div>
            ) : (
              <Empty text={editable ? 'Link your GitHub username via “Edit intro”.' : 'Not linked.'} />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};
