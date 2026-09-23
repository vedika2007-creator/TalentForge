import React from 'react';
import {
  ShieldCheck,
  FolderGit2,
  Sparkles,
  Award,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface WhySectionProps {
  onNavigate: (path: string) => void;
}

export const WhySection: React.FC<WhySectionProps> = ({ onNavigate }) => {
  const features = [
    {
      id: 'verified-skills',
      title: 'Verified Skills',
      description: 'Real capabilities substantiated by real projects, GitHub activity, assessments, and faculty review—not self-reported bullet points on a static resume.',
      icon: ShieldCheck,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      targetPath: '/skills-evidence',
    },
    {
      id: 'project-showcase',
      title: 'Project Showcase',
      description: 'See what students have actually architected and built. Inspect live demo links, repository code commits, architecture notes, and technology stacks.',
      icon: FolderGit2,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      targetPath: '/projects',
    },
    {
      id: 'smart-matching',
      title: 'Smart Matching',
      description: 'Match candidates with internship and job opportunities based on weighted evidence alignment rather than keyword resume filtering.',
      icon: Sparkles,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      targetPath: '/discover',
    },
    {
      id: 'skill-verification',
      title: 'Skill Verification',
      description: 'Teachers and department mentors review student project pull requests and laboratory code, applying formal academic integrity rubrics.',
      icon: Award,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      targetPath: '/teacher',
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      description: 'Discover peers with complementary capabilities—connect frontend leads, ML researchers, and systems developers to build ambitious projects.',
      icon: Users,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      targetPath: '/collaborate',
    },
    {
      id: 'skill-gap',
      title: 'Skill Gap Analysis',
      description: 'Benchmark student capability portfolios against target industry roles to surface exact missing skills and personalized learning roadmaps.',
      icon: Compass,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      targetPath: '/skills-evidence',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            The Talent Intelligence Paradigm
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            A Smarter Way to Discover Talent
          </h2>
          <p className="text-base sm:text-lg font-medium text-slate-600 mt-2">
            Evidence-based. Skill-driven. Future-ready.
          </p>
        </div>

        {/* 6 Elegant Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.targetPath)}
                className="group p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center mb-5 transition-transform group-hover:scale-105`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  <span>Explore Feature</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all transform group-hover:translate-x-1">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
