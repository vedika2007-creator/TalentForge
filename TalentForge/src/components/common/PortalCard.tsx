import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Users,
  ArrowRight,
  GitBranch,
  Award,
  CheckCircle2,
  TrendingUp,
  Settings,
  Sparkles,
  BarChart3,
  FolderGit2,
} from 'lucide-react';

export interface PortalCardConfig {
  id: string;
  role: 'student' | 'teacher' | 'admin' | 'recruiter';
  title: string;
  roleTag: string;
  description: string;
  path: string;
  theme: {
    accentGradient: string;
    iconBg: string;
    iconColor: string;
    glowColor: string;
    borderHover: string;
    lightBg: string;
    badgeBg: string;
    badgeColor: string;
  };
}

export const PORTAL_CONFIGS: PortalCardConfig[] = [
  {
    id: 'student-portal',
    role: 'student',
    title: 'Student Portal',
    roleTag: 'Talent Showcase',
    description: 'Showcase your skills, projects, achievements and verified evidence.',
    path: '/student',
    theme: {
      accentGradient: 'from-blue-600 via-sky-500 to-cyan-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      glowColor: 'group-hover:shadow-blue-500/20',
      borderHover: 'group-hover:border-blue-400',
      lightBg: 'bg-blue-50/50',
      badgeBg: 'bg-blue-50',
      badgeColor: 'text-blue-700',
    },
  },
  {
    id: 'teacher-portal',
    role: 'teacher',
    title: 'Teacher Portal',
    roleTag: 'Faculty Mentorship',
    description: 'Verify student skills, projects and provide meaningful mentorship.',
    path: '/teacher',
    theme: {
      accentGradient: 'from-purple-600 via-indigo-500 to-blue-500',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      glowColor: 'group-hover:shadow-purple-500/20',
      borderHover: 'group-hover:border-purple-400',
      lightBg: 'bg-purple-50/50',
      badgeBg: 'bg-purple-50',
      badgeColor: 'text-purple-700',
    },
  },
  {
    id: 'admin-portal',
    role: 'admin',
    title: 'Admin Portal',
    roleTag: 'Campus Governance',
    description: 'Manage users, projects, verification, reports and platform operations.',
    path: '/admin',
    theme: {
      accentGradient: 'from-teal-600 via-emerald-500 to-blue-600',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      glowColor: 'group-hover:shadow-teal-500/20',
      borderHover: 'group-hover:border-teal-400',
      lightBg: 'bg-teal-50/50',
      badgeBg: 'bg-teal-50',
      badgeColor: 'text-teal-700',
    },
  },
  {
    id: 'recruiter-portal',
    role: 'recruiter',
    title: 'Recruiter Portal',
    roleTag: 'Evidence-Based Hiring',
    description: 'Discover and match with talent based on real skills and verified evidence.',
    path: '/recruiter',
    theme: {
      accentGradient: 'from-cyan-600 via-blue-600 to-indigo-600',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      glowColor: 'group-hover:shadow-cyan-500/20',
      borderHover: 'group-hover:border-cyan-400',
      lightBg: 'bg-cyan-50/50',
      badgeBg: 'bg-cyan-50',
      badgeColor: 'text-cyan-700',
    },
  },
];

interface PortalCardProps {
  config: PortalCardConfig;
  index: number;
  onNavigate: (path: string) => void;
}

export const PortalCard: React.FC<PortalCardProps> = ({ config, index, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Choose subtle float animation style
  const floatClass = index % 2 === 0 ? 'animate-float' : 'animate-float-delayed';

  return (
    <div
      onClick={() => onNavigate(config.path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative text-left bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 hover:shadow-xl ${config.theme.glowColor} ${config.theme.borderHover} ${floatClass}`}
      style={{
        animationDelay: `${index * 200}ms`,
      }}
    >
      {/* Top subtle highlight gradient bar on hover */}
      <div
        className={`absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r ${config.theme.accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Header: Icon + Title + Role */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl ${config.theme.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
          >
            {config.role === 'student' && (
              <GraduationCap className={`w-6 h-6 ${config.theme.iconColor} transition-transform group-hover:rotate-6`} />
            )}
            {config.role === 'teacher' && (
              <ShieldCheck className={`w-6 h-6 ${config.theme.iconColor} transition-transform group-hover:scale-110`} />
            )}
            {config.role === 'admin' && (
              <Settings className={`w-6 h-6 ${config.theme.iconColor} transition-transform duration-500 group-hover:rotate-45`} />
            )}
            {config.role === 'recruiter' && (
              <Building2 className={`w-6 h-6 ${config.theme.iconColor} transition-transform group-hover:-translate-y-0.5`} />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {config.title}
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              {config.roleTag}
            </span>
          </div>
        </div>

        {/* Small live status/accent indicator */}
        <span className="flex h-2.5 w-2.5 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.role === 'student' ? 'bg-blue-400' : config.role === 'teacher' ? 'bg-purple-400' : config.role === 'admin' ? 'bg-teal-400' : 'bg-cyan-400'}`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.role === 'student' ? 'bg-blue-600' : config.role === 'teacher' ? 'bg-purple-600' : config.role === 'admin' ? 'bg-teal-600' : 'bg-cyan-600'}`} />
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        {config.description}
      </p>

      {/* Micro Interactive Elements specific to each portal role */}
      <div className="pt-2 pb-3 border-t border-slate-100">
        {config.role === 'student' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Skill Score</span>
              </span>
              <span className="font-mono font-bold text-blue-600 tabular-nums">92%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: isHovered ? '94%' : '92%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <FolderGit2 className="w-3 h-3 text-slate-400" /> 8 Projects
              </span>
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-slate-400" /> 42 GitHub Commits
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-slate-400" /> 3 Verified
              </span>
            </div>
          </div>
        )}

        {config.role === 'teacher' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Pending Reviews</span>
              </span>
              <span className="font-mono font-bold text-purple-600 tabular-nums">3 Awaiting</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50/60 p-2 rounded-lg text-[11px] text-purple-900 border border-purple-100/80">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">Crop Disease AI (Priya S.)</span>
              <span className="ml-auto text-[10px] text-purple-600 font-semibold font-mono">Review</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Skill Rubrics</span>
              <span aria-hidden="true">·</span>
              <span>Mentorship Notes</span>
              <span aria-hidden="true">·</span>
              <span>Endorsements</span>
            </div>
          </div>
        )}

        {config.role === 'admin' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-teal-500" />
                <span>Platform Health</span>
              </span>
              <span className="font-mono font-bold text-teal-600 tabular-nums">99.8%</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Students</span>
                <span className="font-mono font-bold text-slate-800 tabular-nums">10.4K</span>
              </div>
              <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Verified</span>
                <span className="font-mono font-bold text-teal-700 tabular-nums">5.2K</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>User Governance</span>
              <span aria-hidden="true">·</span>
              <span>Audit Logs</span>
              <span aria-hidden="true">·</span>
              <span>Analytics</span>
            </div>
          </div>
        )}

        {config.role === 'recruiter' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                <span>Talent Match</span>
              </span>
              <span className="font-mono font-bold text-cyan-600 tabular-nums">94% Match</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: isHovered ? '96%' : '94%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Python Backend</span>
              <span aria-hidden="true">·</span>
              <span>Django REST</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-700 font-semibold">Faculty Verified</span>
            </div>
          </div>
        )}
      </div>

      {/* CTA: Enter Portal */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
          <span>Enter Portal</span>
        </span>
        <div
          className={`w-7 h-7 rounded-full ${config.theme.iconBg} flex items-center justify-center text-slate-700 group-hover:text-white group-hover:bg-blue-600 transition-all duration-300 transform group-hover:translate-x-1`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

interface PortalCardsGridProps {
  onNavigate: (path: string) => void;
}

export const PortalCardsGrid: React.FC<PortalCardsGridProps> = ({ onNavigate }) => {
  return (
    <div className="relative">
      {/* Subtle backdrop glow behind cards */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100/40 via-cyan-100/30 to-purple-100/30 rounded-3xl blur-2xl -z-10 pointer-events-none" />

      {/* 2x2 Grid on desktop/tablet, clean stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {PORTAL_CONFIGS.map((config, index) => (
          <PortalCard
            key={config.id}
            config={config}
            index={index}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};
