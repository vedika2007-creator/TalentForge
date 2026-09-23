import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  Binary,
  Target,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Claim',
      subtitle: 'Student specifies capability',
      icon: Sparkles,
      iconBg: 'bg-blue-50 text-blue-600',
      description: 'The student registers claimed competencies (e.g. Python, Distributed Systems, React) into their learning portfolio.',
      tag: 'Step 1: Declaration',
    },
    {
      step: '02',
      title: 'Evidence',
      subtitle: 'Multi-source validation data',
      icon: GitBranch,
      iconBg: 'bg-cyan-50 text-cyan-600',
      description: 'The platform ingests supporting artifacts: public GitHub commit history, capstone repositories, and proctored challenge scores.',
      tag: 'Step 2: Artifacts',
    },
    {
      step: '03',
      title: 'Verify',
      subtitle: 'Faculty and mentor review',
      icon: ShieldCheck,
      iconBg: 'bg-purple-50 text-purple-600',
      description: 'College department professors examine code quality, design choices, and laboratory viva results, attaching cryptographic endorsements.',
      tag: 'Step 3: Academic Review',
    },
    {
      step: '04',
      title: 'Score',
      subtitle: 'Python evidence engine',
      icon: Binary,
      iconBg: 'bg-emerald-50 text-emerald-600',
      description: 'A mathematical weighting model evaluates artifact recency, commit density, and faculty consensus to compute an objective confidence score.',
      tag: 'Step 4: Algorithmic Scoring',
    },
    {
      step: '05',
      title: 'Match',
      subtitle: 'High-signal candidate discovery',
      icon: Target,
      iconBg: 'bg-indigo-50 text-indigo-600',
      description: 'Hiring teams and recruiters filter talent based on real demonstrated capability benchmarks rather than keyword-dense CVs.',
      tag: 'Step 5: Talent Pipeline',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 border-t border-slate-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl text-left mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            The Verification Pipeline
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How TALENTFORGE Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-2">
            A deterministic five-phase pipeline translating declared student interest into verifiable enterprise readiness.
          </p>
        </div>

        {/* Process Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isSelected = activeStep === index;
            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(index)}
                className={`p-5 rounded-2xl border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-blue-400 shadow-md ring-2 ring-blue-500/10'
                    : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {item.step}
                    </span>
                    <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">{item.tag}</span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden md:block shrink-0 ml-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Details Card */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Deterministic Evidence Formula
              </p>
              <p className="text-xs text-slate-500">
                Score = 0.35(Projects) + 0.25(GitHub Commits) + 0.20(Proctored Test) + 0.20(Faculty Endorsement)
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/skills-evidence')}
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
          >
            Explore Scoring Engine →
          </button>
        </div>
      </div>
    </section>
  );
};
