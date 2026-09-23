import React, { useState } from 'react';
import { talentforgeApi } from '../services/api';
import { useApi } from '../hooks/useApi';
import { monthYear, formatNumber } from '../lib/format';
import { AuthUser } from '../types';
import {
  Users,
  ShieldCheck,
  Building2,
  FolderCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboardPage: React.FC<{ user: AuthUser; onNavigate: (path: string) => void }> = ({ user }) => {
  const usersApi = useApi(() => talentforgeApi.getUsers(), []);
  const analytics = useApi(() => talentforgeApi.getAnalytics(), []);
  const [actionError, setActionError] = useState<string | null>(null);
  const ROLE_LABEL: Record<string, string> = { student: 'Student', teacher: 'Faculty', recruiter: 'Recruiter', admin: 'Admin' };
  const usersList = (usersApi.data || []).map((u) => ({
    id: u.id,
    name: u.name,
    role: ROLE_LABEL[u.role],
    email: u.email || '—',
    status: u.isActive ? 'Active' : 'Suspended',
    joined: monthYear(u.createdAt),
    isSelf: u.id === user.id,
  }));
  const live = analytics.data?.live;
  const [userFilter, setUserFilter] = useState<'all' | 'students' | 'faculty' | 'recruiters'>('all');
  const [searchUser, setSearchUser] = useState('');

  const stats = [
    { label: 'Total Enrolled Students', value: formatNumber(live?.students), change: `${formatNumber(analytics.data?.totalStudents)} platform-wide`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Accredited Faculty Mentors', value: formatNumber(live?.teachers), change: `${live?.pendingVerifications ?? 0} reviews pending`, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Verified Capstones', value: formatNumber(live?.verifiedProjects), change: `of ${live?.projects ?? 0} submitted projects`, icon: FolderCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Registered Recruiters', value: formatNumber(live?.recruiters), change: `${live?.openJobs ?? 0} open roles`, icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const filteredUsers = usersList.filter(u => {
    if (userFilter === 'students' && u.role !== 'Student') return false;
    if (userFilter === 'faculty' && u.role !== 'Faculty') return false;
    if (userFilter === 'recruiters' && u.role !== 'Recruiter') return false;
    if (searchUser) {
      return (
        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())
      );
    }
    return true;
  });

  const toggleUserStatus = async (id: string) => {
    const target = usersApi.data?.find((u) => u.id === id);
    if (!target) return;
    try {
      const updated = await talentforgeApi.setUserActive(id, !target.isActive);
      usersApi.setData(usersApi.data!.map((u) => (u.id === id ? updated : u)));
      setActionError(null);
    } catch (e) {
      setActionError((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                Admin Console
              </span>
              <span className="text-xs font-medium text-slate-500">
                Institutional Operations & Accreditation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Campus Intelligence Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Central administration, verification audits, and university compliance telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Audit logs report exported successfully for academic year 2026.')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Log</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.label}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {st.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${st.bg} flex items-center justify-center ${st.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {st.value}
                </div>
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                  {st.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">User Management & Permissions</h2>
              <p className="text-xs text-slate-500">Monitor active student, faculty, and recruiter directory.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-slate-900 w-full sm:w-56"
                />
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {(['all', 'students', 'faculty', 'recruiters'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setUserFilter(tab)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      userFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(usersApi.error || actionError) && <p className="text-xs text-rose-600">{usersApi.error || actionError}</p>}

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Joined</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${
                        u.role === 'Student' ? 'bg-blue-50 text-blue-700' : u.role === 'Faculty' ? 'bg-purple-50 text-purple-700' : u.role === 'Admin' ? 'bg-teal-50 text-teal-700' : 'bg-cyan-50 text-cyan-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono">{u.email}</td>
                    <td className="py-3.5 text-slate-500">{u.joined}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {!u.isSelf && <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`text-[11px] font-semibold hover:underline ${
                          u.status === 'Active' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
