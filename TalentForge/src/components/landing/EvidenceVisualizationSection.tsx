import React, { useState } from 'react';
import { ShieldCheck, GitBranch, FolderGit2, FileCode2, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const EvidenceVisualizationSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [activeSkill, setActiveSkill] = useState<'python' | 'react' | 'ml'>('python');

  const skillsData = {
    python: {
      title: 'Python Core & Architecture',
      overallStrength: 91,
      category: 'Backend & Data Engineering',
      sources: [
        { label: 'Verified Projects Built', value: 92, count: '6 Projects with Code Review', icon: FolderGit2, color: 'bg-blue-600' },
        { label: 'GitHub Activity & PRs', value: 89, count: '320 Verified Commits', icon: GitBranch, color: 'bg-cyan-600' },
        { label: 'Proctored Assessments', value: 95, count: 'Top 5% in Algorithms Challenge', icon: FileCode2, color: 'bg-purple-600' },
        { label: 'Accredited Certificates', value: 84, count: '2 Professional Certifications', icon: Award, color: 'bg-indigo-600' },
      ],
      facultyEndorsed: true,
      facultyVerifier: 'Prof. Ramesh Kulkarni, CS Dept.',
    },
    react: {
      title: 'React & Frontend Architecture',
      overallStrength: 88,
      category: 'Client Engineering',
      sources: [
        { label: 'Verified Projects Built', value: 90, count: '5 Web Applications', icon: FolderGit2, color: 'bg-blue-600' },
        { label: 'GitHub Activity & PRs', value: 85, count: '210 Frontend Commits', icon: GitBranch, color: 'bg-cyan-600' },
        { label: 'Proctored Assessments', value: 88, count: 'Component Lifecycle & State', icon: FileCode2, color: 'bg-purple-600' },
        { label: 'Accredited Certificates', value: 80, count: 'Frontend Specialist Certificate', icon: Award, color: 'bg-indigo-600' },
      ],
      facultyEndorsed: true,
      facultyVerifier: 'Dr. Sunita Rao, Systems Chair',
    },
    ml: {
      title: 'Machine Learning & Computer Vision',
      overallStrength: 93,
      category: 'Applied AI Research',
      sources: [
        { label: 'Verified Projects Built', value: 94, count: '5 Models Trained & Deployed', icon: FolderGit2, color: 'bg-blue-600' },
        { label: 'GitHub Activity & PRs', value: 90, count: '280 Model Architecture Commits', icon: GitBranch, color: 'bg-cyan-600' },
        { label: 'Proctored Assessments', value: 96, count: 'Deep Learning & Tensor Algebra', icon: FileCode2, color: 'bg-purple-600' },
        { label: 'Accredited Certificates', value: 88, count: '3 Neural Systems Certificates', icon: Award, color: 'bg-indigo-600' },
      ],
      facultyEndorsed: true,
      facultyVerifier: 'Dr. Arvind Swaminathan, AgriTech Lab',
    },
  };

  const current = skillsData[activeSkill];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Algorithmic Proof Decomposition
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Skill Evidence Visualization
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Every skill confidence score is transparently backed by auditable evidence layers. Zero guesswork.
            </p>
          </div>

          {/* Selector */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 self-start md:self-end">
            <button
              onClick={() => setActiveSkill('python')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSkill === 'python' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python (91%)
            </button>
            <button
              onClick={() => setActiveSkill('react')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSkill === 'react' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              React (88%)
            </button>
            <button
              onClick={() => setActiveSkill('ml')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSkill === 'ml' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Machine Learning (93%)
            </button>
          </div>
        </div>

        {/* Evidence Visualizer Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left overview */}
            <div className="lg:col-span-4 space-y-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {current.category}
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                {current.title}
              </h3>
              
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-white border border-blue-100">
                <span className="text-xs text-slate-500 font-medium">Calculated Evidence Strength</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-blue-600 font-mono tabular-nums">
                    {current.overallStrength}%
                  </span>
                  <span className="text-xs font-semibold text-slate-600">High Confidence</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Passes high-signal threshold (&gt;85%) required for direct employer interview matching.
                </p>
              </div>

              {/* Faculty Verification Pill */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Faculty Verified ✓</p>
                  <p className="text-[11px] text-emerald-800">{current.facultyVerifier}</p>
                </div>
              </div>
            </div>

            {/* Right: The Progress Bars (as explicitly specified in user prompt) */}
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Multi-Modal Evidence Decomposition
              </p>

              {current.sources.map((src, idx) => {
                const Icon = src.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{src.label}</span>
                      </span>
                      <span className="font-mono text-blue-600 tabular-nums font-bold">
                        {src.value}%
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${src.color} h-full rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${src.value}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{src.count}</span>
                      <span className="text-emerald-600 font-medium">✓ Cryptographically Audited</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
