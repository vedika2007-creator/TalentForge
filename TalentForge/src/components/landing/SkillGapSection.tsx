import React from 'react';
import { Compass, Check, X, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export const SkillGapSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const competencies = [
    { name: 'Python Core', status: 'verified', label: 'Verified (95% Strength)' },
    { name: 'NumPy & Linear Algebra', status: 'verified', label: 'Verified (92% Strength)' },
    { name: 'Pandas & Data Wrangling', status: 'verified', label: 'Verified (94% Strength)' },
    { name: 'Machine Learning Fundamentals', status: 'verified', label: 'Verified (93% Strength)' },
    { name: 'SQL & Feature Stores', status: 'verified', label: 'Verified (90% Strength)' },
    { name: 'Deep Learning & Neural Nets', status: 'missing', label: 'Missing Capstone Verification' },
  ];

  const recommendedNext = [
    { step: '01', title: 'Deep Learning with PyTorch', description: 'Train CNN / Vision Transformer and submit laboratory benchmark report.' },
    { step: '02', title: 'TensorFlow & Model Quantization', description: 'Quantize an INT8 model for edge Android/iOS execution.' },
    { step: '03', title: 'Model Deployment & MLOps', description: 'Package inference pipeline inside Docker container with FastAPI endpoints.' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Targeted Skill Gap Analysis
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Close the Gap to Industry Readiness
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Stop guessing what courses to take. TALENTFORGE analyzes employer job specs and pinpoints the exact missing evidence required for candidate shortlisting.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-left">
          {/* Target Role Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Target Industry Role
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Machine Learning Engineer
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Readiness Index:</span>
              <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                83% Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Left: Required Competencies Matrix */}
            <div className="lg:col-span-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Required Role Competency Matrix
              </p>
              <div className="space-y-2">
                {competencies.map((comp) => (
                  <div
                    key={comp.name}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      comp.status === 'verified'
                        ? 'bg-slate-50/80 border-slate-200/80 text-slate-800'
                        : 'bg-rose-50/50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {comp.status === 'verified' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✕
                        </div>
                      )}
                      <span className="font-semibold">{comp.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 font-mono">
                      {comp.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Recommended Next Skills & Roadmap */}
            <div className="lg:col-span-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Recommended Evidence Next Steps
              </p>

              <div className="space-y-3">
                {recommendedNext.map((rec) => (
                  <div
                    key={rec.step}
                    className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/80 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      {rec.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/skills-evidence')}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Full Learning Roadmap →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
