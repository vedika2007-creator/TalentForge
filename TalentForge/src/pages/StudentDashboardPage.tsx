import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Plus, Github, Compass, Clock, Briefcase, X } from 'lucide-react';
import { AuthUser, ProjectItem, SkillEvidence, VerificationRequest } from '../types';
import { SkillEvidenceModal } from '../components/common/SkillEvidenceModal';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../components/common/ui';
import { talentforgeApi } from '../services/api';
import { useApi } from '../hooks/useApi';
import { timeAgo } from '../lib/format';
import confetti from 'canvas-confetti';

const DOMAINS: ProjectItem['domain'][] = ['Web Development', 'AI & Machine Learning', 'Cloud & Systems', 'Mobile', 'Cybersecurity'];

const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 bg-white';

export const StudentDashboardPage: React.FC<{ user: AuthUser; onNavigate: (path: string) => void }> = ({ user }) => {
  const profile = useApi(() => talentforgeApi.getMyProfile(), [user.id]);
  const projects = useApi(() => talentforgeApi.getProjects({ authorId: user.id }), [user.id]);
  const requests = useApi(() => talentforgeApi.getVerificationRequests({ studentId: user.id }), [user.id]);
  const opportunities = useApi(() => talentforgeApi.getMyOpportunities(), [user.id]);
  const [selectedSkill, setSelectedSkill] = useState<SkillEvidence | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectTagline, setNewProjectTagline] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState<ProjectItem['domain']>('Web Development');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectRepo, setNewProjectRepo] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await talentforgeApi.submitProject({
        title: newProjectTitle,
        tagline: newProjectTagline || undefined,
        domain: newProjectDomain,
        github_url: newProjectRepo || undefined,
        technologies: newProjectTech.split(',').map((t) => t.trim()).filter(Boolean),
      });
      projects.setData([created, ...(projects.data || [])]);
      profile.reload();
      requests.reload();
      setIsSubmitModalOpen(false);
      setNewProjectTitle('');
      setNewProjectTagline('');
      setNewProjectTech('');
      setNewProjectRepo('');
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {
        // ignore
      }
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (profile.error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState message={profile.error} onRetry={profile.reload} />
      </div>
    );
  }
  const student = profile.data;
  if (!student) return <LoadingState label="Loading your evidence profile…" />;

  const myProjects = projects.data || [];
  const topOpportunity = opportunities.data?.[0];
  const completionChecks = [
    !!student.headline,
    !!student.bio,
    !!student.githubUsername,
    student.skills.length > 0,
    myProjects.length > 0,
    myProjects.some((p) => p.isFacultyVerified),
    student.skills.some((sk) => sk.status === 'verified'),
  ];
  const completion = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);
  const requestByProject = new Map<string, VerificationRequest>((requests.data || []).filter((r) => r.projectId).map((r) => [r.projectId!, r] as [string, VerificationRequest]));

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar
              src={student.avatar}
              name={student.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-md"
              textClass="text-xl"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{student.name}</h1>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">Student Portal</span>
              </div>
              <p className="text-sm font-medium text-slate-600 mt-0.5">
                {student.headline || 'Add a headline to your profile'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {[student.college, student.batchYear && `Class of ${student.batchYear}`, student.location]
                  .filter(Boolean)
                  .join(' · ') || user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">Skill Confidence</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
                {student.overallScore}%
              </span>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Project</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Evidence Profile Completion: {completion}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {completion === 100
                ? 'Your evidence profile is complete. Recruiters see you as fully verified.'
                : myProjects.some((p) => p.isFacultyVerified)
                  ? 'Get more skills faculty-verified to raise your recruiter visibility.'
                  : 'Submit a project for faculty review to unlock the Verified Recruiter Badge.'}
            </p>
          </div>
          <div className="w-full sm:w-64 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Skills & Projects */}
          <div className="lg:col-span-8 space-y-8 text-left">
            {/* My Verified Skills */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">My Verified Skills & Evidence</h2>
                  <p className="text-xs text-slate-500">Click any skill to inspect the underlying multi-modal proof algorithm.</p>
                </div>
                <span className="text-xs font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                  {student.skills.filter((s) => s.status === 'verified').length} / {student.skills.length} Verified
                </span>
              </div>

              {student.skills.length === 0 && (
                <EmptyState
                  title="No evidenced skills yet"
                  hint="Skills appear here once your projects and assessments are reviewed by faculty."
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {student.skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all bg-white group flex flex-col justify-between text-left"
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase text-slate-400">{skill.category}</span>
                        <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded tabular-nums">
                          {skill.confidenceScore}% Strength
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {skill.skillName}
                      </h3>
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          style={{ width: `${skill.confidenceScore}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                        <span>{skill.evidenceSources.projectsCount} Projects</span>
                        <span aria-hidden="true">·</span>
                        <span>{skill.evidenceSources.githubContributions} Commits</span>
                      </div>
                    </div>

                    <div className="w-full pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {skill.status === 'verified' ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Faculty Verified
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Review Pending
                        </span>
                      )}
                      <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">Details →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* My Projects */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">My Projects & Artifacts ({myProjects.length})</h2>
                  <p className="text-xs text-slate-500">Repositories and demos attached to your proof portfolio.</p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {projects.loading && !projects.data && <LoadingState />}
                {projects.error && <ErrorState message={projects.error} onRetry={projects.reload} />}
                {projects.data && myProjects.length === 0 && (
                  <EmptyState
                    title="No projects yet"
                    hint="Submit your first project — it goes straight to the faculty verification queue."
                  />
                )}
                {myProjects.map((project) => {
                  const req = requestByProject.get(project.id);
                  return (
                    <div
                      key={project.id}
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all bg-white text-left space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                            {project.isFacultyVerified ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Faculty Verified
                              </span>
                            ) : req?.status === 'changes_requested' ? (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                Revisions Requested
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                Pending Mentor Sign-off
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{project.tagline}</p>
                        </div>

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Code</span>
                          </a>
                        )}
                      </div>

                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 font-mono">
                          {project.technologies.map((t, idx) => (
                            <React.Fragment key={t}>
                              <span>{t}</span>
                              {idx < project.technologies.length - 1 && <span className="text-slate-300">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      {project.verifiedBy ? (
                        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          Verified by <strong>{project.verifiedBy}</strong> on {project.verificationDate}
                        </p>
                      ) : req?.status === 'changes_requested' && req.notes ? (
                        <p className="text-[11px] text-rose-700 pt-2 border-t border-slate-100">
                          <strong>{req.reviewerName || 'Faculty'}:</strong> {req.notes}
                        </p>
                      ) : req ? (
                        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                          Submitted for review {timeAgo(req.submittedAt).toLowerCase()}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6 text-left">
            {/* GitHub Evidence Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-slate-900" />
                  <h3 className="text-sm font-bold text-slate-900">GitHub Intelligence</h3>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
                    student.githubUsername ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                  }`}
                >
                  {student.githubUsername ? 'Synced' : 'Not linked'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Username</span>
                  <span className="font-mono font-bold text-slate-800">
                    {student.githubUsername ? `@${student.githubUsername}` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Public Commits</span>
                  <span className="font-mono font-bold text-blue-600 tabular-nums">{student.totalGithubCommits}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Active Repositories</span>
                  <span className="font-mono font-bold text-slate-800 tabular-nums">{student.repositoryCount ?? 0} Repos</span>
                </div>
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Skill Gap{topOpportunity ? `: ${topOpportunity.company}` : ''}
                </h3>
              </div>
              {topOpportunity ? (
                <>
                  <p className="text-xs text-slate-500">
                    To strengthen your match for <strong>{topOpportunity.title}</strong>:
                  </p>
                  <div className="space-y-2 pt-1 text-xs">
                    {topOpportunity.missingSkills.length === 0 && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-medium">
                        You cover every required skill. Get them faculty-verified to boost your score.
                      </div>
                    )}
                    {topOpportunity.missingSkills.map((skill) => (
                      <div
                        key={skill}
                        className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800">{skill}</span>
                        <span className="text-blue-600 font-semibold text-[11px]">Recommended</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">No open roles to compare against yet.</p>
              )}
            </div>

            {/* Recruiter Matches */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recruiter Matches</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{opportunities.data?.length ?? 0} Open</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {opportunities.error && <p className="text-xs text-rose-600">{opportunities.error}</p>}
                {opportunities.data?.slice(0, 4).map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{opp.company}</span>
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          opp.match >= 80
                            ? 'text-emerald-600 bg-emerald-50'
                            : opp.match >= 50
                              ? 'text-amber-600 bg-amber-50'
                              : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        {opp.match}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{opp.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {opp.locationType} · {opp.requiredSkills.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SkillEvidenceModal
        isOpen={!!selectedSkill}
        skill={selectedSkill}
        studentName={student.name}
        onClose={() => setSelectedSkill(null)}
      />

      {/* Submit Project Modal */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Project for Verification</h3>
                <p className="text-xs text-slate-500">It will appear in the faculty verification queue immediately.</p>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Engine"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">One-line Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Raft-based key-value store with automatic leader election"
                  value={newProjectTagline}
                  onChange={(e) => setNewProjectTagline(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Domain</label>
                <select
                  value={newProjectDomain}
                  onChange={(e) => setNewProjectDomain(e.target.value as ProjectItem['domain'])}
                  className={inputClass}
                >
                  {DOMAINS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Technologies Used (comma-separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, FastAPI, Docker, Redis"
                  value={newProjectTech}
                  onChange={(e) => setNewProjectTech(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/repo"
                  value={newProjectRepo}
                  onChange={(e) => setNewProjectRepo(e.target.value)}
                  className={inputClass}
                />
              </div>

              {submitError && <p className="text-xs text-rose-600">{submitError}</p>}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-xs"
                >
                  {submitting ? 'Submitting…' : 'Submit for Faculty Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
