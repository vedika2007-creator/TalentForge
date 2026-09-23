import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface CtaSectionProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (role?: string) => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 lg:p-16 overflow-hidden bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 shadow-2xl text-white text-center sm:text-left">
          {/* Subtle geometric circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-cyan-300/20 blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join the 2026 Academic Talent Cohort</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Turn Your Skills Into Proven Capability.
            </h2>

            <p className="text-base sm:text-lg text-blue-50 leading-relaxed max-w-2xl mb-8">
              Build your profile, showcase your evidence, receive official faculty verification, and connect directly with high-caliber tech recruiters.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onOpenAuth('student')}
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-blue-600 bg-white hover:bg-blue-50 active:scale-[0.98] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Create Your Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/discover')}
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-blue-700/60 hover:bg-blue-700/80 active:scale-[0.98] border border-white/25 rounded-xl transition-all flex items-center justify-center"
              >
                Explore Talent
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
