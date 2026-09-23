import React, { useState } from 'react';
import { ShieldCheck, GitBranch, FolderGit2, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { MOCK_STUDENTS } from '../../data/mockData';
import { StudentProfile, SkillEvidence } from '../../types';
import { SkillEvidenceModal } from '../common/SkillEvidenceModal';

interface StudentShowcaseProps {
  onNavigate: (path: string) => void;
}

export const StudentShowcaseSection: React.FC<StudentShowcaseProps> = ({ onNavigate }) => {
  const [selectedSkill, setSelectedSkill] = useState<{ skill: SkillEvidence; studentName: string } | null>(null);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Verified Candidate Profiles
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Student Showcase
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Real students from partner engineering institutes demonstrating production readiness through authenticated repositories and faculty endorsements.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/discover')}
            className="self-start md:self-end px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>View All Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_STUDENTS.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 p-5 flex flex-col justify-between text-left group"
            >
              <div>
                {/* Avatar & Confidence Score */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white">
                      ✓
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                      Skill Confidence
                    </span>
                    <span className="text-xl font-mono font-bold text-blue-600 tabular-nums">
                      {student.overallScore}%
                    </span>
                  </div>
                </div>

                {/* Name and Target Role */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {student.name}
                </h3>
                <p className="text-xs font-semibold text-slate-600 mb-1">
                  {student.targetRole}
                </p>
                <p className="text-[11px] text-slate-400 mb-4">
                  {student.college} · Class of {student.batchYear}
                </p>

                {/* Unboxed clean skill list (Anti-slop: zero pill sandwich) */}
                <div className="py-2.5 border-t border-slate-100 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Demonstrated Competencies
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700">
                    {student.skills.slice(0, 3).map((sk, idx) => (
                      <React.Fragment key={sk.id}>
                        <button
                          onClick={() => setSelectedSkill({ skill: sk, studentName: student.name })}
                          className="hover:text-blue-600 hover:underline text-left font-medium"
                          title="Click to view evidence sources"
                        >
                          {sk.skillName}
                        </button>
                        {idx < Math.min(student.skills.length, 3) - 1 && (
                          <span className="text-slate-300" aria-hidden="true">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Evidence Metrics */}
                <div className="space-y-1.5 py-2.5 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                      Projects Built
                    </span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {student.projectCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      GitHub Commits
                    </span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {student.totalGithubCommits}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Faculty Verified
                    </span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {student.verifiedCount} Skills
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedSkill({ skill: student.skills[0], studentName: student.name })}
                  className="w-full py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50/70 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Inspect Evidence Matrix</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <SkillEvidenceModal
        isOpen={!!selectedSkill}
        skill={selectedSkill?.skill || null}
        studentName={selectedSkill?.studentName || ''}
        onClose={() => setSelectedSkill(null)}
      />
    </section>
  );
};
