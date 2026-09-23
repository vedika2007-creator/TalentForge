import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  GitBranch,
  FileCheck,
  Star,
  Search,
} from 'lucide-react';

export const RecruiterMatchingSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<'aarav' | 'priya'>('aarav');

  const candidatesData = {
    aarav: {
      name: 'Aarav Mehta',
      role: 'Python Backend Developer',
      college: 'Apex Institute of Technology (2026)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      matchScore: 94,
      skills: [
        { name: 'Python', checked: true, score: '94% capability' },
        { name: 'Django & REST APIs', checked: true, score: '92% capability' },
        { name: 'PostgreSQL', checked: true, score: '90% capability' },
        { name: 'Docker / Linux', checked: true, score: '88% capability' },
      ],
      evidence: [
        { label: '6 Production Projects', status: 'Verified', icon: FolderGit2 },
        { label: '320+ Public GitHub Commits', status: 'Synced', icon: GitBranch },
        { label: 'Timed Sandbox Code Assessment', status: 'Score 96%', icon: FileCheck },
        { label: 'CS Department Faculty Endorsement', status: 'Signed', icon: ShieldCheck },
      ],
    },
    priya: {
      name: 'Priya Sharma',
      role: 'Machine Learning Engineer',
      college: 'National Institute of Engineering (2026)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      matchScore: 96,
      skills: [
        { name: 'Python & NumPy', checked: true, score: '95% capability' },
        { name: 'Machine Learning / PyTorch', checked: true, score: '93% capability' },
        { name: 'Computer Vision / OpenCV', checked: true, score: '92% capability' },
        { name: 'FastAPI Serving', checked: true, score: '89% capability' },
      ],
      evidence: [
        { label: '5 ML Research Projects', status: 'Verified', icon: FolderGit2 },
        { label: '280+ Public Model Commits', status: 'Synced', icon: GitBranch },
        { label: 'National Hackathon Winner', status: 'Validated', icon: Star },
        { label: 'AgriTech Lab Faculty Endorsement', status: 'Signed', icon: ShieldCheck },
      ],
    },
  };

  const current = candidatesData[selectedCandidate];

  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl text-left mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Hiring Intelligence & Automated Pipeline
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Recruiter Match Engine
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Eliminate resume hallucination. Match roles against verified student code, proctored benchmarks, and academic faculty endorsements.
          </p>
        </div>

        {/* Interactive Recruiter Preview Box */}
        <div className="bg-slate-50/70 rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          {/* Top Bar of Recruiter Tool */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">
                  Target Role: {selectedCandidate === 'aarav' ? 'Python Backend Developer' : 'Machine Learning Engineer'}
                </p>
                <p className="text-xs text-slate-500">
                  Search criteria: Required Skills + Minimum 3 Verified Projects + Faculty Sign-Off
                </p>
              </div>
            </div>

            {/* Candidate Selector Switch */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedCandidate('aarav')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedCandidate === 'aarav'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aarav Mehta (94%)
              </button>
              <button
                onClick={() => setSelectedCandidate('priya')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedCandidate === 'priya'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Priya Sharma (96%)
              </button>
            </div>
          </div>

          {/* Main Comparison Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
            {/* Left: Candidate Profile & Match Circular Ring */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 text-left space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={current.avatar}
                  alt={current.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {current.name}
                  </h3>
                  <p className="text-xs text-slate-500">{current.college}</p>
                </div>
              </div>

              {/* Match Score Display */}
              <div className="p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                    Weighted Match Score
                  </span>
                  <span className="text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
                    {current.matchScore}%
                  </span>
                  <span className="text-xs text-slate-600 block mt-0.5">
                    Exceptional Capability Fit
                  </span>
                </div>

                {/* Animated Radial Indicator */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#e2e8f0"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#2563eb"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={163}
                      strokeDashoffset={163 - (163 * current.matchScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <TrendingUp className="w-5 h-5 text-blue-600 absolute" />
                </div>
              </div>

              <button
                onClick={() => onNavigate('/recruiter')}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Access Recruiter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Verified Skills & Evidence Checklist */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Box 1: Required Skills Alignment */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Required Skills Assessment
                </p>
                <div className="space-y-2.5">
                  {current.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0"
                    >
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        {skill.name}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px] tabular-nums">
                        {skill.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Verified Evidence Checklist */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Substantiating Evidence
                </p>
                <div className="space-y-2.5">
                  {current.evidence.map((ev, idx) => {
                    const EvIcon = ev.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0"
                      >
                        <span className="flex items-center gap-2 text-slate-700">
                          <EvIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate">{ev.label}</span>
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                          {ev.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
