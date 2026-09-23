import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PortalCardsGrid } from '../common/PortalCard';

interface HeroSectionProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (role?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onOpenAuth }) => {
  const brandLetters = 'TALENTFORGE'.split('');

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-white">
      {/* Subtle background ambient elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-cyan-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-60 -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headings & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Talent Intelligence Network Online</span>
            </div>

            {/* Large Animated Heading: TALENTFORGE (Letter-by-letter reveal) */}
            <div className="overflow-hidden py-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 flex flex-wrap">
                {brandLetters.map((char, index) => (
                  <span
                    key={index}
                    className="inline-block transition-transform duration-300 hover:-translate-y-1 hover:text-blue-600 cursor-default"
                    style={{
                      animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {char}
                  </span>
                ))}
              </h1>
            </div>

            {/* Tagline with gradient highlight on "Proven Capability" */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              From Claimed Skills to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent underline decoration-sky-300/40 decoration-wavy">
                Proven Capability.
              </span>
            </h2>

            {/* Short explanation */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Connect skills with real projects, achievements, GitHub contributions, assessments and verified evidence — helping students showcase what they can actually do and helping recruiters discover the right talent.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => onNavigate('/discover')}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all group"
              >
                <span>Explore Talent</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onOpenAuth('student')}
                className="px-6 py-3 text-sm font-semibold text-slate-700 hover:text-blue-600 bg-white hover:bg-blue-50/60 active:scale-[0.98] rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-center"
              >
                Build Your Profile
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Faculty-Grade Verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Live GitHub Activity Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Algorithmic Skill Scoring</span>
              </div>
            </div>
          </div>

          {/* Right Column: FOUR INTERACTIVE PORTAL CARDS */}
          <div className="lg:col-span-6 w-full">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose Your Role Portal
              </span>
              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Interactive Preview
              </span>
            </div>
            {/* The 4 Portal Cards arranged in clean grid */}
            <PortalCardsGrid onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </section>
  );
};
