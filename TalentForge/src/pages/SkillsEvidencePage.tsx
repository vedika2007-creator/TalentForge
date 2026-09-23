import React, { useState } from 'react';
import {
  ShieldCheck,
  Binary,
  FolderGit2,
  GitBranch,
  FileCode2,
  Award,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const SkillsEvidencePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  // Interactive Python formula simulator state
  const [projectsScore, setProjectsScore] = useState(90);
  const [githubScore, setGithubScore] = useState(85);
  const [assessmentScore, setAssessmentScore] = useState(95);
  const [facultyEndorsed, setFacultyEndorsed] = useState(true);

  // Calculate weighted confidence score
  // 35% Projects, 25% GitHub, 20% Proctored Assessment, 20% Faculty Endorsement
  const calculatedScore = Math.round(
    0.35 * projectsScore +
    0.25 * githubScore +
    0.20 * assessmentScore +
    0.20 * (facultyEndorsed ? 100 : 0)
  );

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <Binary className="w-3.5 h-3.5" />
            <span>Python-Powered Capability Scoring Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Evidence Architecture & Scoring
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            TALENTFORGE bridges self-reported claims and enterprise trust. Our multi-modal verification model decomposes every claimed competency into mathematically provable, immutable layers.
          </p>
        </div>

        {/* The 5 Layers of Truth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Production Projects</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Working codebases with test coverage, continuous integration workflows, and demonstrable architecture.
            </p>
            <div className="text-[11px] font-mono text-blue-600 font-bold">Weight: 35%</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. GitHub Commits</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Public commit cadence, semantic commit history, pull request discussions, and open-source contributions.
            </p>
            <div className="text-[11px] font-mono text-cyan-600 font-bold">Weight: 25%</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Proctored Testing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Timed sandbox coding challenges evaluating time complexity, space complexity, and idiomatic conventions.
            </p>
            <div className="text-[11px] font-mono text-purple-600 font-bold">Weight: 20%</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4. Faculty Sign-Off</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Academic review by university professors assessing lab reports, viva performance, and original engineering.
            </p>
            <div className="text-[11px] font-mono text-emerald-600 font-bold">Weight: 20%</div>
          </div>
        </div>

        {/* Interactive Python Formula Simulator */}
        <div className="bg-slate-50/80 rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <Sliders className="w-4 h-4" />
                <span>Interactive Capability Calculator</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Test the Scoring Engine Live
              </h2>
              <p className="text-xs text-slate-500">
                Adjust artifact inputs to observe real-time algorithmic calculation.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-200 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Calculated Evidence Strength
              </span>
              <span className="text-3xl font-extrabold text-blue-600 font-mono tabular-nums">
                {calculatedScore}%
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                {calculatedScore >= 85 ? 'Verified High Confidence ✓' : 'Needs More Evidence'}
              </span>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Projects Code Quality & Complexity (35%)</span>
                <span className="font-mono text-blue-600">{projectsScore}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={projectsScore}
                onChange={(e) => setProjectsScore(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>GitHub Commit Frequency & Recency (25%)</span>
                <span className="font-mono text-cyan-600">{githubScore}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={githubScore}
                onChange={(e) => setGithubScore(Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Proctored Assessment Benchmark (20%)</span>
                <span className="font-mono text-purple-600">{assessmentScore}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={assessmentScore}
                onChange={(e) => setAssessmentScore(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Faculty Mentor Endorsement (20%)
                </span>
                <span className="text-[11px] text-slate-500">
                  Signed review from departmental professor
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFacultyEndorsed(!facultyEndorsed)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  facultyEndorsed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {facultyEndorsed ? 'Verified (+20%) ✓' : 'Not Endorsed (0%)'}
              </button>
            </div>
          </div>

          {/* Python Code Reference Card */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 font-mono text-xs overflow-x-auto">
            <p className="text-slate-400 mb-2 font-sans font-bold uppercase text-[10px]">
              Core Algorithmic Logic (Python Architecture)
            </p>
            <pre className="text-sky-300">
{`def calculate_evidence_strength(projects, github, assessment, faculty_signed):
    w_projects = 0.35 * min(100, projects.quality_index)
    w_github   = 0.25 * min(100, github.active_commits_weight)
    w_test     = 0.20 * min(100, assessment.percentile_score)
    w_faculty  = 0.20 * (100.0 if faculty_signed else 0.0)
    
    return round(w_projects + w_github + w_test + w_faculty, 2)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
