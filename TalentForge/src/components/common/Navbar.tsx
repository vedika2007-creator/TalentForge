import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAuth: (role?: string, tab?: 'signin' | 'register') => void;
}

/** Public (signed-out) navigation. There is no portal selector: after sign-in the role comes from the account. */
const PUBLIC_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Skills & Evidence', path: '/skills-evidence' },
  { label: 'How It Works', path: '/how-it-works' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const go = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3' : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button onClick={() => go('/')} className="group flex items-center gap-2.5 text-left focus:outline-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="font-extrabold text-white text-base tracking-wider">TF</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">TALENTFORGE</span>
        </button>

        <nav className="hidden lg:flex items-center gap-7">
          {PUBLIC_NAV.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => go(link.path)}
                className={`text-sm font-medium transition-colors relative py-1 focus:outline-none ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth()}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors focus:outline-none"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('student', 'register')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-sm shadow-blue-500/20 transition-all focus:outline-none"
          >
            <span>Create Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="space-y-1">
            {PUBLIC_NAV.map((link) => (
              <button
                key={link.path}
                onClick={() => go(link.path)}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPath === link.path ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              onOpenAuth('student', 'register');
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg flex items-center justify-center gap-2"
          >
            <span>Create Your Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
