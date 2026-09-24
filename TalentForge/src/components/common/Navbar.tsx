import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Menu, X, ShieldCheck, GraduationCap, Users, Building2, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { AuthUser } from '../../types';
import { Avatar } from './ui';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: (role?: string, tab?: 'signin' | 'register') => void;
  user: AuthUser | null;
  onLogout: () => void;
}

const PUBLIC_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Discover Talent', path: '/discover' },
  { label: 'Projects', path: '/projects' },
  { label: 'Skills & Evidence', path: '/skills-evidence' },
  { label: 'Collaborate', path: '/collaborate' },
  { label: 'How It Works', path: '/how-it-works' },
];

/** Each role gets its own workspace navigation once signed in. */
const ROLE_NAV: Record<string, { label: string; path: string }[]> = {
  student: [
    { label: 'My Dashboard', path: '/student' },
    { label: 'Projects', path: '/projects' },
    { label: 'Collaborate', path: '/collaborate' },
    { label: 'Skills & Evidence', path: '/skills-evidence' },
  ],
  teacher: [
    { label: 'Verification Queue', path: '/teacher' },
    { label: 'Students', path: '/discover' },
    { label: 'Projects', path: '/projects' },
    { label: 'Collaborate', path: '/collaborate' },
  ],
  recruiter: [
    { label: 'Candidates', path: '/recruiter' },
    { label: 'Discover Talent', path: '/discover' },
    { label: 'Projects', path: '/projects' },
  ],
  admin: [
    { label: 'Admin Console', path: '/admin' },
    { label: 'Verifications', path: '/teacher' },
    { label: 'Students', path: '/discover' },
    { label: 'Projects', path: '/projects' },
  ],
};

const ROLE_ACCENT: Record<string, string> = {
  student: 'bg-blue-600',
  teacher: 'bg-purple-600',
  recruiter: 'bg-cyan-600',
  admin: 'bg-teal-600',
};

const ROLE_BADGE: Record<string, string> = {
  student: 'text-blue-700 bg-blue-50',
  teacher: 'text-purple-700 bg-purple-50',
  recruiter: 'text-cyan-700 bg-cyan-50',
  admin: 'text-teal-700 bg-teal-50',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
  user,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalsDropdown, setPortalsDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user ? ROLE_NAV[user.role] : PUBLIC_NAV;
  const homePath = user ? `/${user.role}` : '/';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      {user && <div className={`absolute top-0 inset-x-0 h-1 ${ROLE_ACCENT[user.role]}`} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element with custom TF logo mark) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(homePath)}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
              <span className="font-extrabold text-white text-base tracking-wider">TF</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                TALENTFORGE
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean text links with active indicator) */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`text-sm font-medium transition-colors relative py-1 focus:outline-none ${
                  isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}

          {/* Portals Quick Selector Dropdown */}
          {!user && <div className="relative">
            <button
              onClick={() => setPortalsDropdown(!portalsDropdown)}
              onBlur={() => setTimeout(() => setPortalsDropdown(false), 200)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1 focus:outline-none"
            >
              <span>Portals</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-semibold">4</span>
            </button>
            {portalsDropdown && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 py-2 text-left z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { onNavigate('/student'); setPortalsDropdown(false); }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Student Portal</span>
                </button>
                <button
                  onClick={() => { onNavigate('/teacher'); setPortalsDropdown(false); }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50/70 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Teacher Portal</span>
                </button>
                <button
                  onClick={() => { onNavigate('/recruiter'); setPortalsDropdown(false); }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-cyan-600" />
                  <span>Recruiter Portal</span>
                </button>
                <button
                  onClick={() => { onNavigate('/admin'); setPortalsDropdown(false); }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50/70 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Admin Portal</span>
                </button>
              </div>
            )}
          </div>}
        </nav>

        {/* Zone 3: Actions (Search, Sign In, Create Profile) */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none"
            title="Search candidates, skills, projects (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <Avatar src={user.avatar} name={user.name} className="w-8 h-8 rounded-lg" textClass="text-[11px]" />
                <span className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-slate-900 max-w-[140px] truncate">{user.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 rounded ${ROLE_BADGE[user.role]}`}>
                    {user.role}
                  </span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { onNavigate(`/${user.role}`); setUserMenuOpen(false); }}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-lg flex items-center gap-2.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => { onLogout(); setUserMenuOpen(false); }}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50/70 rounded-lg flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Sign In */}
              <button
                onClick={() => onOpenAuth()}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors focus:outline-none"
              >
                Sign In
              </button>

              {/* Create Profile / Primary CTA */}
              <button
                onClick={() => onOpenAuth('student', 'register')}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-sm shadow-blue-500/20 transition-all focus:outline-none"
              >
                <span>Create Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  onNavigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPath === link.path
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {!user && <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Platform Portals
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onNavigate('/student'); setMobileMenuOpen(false); }}
                className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50/70 rounded-lg text-left flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Student
              </button>
              <button
                onClick={() => { onNavigate('/teacher'); setMobileMenuOpen(false); }}
                className="px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50/70 rounded-lg text-left flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Teacher
              </button>
              <button
                onClick={() => { onNavigate('/recruiter'); setMobileMenuOpen(false); }}
                className="px-3 py-2 text-xs font-medium text-cyan-700 bg-cyan-50/70 rounded-lg text-left flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" /> Recruiter
              </button>
              <button
                onClick={() => { onNavigate('/admin'); setMobileMenuOpen(false); }}
                className="px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50/70 rounded-lg text-left flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" /> Admin
              </button>
            </div>
          </div>}

          <div className="pt-2">
            {user ? (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.name})</span>
              </button>
            ) : (
              <button
                onClick={() => { onOpenAuth('student', 'register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg flex items-center justify-center gap-2"
              >
                <span>Build Your Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
