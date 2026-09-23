import React, { useState } from 'react';
import {
  ShieldCheck,
  Github,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Layers,
  Star,
  GitCommit,
} from 'lucide-react';
import { MOCK_PROJECTS } from '../../data/mockData';
import { ProjectItem } from '../../types';

interface ProjectShowcaseProps {
  onNavigate: (path: string) => void;
}

export const ProjectShowcaseSection: React.FC<ProjectShowcaseProps> = ({ onNavigate }) => {
  const [activeDomain, setActiveDomain] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const domains = ['All', 'AI & Machine Learning', 'Cloud & Systems'];

  const filtered = activeDomain === 'All'
    ? MOCK_PROJECTS.slice(0, 3)
    : MOCK_PROJECTS.filter((p) => p.domain === activeDomain);

  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Demonstrated Capstones & Research
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Project Showcase
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-xl">
              Real projects built by verified students. Inspected for code quality, architectural soundness, and reproducible demonstration.
            </p>
          </div>

          {/* Interactive Filter Tabs (Functional buttons as per skill rules) */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200/80 self-start md:self-end">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeDomain === domain
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 p-6 flex flex-col justify-between text-left group"
            >
              <div>
                {/* Top: Domain & Verification Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-blue-600">
                    {project.domain}
                  </span>
                  {project.isFacultyVerified ? (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Faculty Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Under Review
                    </span>
                  )}
                </div>

                {/* Project Title & Tagline */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {project.tagline}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies (Clean unboxed inline text with separators) */}
                <div className="py-3 border-t border-slate-100 mt-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 font-mono">
                    {project.technologies.slice(0, 4).map((tech, idx) => (
                      <React.Fragment key={tech}>
                        <span className="text-slate-800 font-medium">{tech}</span>
                        {idx < Math.min(project.technologies.length, 4) - 1 && (
                          <span className="text-slate-300 font-sans" aria-hidden="true">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <img
                      src={project.authorAvatar}
                      alt={project.authorName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {project.authorName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {project.role}
                  </span>
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>

                <button
                  onClick={() => onNavigate('/projects')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>View Project</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('/projects')}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <span>Explore All 5,280+ Verified Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
