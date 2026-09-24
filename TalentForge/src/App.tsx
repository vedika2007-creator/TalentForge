import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/common/AuthModal';
import { SignInRequired } from './components/common/ui';

import { HomePage } from './pages/HomePage';
import { DiscoverTalentPage } from './pages/DiscoverTalentPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsEvidencePage } from './pages/SkillsEvidencePage';
import { CollaboratePage } from './pages/CollaboratePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RecruiterDashboardPage } from './pages/RecruiterDashboardPage';
import { AuthUser, UserRole } from './types';
import { AUTH_EVENT, getStoredUser, talentforgeApi } from './services/api';

const PORTAL_ROLES: Record<string, UserRole> = {
  '/student': 'student',
  '/teacher': 'teacher',
  '/recruiter': 'recruiter',
  '/admin': 'admin',
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    initialRole?: string;
    initialTab?: 'signin' | 'register';
  }>({ isOpen: false, initialRole: 'student' });
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  // Sync with browser history & URL pathname
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path === '' ? '/' : path);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Keep the session in sync with login/logout/expired-token events from the API layer
  useEffect(() => {
    const onAuth = (e: Event) => setUser((e as CustomEvent<AuthUser | null>).detail);
    window.addEventListener(AUTH_EVENT, onAuth);
    // Validate a stored session against the backend on first load
    if (getStoredUser()) talentforgeApi.me().then(setUser).catch(() => undefined);
    return () => window.removeEventListener(AUTH_EVENT, onAuth);
  }, []);

  const navigate = useCallback((path: string) => {
    if (path === window.location.pathname) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Signed-in users live in their own role workspace: the public landing pages and
  // other roles' portals send them back to their own dashboard.
  useEffect(() => {
    if (!user) return;
    const home = `/${user.role}`;
    const portalRole = PORTAL_ROLES[currentPath];
    const adminOnTeacher = portalRole === 'teacher' && user.role === 'admin';
    const isMarketing = currentPath === '/' || currentPath === '/how-it-works';
    if (isMarketing || (portalRole && portalRole !== user.role && !adminOnTeacher)) {
      window.history.replaceState({}, '', home);
      setCurrentPath(home);
    }
  }, [user, currentPath]);

  const openAuthModal = (role: string = 'student', tab: 'signin' | 'register' = 'signin') => {
    setAuthModalState({ isOpen: true, initialRole: role, initialTab: tab });
  };

  const handleAuthSuccess = (signedIn: AuthUser) => {
    setUser(signedIn);
    navigate(`/${signedIn.role}`);
  };

  const handleLogout = () => {
    talentforgeApi.logout();
    navigate('/');
  };

  const renderPortal = (path: string) => {
    const role = PORTAL_ROLES[path];
    // Admins can also work the faculty verification queue.
    const allowed = user && (user.role === role || (role === 'teacher' && user.role === 'admin'));
    if (!user || !allowed) {
      return <SignInRequired role={role} currentRole={user?.role} onSignIn={(r) => openAuthModal(r)} />;
    }
    switch (path) {
      case '/student':
        return <StudentDashboardPage key={user.id} user={user} onNavigate={navigate} />;
      case '/teacher':
        return <TeacherDashboardPage key={user.id} user={user} onNavigate={navigate} />;
      case '/recruiter':
        return <RecruiterDashboardPage key={user.id} user={user} onNavigate={navigate} />;
      default:
        return <AdminDashboardPage key={user.id} user={user} onNavigate={navigate} />;
    }
  };

  const renderPage = () => {
    if (PORTAL_ROLES[currentPath]) return renderPortal(currentPath);
    switch (currentPath) {
      case '/discover':
        return <DiscoverTalentPage onNavigate={navigate} />;
      case '/projects':
        return <ProjectsPage onNavigate={navigate} />;
      case '/skills-evidence':
        return <SkillsEvidencePage onNavigate={navigate} />;
      case '/collaborate':
        return <CollaboratePage user={user} onNavigate={navigate} onOpenAuth={openAuthModal} />;
      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigate} onOpenAuth={openAuthModal} />;
      case '/':
      default:
        return <HomePage onNavigate={navigate} onOpenAuth={openAuthModal} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        currentPath={currentPath}
        user={user}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={openAuthModal}
        onLogout={handleLogout}
      />

      <main className="flex-1">{renderPage()}</main>

      <Footer onNavigate={navigate} onOpenAuth={openAuthModal} />

      <SearchModal
        isOpen={isSearchOpen}
        onOpen={() => setIsSearchOpen(true)}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />

      <AuthModal
        key={`${authModalState.initialRole}-${authModalState.initialTab}-${authModalState.isOpen}`}
        isOpen={authModalState.isOpen}
        initialRole={authModalState.initialRole}
        initialTab={authModalState.initialTab}
        onClose={() => setAuthModalState({ isOpen: false })}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
