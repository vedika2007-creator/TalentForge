import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { SignInRequired } from './components/common/ui';
import { AccessDenied } from './components/common/workspace';

import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsEvidencePage } from './pages/SkillsEvidencePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AppShell } from './app/AppShell';
import { WorkspaceProvider } from './app/session';
import { ROLE_NAV } from './app/navigation';
import { ALIASES, PUBLIC_PATHS, matchRoute } from './app/routes';
import { AuthUser } from './types';
import { AUTH_EVENT, getStoredUser, talentforgeApi } from './services/api';

const currentLocation = () => ({ path: ALIASES[window.location.pathname] || window.location.pathname || '/', search: window.location.search });

export default function App() {
  const [location, setLocation] = useState(currentLocation);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; initialRole?: string; initialTab?: 'signin' | 'register' }>({
    isOpen: false,
  });
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    const onPop = () => setLocation(currentLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Keep the session in sync with login/logout/expired-token events from the API layer,
  // and re-validate a stored session (role, suspension) against the backend on load.
  useEffect(() => {
    const onAuth = (e: Event) => setUser((e as CustomEvent<AuthUser | null>).detail);
    window.addEventListener(AUTH_EVENT, onAuth);
    if (getStoredUser()) talentforgeApi.me().then(setUser).catch(() => undefined);
    return () => window.removeEventListener(AUTH_EVENT, onAuth);
  }, []);

  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin);
    if (url.pathname + url.search === window.location.pathname + window.location.search) return;
    window.history.pushState({}, '', url.pathname + url.search);
    setLocation({ path: ALIASES[url.pathname] || url.pathname, search: url.search });
    window.scrollTo({ top: 0 });
  }, []);

  const replace = useCallback((to: string) => {
    window.history.replaceState({}, '', to);
    setLocation(currentLocation());
  }, []);

  const home = user ? ROLE_NAV[user.role][0].path : '/';
  const match = matchRoute(location.path);

  // Signed-in users live in their workspace: public pages and unknown URLs go to their home.
  useEffect(() => {
    if (user && !match) replace(home);
  }, [user, match, home, replace]);

  const openAuthModal = (role = 'student', tab: 'signin' | 'register' = 'signin') => setAuthModal({ isOpen: true, initialRole: role, initialTab: tab });

  const handleAuthSuccess = (signedIn: AuthUser) => {
    setUser(signedIn);
    // Stay on the protected page that prompted sign-in if this role may open it; otherwise go home.
    if (!(match && match.route.roles.includes(signedIn.role))) navigate(ROLE_NAV[signedIn.role][0].path);
  };

  const handleLogout = () => {
    talentforgeApi.logout();
    navigate('/');
  };

  const authModalEl = (
    <AuthModal
      key={`${authModal.initialRole}-${authModal.initialTab}-${authModal.isOpen}`}
      isOpen={authModal.isOpen}
      initialRole={authModal.initialRole}
      initialTab={authModal.initialTab}
      onClose={() => setAuthModal({ isOpen: false })}
      onSuccess={handleAuthSuccess}
    />
  );

  // ---- Signed-in workspace ----
  if (user) {
    if (!match) return null; // redirecting
    const allowed = match.route.roles.includes(user.role);
    return (
      <WorkspaceProvider user={user} navigate={navigate}>
        <AppShell currentPath={location.path} onLogout={handleLogout}>
          {allowed ? (
            <React.Fragment key={location.path + location.search}>{match.route.render(match.params)}</React.Fragment>
          ) : (
            <AccessDenied role={user.role} onHome={() => navigate(home)} />
          )}
        </AppShell>
        {authModalEl}
      </WorkspaceProvider>
    );
  }

  // ---- Public site ----
  const renderPublic = () => {
    if (match) {
      return <SignInRequired role={match.route.roles[0]} onSignIn={(r) => openAuthModal(r)} />;
    }
    switch (PUBLIC_PATHS.includes(location.path) ? location.path : '/') {
      case '/projects':
        return <ProjectsPage onNavigate={navigate} />;
      case '/skills-evidence':
        return <SkillsEvidencePage onNavigate={navigate} />;
      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigate} onOpenAuth={openAuthModal} />;
      default:
        return <HomePage onNavigate={navigate} onOpenAuth={openAuthModal} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar currentPath={location.path} onNavigate={navigate} onOpenAuth={openAuthModal} />
      <main className="flex-1">{renderPublic()}</main>
      <Footer onNavigate={navigate} onOpenAuth={openAuthModal} />
      {authModalEl}
    </div>
  );
}
