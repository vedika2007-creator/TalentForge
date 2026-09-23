import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, FolderGit2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { ProjectItem, StudentProfile } from '../../types';
import { Avatar } from './ui';

interface SearchModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Refresh the searchable index from the database each time the palette opens
      Promise.all([talentforgeApi.getStudents(), talentforgeApi.getProjects()])
        .then(([s, p]) => {
          setStudents(s);
          setProjects(p);
          setLoadError(null);
        })
        .catch((e: Error) => setLoadError(e.message));
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const wantsVerified = q.includes('verified');

  const filteredStudents = !q
    ? []
    : students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.targetRole.toLowerCase().includes(q) ||
          s.college.toLowerCase().includes(q) ||
          s.skills.some((sk) => sk.skillName.toLowerCase().includes(q))
      );

  const filteredProjects = !q
    ? []
    : projects.filter(
        (p) =>
          (wantsVerified && p.isFacultyVerified) ||
          p.title.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q)) ||
          p.domain.toLowerCase().includes(q)
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, skills (e.g. Python, React), projects, faculty..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {loadError && <p className="text-xs text-rose-600 px-2">{loadError}</p>}

          {/* Quick links when empty */}
          {!query && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {['Python', 'Machine Learning', 'FastAPI', 'React', 'PostgreSQL', 'Faculty Verified'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Students */}
          {filteredStudents.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Students ({filteredStudents.length})
              </p>
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => {
                    onNavigate('/discover');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={student.avatar} name={student.name} className="w-8 h-8 rounded-full" textClass="text-[10px]" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500">{student.headline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {student.overallScore}% Confidence
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Projects ({filteredProjects.length})
              </p>
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    onNavigate('/projects');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {project.technologies.slice(0, 3).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.isFacultyVerified && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {query && filteredStudents.length === 0 && filteredProjects.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No results found for “{query}”</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for skills like Python, React, or ML
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Search the TALENTFORGE evidence graph</span>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
            ESC to close
          </span>
        </div>
      </div>
    </div>
  );
};
