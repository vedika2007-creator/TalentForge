import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  TrendingUp,
  FolderGit2,
  GitBranch,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Plus,
} from 'lucide-react';
import { talentforgeApi } from '../services/api';
import { AuthUser, StudentProfile, SkillEvidence } from '../types';
import { Avatar } from '../components/common/ui';
import { SkillEvidenceModal } from '../components/common/SkillEvidenceModal';

export const RecruiterDashboardPage: React.FC<{ user: AuthUser; onNavigate: (path: string) => void }> = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [minMatch, setMinMatch] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<{ skill: SkillEvidence; studentName: string } | null>(null);

  useEffect(() => {
    talentforgeApi.getStudents().then(setStudents).catch((e) => setError(e.message));
    talentforgeApi.getShortlist().then(setShortlist).catch((e) => setError(e.message));
  }, []);

  const handleToggleShortlist = async (id: string) => {
    try {
      setShortlist(await talentforgeApi.toggleShortlist(id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const filteredStudents = students.filter(s => {
    if (s.overallScore < minMatch) return false;
    if (searchSkill) {
      const q = searchSkill.toLowerCase();
      const matchSkill = s.skills.some(sk => sk.skillName.toLowerCase().includes(q));
      const matchRole = s.targetRole.toLowerCase().includes(q);
      const matchName = s.name.toLowerCase().includes(q);
      if (!matchSkill && !matchRole && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full">
                Recruiter Portal
              </span>
              <span className="text-xs font-medium text-slate-500">
                Talent Intelligence Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Candidate Discovery & Matching
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Source student talent filtered by real commits, capstones, and faculty sign-offs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-100 text-center">
              <span className="text-[10px] uppercase font-bold text-cyan-700 block">
                Shortlisted
              </span>
              <span className="text-2xl font-extrabold text-cyan-700 font-mono tabular-nums">
                {shortlist.length} Candidates
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Skill Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by skill (e.g. Python, React, Machine Learning, Django)..."
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-600 text-slate-900"
            />
          </div>

          {/* Min Match Slider */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Min Capability Index:</span>
            <input
              type="range"
              min="0"
              max="95"
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-24 accent-cyan-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-cyan-700 tabular-nums">{minMatch}%</span>
          </div>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const isShortlisted = shortlist.includes(student.id);
            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-cyan-400 transition-all p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={student.avatar} name={student.name} className="w-12 h-12 rounded-2xl" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-xs text-slate-500">{student.college}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleShortlist(student.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isShortlisted
                          ? 'bg-cyan-50 text-cyan-700'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                    >
                      {isShortlisted ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-cyan-50/70 to-blue-50/50 rounded-xl border border-cyan-100 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-800 block">
                        Demonstrated Target Role
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {student.targetRole}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-mono font-bold text-cyan-700 tabular-nums">
                        {student.overallScore}%
                      </span>
                      <span className="text-[9px] text-slate-500 block">Match</span>
                    </div>
                  </div>

                  {/* Skills tags (clean unboxed text with separators) */}
                  <div className="py-2 border-t border-slate-100 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Verified Capabilities:
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 font-medium">
                      {student.skills.map((sk, idx) => (
                        <React.Fragment key={sk.id}>
                          <button
                            onClick={() => setSelectedSkill({ skill: sk, studentName: student.name })}
                            className="hover:text-cyan-700 hover:underline text-left"
                          >
                            {sk.skillName}
                          </button>
                          {idx < student.skills.length - 1 && <span className="text-slate-300">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Evidence counters */}
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
                      {student.verifiedCount} Endorsed
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={student.skills.length === 0}
                    onClick={() => setSelectedSkill({ skill: student.skills[0], studentName: student.name })}
                    className="text-xs font-semibold text-cyan-700 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Evidence</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleToggleShortlist(student.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isShortlisted
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isShortlisted ? 'Shortlisted ✓' : '+ Shortlist'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence detail modal */}
      <SkillEvidenceModal
        isOpen={!!selectedSkill}
        skill={selectedSkill?.skill || null}
        studentName={selectedSkill?.studentName || ''}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  );
};
