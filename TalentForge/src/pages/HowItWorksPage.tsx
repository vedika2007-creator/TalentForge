import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Binary,
} from 'lucide-react';

export const HowItWorksPage: React.FC<{ onNavigate: (path: string) => void; onOpenAuth: (role?: string) => void }> = ({
  onNavigate,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'recruiter' | 'admin'>('student');

  const content = {
    student: {
      role: 'Student Workflow',
      title: 'How Students Turn Projects Into Career Proof',
      tagline: 'Claim, substantiate, get endorsed, and stand out without resume padding.',
      steps: [
        { title: '1. Connect Code Repositories', desc: 'Sync your public GitHub profile and select your strongest capstones and research work.' },
        { title: '2. Take Proctored Algorithm Tests', desc: 'Solve timed sandbox assessments to substantiate language fundamentals with hard data.' },
        { title: '3. Request Faculty Endorsement', desc: 'Submit your code and documentation to college professors for laboratory viva sign-off.' },
        { title: '4. Unlock High-Signal Recruiter Pipeline', desc: 'Receive direct interview inquiries based on verified technical alignment.' },
      ],
      ctaText: 'Build Student Profile',
      ctaRole: 'student',
    },
    teacher: {
      role: 'Faculty Mentor Workflow',
      title: 'How Teachers Verify & Endorse Real Capability',
      tagline: 'Transform routine laboratory grading into accredited career credentials.',
      steps: [
        { title: '1. Access Department Queue', desc: 'View student project submissions with attached commits, reports, and live demo links.' },
        { title: '2. Perform Rubric Code Audits', desc: 'Examine code modularity, engineering practices, and documentation completeness.' },
        { title: '3. Endorse or Request Revisions', desc: 'Provide constructive feedback or digitally sign the capability endorsement.' },
        { title: '4. Elevate Department Placements', desc: 'Build an auditable institutional record of verified graduate engineering outcomes.' },
      ],
      ctaText: 'Open Faculty Portal',
      ctaRole: 'teacher',
    },
    recruiter: {
      role: 'Recruiter Workflow',
      title: 'How Recruiters Source Without Resume Hallucination',
      tagline: 'Hire with 95% capability confidence using deterministic code proof.',
      steps: [
        { title: '1. Define Capability Requirements', desc: 'Set required skills, minimum project complexity, and faculty sign-off criteria.' },
        { title: '2. Algorithmic Match Scoring', desc: 'Our engine ranks students by actual demonstrated competency rather than buzzwords.' },
        { title: '3. Inspect Auditable Proof', desc: 'Review repository commits, test pass percentiles, and professor endorsement signatures.' },
        { title: '4. Fast-Track Technical Interviews', desc: 'Skip low-signal initial phone screens and move straight to technical deep dives.' },
      ],
      ctaText: 'Access Recruiter Engine',
      ctaRole: 'recruiter',
    },
    admin: {
      role: 'Administrator Workflow',
      title: 'How Universities Govern & Track Campus Telemetry',
      tagline: 'Accreditation compliance, department verification SLAs, and placement analytics.',
      steps: [
        { title: '1. Campus-Wide Roster Governance', desc: 'Oversee student enrollment and faculty mentor permissions across engineering branches.' },
        { title: '2. Verification Throughput Monitoring', desc: 'Track department review turnaround times and ensure timely graduation audits.' },
        { title: '3. Export Tamper-Proof Reports', desc: 'Download cryptographic logs for national academic accreditation compliance.' },
        { title: '4. Industry Placement Analytics', desc: 'Measure recruiter engagement, hiring velocity, and curriculum alignment in real-time.' },
      ],
      ctaText: 'Open Admin Console',
      ctaRole: 'admin',
    },
  };

  const current = content[activeTab];

  return (
    <div className="min-h-screen bg-white py-8 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            The Evidence Ecosystem
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            How TALENTFORGE Works
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            A unified intelligence platform connecting students, academic faculty, recruiters, and university administrators.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-fit">
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'student' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>For Students</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'teacher' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>For Teachers</span>
          </button>
          <button
            onClick={() => setActiveTab('recruiter')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'recruiter' ? 'bg-white text-cyan-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>For Recruiters</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'admin' ? 'bg-white text-teal-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>For Administrators</span>
          </button>
        </div>

        {/* Dynamic Role Breakdown Card */}
        <div className="bg-slate-50/70 rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {current.role}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {current.title}
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-1">
              {current.tagline}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {current.steps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{step.title}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Ready to explore this portal?</span>
            <button
              onClick={() => onOpenAuth(current.ctaRole)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{current.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
