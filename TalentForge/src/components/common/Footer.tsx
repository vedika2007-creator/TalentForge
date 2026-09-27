import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (role?: string, tab?: 'signin' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-slate-50/80 border-t border-slate-200 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                TF
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                TALENTFORGE
              </span>
            </div>
            <p className="text-base font-semibold text-slate-800">
              “From Claimed Skills to Proven Capability.”
            </p>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              An evidence-based student talent intelligence platform connecting students, faculty mentors, institutional administrators, and hiring teams through cryptographically verifiable capability.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span>Prototype Release</span>
              <span aria-hidden="true">·</span>
              <span>Built for College Capstone 2026</span>
            </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Platform</p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenAuth('recruiter', 'register')}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Discover Talent (recruiters)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/projects')}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Projects Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/skills-evidence')}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Skills & Evidence Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/collaborate')}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Collaboration Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Get started Column — sign-up entry points; the role comes from the account */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Get started</p>
            <ul className="space-y-2 text-xs">
              {[
                ['student', 'Join as a student', 'hover:text-blue-600'],
                ['recruiter', 'Hire as a recruiter', 'hover:text-cyan-600'],
                ['teacher', 'Faculty sign-up', 'hover:text-purple-600'],
              ].map(([role, label, hover]) => (
                <li key={role}>
                  <button
                    onClick={() => onOpenAuth(role, 'register')}
                    className={`${hover} transition-colors text-left flex items-center gap-1`}
                  >
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => onOpenAuth()} className="hover:text-blue-600 transition-colors text-left">
                  Sign in
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Resources</p>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <span className="text-slate-500">Evidence Scoring Matrix</span>
              </li>
              <li>
                <span className="text-slate-500">Faculty Rubrics</span>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('student', 'register')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Student Registration
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 TALENTFORGE. From Claimed Skills to Proven Capability.</p>
          <div className="flex items-center gap-6">
            <span>Academic Integrity Protected</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Plagiarism Verification</span>
            <span aria-hidden="true">·</span>
            <span>Django REST & Postgres Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
