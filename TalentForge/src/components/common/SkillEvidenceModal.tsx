import React from 'react';
import { X, ShieldCheck, CheckCircle2, GitBranch, FolderGit2, Award, FileCode2, ExternalLink } from 'lucide-react';
import { SkillEvidence } from '../../types';

interface SkillEvidenceModalProps {
  isOpen: boolean;
  skill: SkillEvidence | null;
  studentName: string;
  onClose: () => void;
}

export const SkillEvidenceModal: React.FC<SkillEvidenceModalProps> = ({
  isOpen,
  skill,
  studentName,
  onClose,
}) => {
  if (!isOpen || !skill) return null;

  const { evidenceSources, weightBreakdown } = skill;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {skill.category}
              </span>
              {skill.status === 'verified' && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Faculty Verified
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {skill.skillName} Evidence Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Candidate: <span className="font-semibold text-slate-800">{studentName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Overall Confidence Score Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-white border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-medium">Calculated Evidence Strength</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                <span className="font-mono tabular-nums text-blue-600">{skill.confidenceScore}%</span>
                <span className="text-xs font-normal text-slate-500 ml-1.5">Proven Capability</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Computed via TALENTFORGE Weighted Evidence Algorithm (Python Core)
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Index</span>
              <span className="text-lg font-mono font-bold">{skill.confidenceScore}</span>
            </div>
          </div>

          {/* Evidence Sources Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Substantiating Evidence Sources
            </h4>

            {/* Source 1: Projects */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  <span>Capstone & Production Projects ({evidenceSources.projectsCount})</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Weight: {weightBreakdown.projects}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '92%' }} />
              </div>
              <p className="text-[11px] text-slate-500">
                Validated in multiple real-world repositories with working demos.
              </p>
            </div>

            {/* Source 2: GitHub Contributions */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  <span>GitHub Contributions & Commits ({evidenceSources.githubContributions})</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Weight: {weightBreakdown.github}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-cyan-600 h-full rounded-full" style={{ width: '88%' }} />
              </div>
              <p className="text-[11px] text-slate-500">
                Code commit frequency, pull request reviews, and issue triage activity.
              </p>
            </div>

            {/* Source 3: Assessment */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-purple-600" />
                  <span>Standardized Code Assessments ({evidenceSources.assessmentsCompleted})</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Weight: {weightBreakdown.assessment}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '94%' }} />
              </div>
              <p className="text-[11px] text-slate-500">
                Proctored timed algorithmic and architecture problem evaluations.
              </p>
            </div>

            {/* Source 4: Faculty Verification */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-950">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Faculty & Department Endorsement</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700">
                  Weight: {weightBreakdown.faculty}%
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                {evidenceSources.facultyVerified
                  ? `Endorsed by ${evidenceSources.verifierName} · Verified on ${evidenceSources.verifiedDate}`
                  : 'Pending faculty laboratory review'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Cryptographically signed verification hash</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
