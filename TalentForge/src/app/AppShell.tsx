import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, X, UserCircle2 } from 'lucide-react';
import { Avatar } from '../components/common/ui';
import { ROLE_LABEL, ROLE_NAV, ROLE_THEME } from './navigation';
import { useWorkspace } from './session';
import { talentforgeApi } from '../services/api';
import { timeAgo } from '../lib/format';

/** Signed-in layout: role-specific sidebar, top bar with notifications and account menu. */
export const AppShell: React.FC<{ currentPath: string; onLogout: () => void; children: React.ReactNode }> = ({
  currentPath,
  onLogout,
  children,
}) => {
  const { user, navigate, notifications, unread, setNotifications } = useWorkspace();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = ROLE_NAV[user.role];
  const theme = ROLE_THEME[user.role];
  const home = nav[0].path;

  // The most specific nav entry that prefixes the current path is the active one.
  const activePath = nav
    .map((n) => n.path)
    .filter((p) => currentPath === p || currentPath.startsWith(p + '/'))
    .sort((a, b) => b.length - a.length)[0];

  const go = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
    setBellOpen(false);
    setMenuOpen(false);
  };

  const openNotification = async (id: string, link: string | null) => {
    talentforgeApi.markNotificationRead(id).then(setNotifications).catch(() => undefined);
    if (link) go(link);
  };

  const sidebar = (
    <nav className="flex flex-col gap-0.5 p-3">
      <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {ROLE_LABEL[user.role]} workspace
      </p>
      {nav.map(({ label, path, icon: Icon }) => {
        const active = path === activePath;
        return (
          <button
            key={path}
            onClick={() => go(path)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              active ? `${theme.soft} ${theme.text} font-semibold` : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {path === '/notifications' && unread > 0 && (
              <span className="text-[10px] font-bold text-white bg-rose-500 rounded-full px-1.5 min-w-[18px] text-center">{unread}</span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className={`h-1 ${theme.accent}`} />
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => go(home)} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="font-extrabold text-white text-sm">TF</span>
              </div>
              <span className="hidden sm:block text-lg font-extrabold tracking-tight text-slate-900">TALENTFORGE</span>
            </button>
            <span className={`hidden sm:inline text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${theme.soft} ${theme.text}`}>
              {ROLE_LABEL[user.role]}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen(!bellOpen);
                  setMenuOpen(false);
                }}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                aria-label={`Notifications (${unread} unread)`}
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 text-[9px] font-bold text-white bg-rose-500 rounded-full px-1 min-w-[16px] leading-4 text-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Notifications</span>
                      {unread > 0 && (
                        <button
                          onClick={() => talentforgeApi.markAllNotificationsRead().then(setNotifications)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 && <p className="px-4 py-6 text-center text-xs text-slate-500">You're all caught up.</p>}
                      {notifications.slice(0, 8).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => openNotification(n.id, n.link)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-2.5 ${n.read ? '' : 'bg-blue-50/40'}`}
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-600'}`} />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-900">{n.title}</span>
                            {n.body && <span className="block text-[11px] text-slate-500 truncate">{n.body}</span>}
                            <span className="block text-[10px] text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => go('/notifications')}
                      className="w-full px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border-t border-slate-100"
                    >
                      View all notifications
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Account */}
            <div className="relative">
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setBellOpen(false);
                }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100"
              >
                <Avatar src={user.avatar} name={user.name} className="w-8 h-8 rounded-lg" textClass="text-[11px]" />
                <span className="hidden md:block text-xs font-semibold text-slate-900 max-w-[160px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    {user.role === 'student' && (
                      <button
                        onClick={() => go('/student/profile')}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2.5"
                      >
                        <UserCircle2 className="w-4 h-4" /> My profile
                      </button>
                    )}
                    <button
                      onClick={onLogout}
                      className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white">
          <div className="sticky top-[60px]">{sidebar}</div>
        </aside>

        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawerOpen(false)} />
            <div className="relative w-72 max-w-[85vw] bg-white h-full overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-extrabold text-slate-900">TALENTFORGE</span>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" aria-label="Close menu">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
