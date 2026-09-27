import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useWorkspace } from '../../app/session';
import { Avatar, ErrorState, LoadingState } from '../../components/common/ui';
import { Button, FormError, PageHeader, Tabs, TextInput } from '../../components/common/workspace';
import { ROLE_LABEL, ROLE_THEME } from '../../app/navigation';
import { AuthUser } from '../../types';
import { monthYear } from '../../lib/format';

export const AdminUsersPage: React.FC = () => {
  const { user, navigate } = useWorkspace();
  const users = useApi(() => talentforgeApi.getUsers(), []);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const all = users.data || [];
  // Faculty who registered but were never activated show up as "awaiting approval".
  const pendingFaculty = (u: AuthUser) => u.role === 'teacher' && !u.isActive;
  const q = query.trim().toLowerCase();
  const list = all.filter((u) => {
    if (tab === 'pending' && !pendingFaculty(u)) return false;
    if (!['all', 'pending'].includes(tab) && u.role !== tab) return false;
    return !q || u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const setActive = async (u: AuthUser, active: boolean) => {
    if (!active && !confirm(`Suspend ${u.name}? They will be signed out and unable to log in.`)) return;
    setBusyId(u.id);
    setError(null);
    try {
      const updated = await talentforgeApi.setUserActive(u.id, active);
      users.setData(all.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const count = (role: string) => all.filter((u) => u.role === role).length;

  return (
    <div>
      <PageHeader title="User Management" subtitle="Approve faculty accounts, and suspend or reactivate any user." />
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: 'all', label: 'All', count: all.length },
            { key: 'pending', label: 'Awaiting approval', count: all.filter(pendingFaculty).length },
            { key: 'student', label: 'Students', count: count('student') },
            { key: 'teacher', label: 'Faculty', count: count('teacher') },
            { key: 'recruiter', label: 'Recruiters', count: count('recruiter') },
            { key: 'admin', label: 'Admins', count: count('admin') },
          ]}
        />
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="pl-9" />
        </div>
      </div>

      <FormError message={error} />
      {users.loading && !users.data && <LoadingState />}
      {users.error && <ErrorState message={users.error} onRetry={users.reload} />}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto mt-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-3 py-3 font-semibold">Role</th>
              <th className="px-3 py-3 font-semibold hidden md:table-cell">Organisation</th>
              <th className="px-3 py-3 font-semibold hidden sm:table-cell">Joined</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((u) => {
              const theme = ROLE_THEME[u.role];
              return (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} className="w-8 h-8 rounded-lg" textClass="text-[10px]" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{u.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${theme.soft} ${theme.text}`}>{ROLE_LABEL[u.role]}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 hidden md:table-cell">{u.college || '—'}</td>
                  <td className="px-3 py-3 text-xs text-slate-500 hidden sm:table-cell">{monthYear(u.createdAt)}</td>
                  <td className="px-3 py-3">
                    {u.isActive ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                    ) : pendingFaculty(u) ? (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Awaiting approval</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Suspended</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {u.role === 'student' && (
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/${u.id}`)}>Profile</Button>
                    )}
                    {u.id !== user.id &&
                      (u.isActive ? (
                        <Button size="sm" variant="ghost" busy={busyId === u.id} onClick={() => setActive(u, false)} className="text-rose-600">
                          Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="success" busy={busyId === u.id} onClick={() => setActive(u, true)}>
                          {pendingFaculty(u) ? 'Approve' : 'Reactivate'}
                        </Button>
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.data && list.length === 0 && <p className="text-center text-sm text-slate-500 py-8">No users match.</p>}
      </div>
    </div>
  );
};
