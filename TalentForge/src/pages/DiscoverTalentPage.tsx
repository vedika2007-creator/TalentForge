import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  FolderGit2,
  GitBranch,
  Star,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { talentforgeApi } from '../services/api';
import { useApi } from '../hooks/useApi';
import { ErrorState, LoadingState } from '../components/common/ui';
import { SkillEvidence } from '../types';
import { SkillEvidenceModal } from '../components/common/SkillEvidenceModal';

export const DiscoverTalentPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalSkill, setSelectedModalSkill] = useState<{ skill: SkillEvidence; studentName: string } | null>(null);

  const skillTabs = ['All', 'Python', 'React', 'Machine Learning', 'Docker', 'PostgreSQL'];

  const studentsApi = useApi(() => talentforgeApi.getStudents(), []);
  const filtered = (studentsApi.data || []).filter(s => {
    if (verifiedOnly && s.verifiedCount < 3) return false;
    if (selectedSkillFilter !== 'All') {
      const hasSkill = s.skills.some(sk => sk.skillName.toLowerCase().includes(selectedSkillFilter.toLowerCase()));
      if (!hasSkill) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRole = s.targetRole.toLowerCase().includes(q);
      const matchCollege = s.college.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchCollege) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Talent Directory
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Discover Verified Talent
          </h1>
          <p className="text-base text-slate-600 mt-2">
            Explore students whose capabilities have been validated by university faculty code audits, public repository commits, and proctored technical evaluations.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, role, or institute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
              {skillTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedSkillFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedSkillFilter === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                verifiedOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>High Verification Only</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filtered.length}</span> verified candidates
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentsApi.loading && !studentsApi.data && <div className="col-span-full"><LoadingState /></div>}
          {studentsApi.error && <div className="col-span-full"><ErrorState message={studentsApi.error} onRetry={studentsApi.reload} /></div>}
          {filtered.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-300 p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-xs text-slate-500">{student.college}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-blue-600 tabular-nums">
                      {student.overallScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">Capability</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-800 mb-2">
                  {student.targetRole}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {student.bio}
                </p>

                {/* Demonstrated Competencies (unboxed metadata with separators) */}
                <div className="py-2.5 border-t border-slate-100 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Skills with Evidence
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 font-medium">
                    {student.skills.map((sk, idx) => (
                      <React.Fragment key={sk.id}>
                        <button
                          onClick={() => setSelectedModalSkill({ skill: sk, studentName: student.name })}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {sk.skillName}
                        </button>
                        {idx < student.skills.length - 1 && <span className="text-slate-300">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Evidence Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                    {student.projectCount} Projects
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    {student.totalGithubCommits} Commits
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {student.verifiedCount} Verified
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedModalSkill({ skill: student.skills[0], studentName: student.name })}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Evidence</span>
                </button>

                <button
                  onClick={() => onNavigate('/recruiter')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Connect Candidate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SkillEvidenceModal
        isOpen={!!selectedModalSkill}
        skill={selectedModalSkill?.skill || null}
        studentName={selectedModalSkill?.studentName || ''}
        onClose={() => setSelectedModalSkill(null)}
      />
    </div>
  );
};
