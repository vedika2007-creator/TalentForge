import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Github,
  ExternalLink,
  FolderGit2,
  Sparkles,
  Layers,
  Star,
  GitCommit,
  X,
} from 'lucide-react';
import { talentforgeApi } from '../services/api';
import { useApi } from '../hooks/useApi';
import { ErrorState, LoadingState } from '../components/common/ui';
import { ProjectItem } from '../types';

export const ProjectsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const projectsApi = useApi(() => talentforgeApi.getProjects(), []);
  const allProjects = projectsApi.data || [];
  const domains = ['All', ...Array.from(new Set(allProjects.map((p) => p.domain)))];

  const filtered = allProjects.filter(p => {
    if (selectedDomain !== 'All' && p.domain !== selectedDomain) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTech = p.technologies.some(t => t.toLowerCase().includes(q));
      const matchAuthor = p.authorName.toLowerCase().includes(q);
      if (!matchTitle && !matchTech && !matchAuthor) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Engineering & Research Showcase
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verified Project Showcase
          </h1>
          <p className="text-base text-slate-600 mt-2">
            Inspect real student capstone projects with working code repositories, test suites, architecture notes, and academic faculty endorsements.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search projects by title, stack (e.g. Python, YOLOv8), or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedDomain === dom
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsApi.loading && !projectsApi.data && <div className="col-span-full"><LoadingState /></div>}
          {projectsApi.error && <div className="col-span-full"><ErrorState message={projectsApi.error} onRetry={projectsApi.reload} /></div>}
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 p-6 flex flex-col justify-between group"
            >
              <div>
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
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                      Under Review
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {project.tagline}
                </p>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="py-3 border-t border-slate-100 mt-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 font-mono">
                    {project.technologies.map((t, idx) => (
                      <React.Fragment key={t}>
                        <span className="text-slate-800 font-medium">{t}</span>
                        {idx < project.technologies.length - 1 && <span className="text-slate-300">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <img
                      src={project.authorAvatar}
                      alt={project.authorName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {project.authorName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {project.role}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repository</span>
                </a>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>Architecture Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-left space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                  {selectedProject.domain}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedProject.tagline}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Project Overview & Architecture
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Technical Highlights
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedProject.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedProject.verifiedBy && (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Faculty Lab Endorsement
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Endorsed by {selectedProject.verifiedBy} on {selectedProject.verificationDate}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>View Full Source Code</span>
              </a>

              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
