import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Github,
  ExternalLink,
  Award,
  Users,
  Search,
  Check,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { talentforgeApi } from '../services/api';
import { AuthUser } from '../types';
import { useApi } from '../hooks/useApi';
import { timeAgo } from '../lib/format';
import { Avatar, EmptyState, ErrorState, LoadingState } from '../components/common/ui';
import confetti from 'canvas-confetti';

export const TeacherDashboardPage: React.FC<{ user: AuthUser; onNavigate: (path: string) => void }> = ({ user }) => {
  const queue = useApi(() => talentforgeApi.getVerificationRequests(), []);
  const cohort = useApi(() => talentforgeApi.getStudents(), []);
  const requests = queue.data || [];
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'changes_requested'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const review = async (id: string, name: string, status: 'approved' | 'changes_requested') => {
    setBusyId(id);
    try {
      const updated = await talentforgeApi.updateVerificationStatus(id, status, reviewNotes[id]?.trim() || undefined);
      queue.setData(requests.map((r) => (r.id === id ? updated : r)));
      cohort.reload();
      if (status === 'approved') {
        setNotice({ tone: 'ok', text: `Successfully verified capability for ${name}!` });
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      } else {
        setNotice({ tone: 'ok', text: `Revision comments sent to ${name}.` });
      }
    } catch (e) {
      setNotice({ tone: 'error', text: (e as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  const countBy = (status: string) => requests.filter((r) => r.status === status).length;

  const filteredRequests = requests.filter(req => {
    if (activeFilter !== 'all' && req.status !== activeFilter) return false;
    if (searchQuery) {
      return (
        req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.skillOrProjectTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                Faculty Portal
              </span>
              <span className="text-xs font-medium text-slate-500">
                {user.department ? `Department of ${user.department}` : 'Faculty Evaluator'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {[user.headline, user.college].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-700 block">
                Pending Reviews
              </span>
              <span className="text-2xl font-extrabold text-purple-700 font-mono tabular-nums">
                {countBy('pending')}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                Verified Students
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {(cohort.data || []).filter((s) => s.verifiedCount > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback alert notification */}
        {notice && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in border ${notice.tone === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice.text}</span>
          </div>
        )}

        {/* Verification Queue Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pending Verification Requests
              </h2>
              <p className="text-xs text-slate-500">
                Inspect student repository commits and project reports against technical rubrics.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All ({requests.length})
                </button>
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Pending ({countBy('pending')})
                </button>
                <button
                  onClick={() => setActiveFilter('approved')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeFilter === 'approved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by student or submission..." className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600" />
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {queue.loading && !queue.data && <LoadingState />}
            {queue.error && <ErrorState message={queue.error} onRetry={queue.reload} />}
            {queue.data && filteredRequests.length === 0 && <EmptyState title="Nothing here" hint="No requests match this filter." />}
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all bg-white shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.studentAvatar} name={req.studentName} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {req.studentName}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {req.studentDepartment}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-purple-700 mt-0.5">
                        Submission: {req.skillOrProjectTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      {timeAgo(req.submittedAt)}
                    </span>
                    {req.status === 'approved' && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </span>
                    )}
                    {req.status === 'pending' && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Sign-off
                      </span>
                    )}
                    {req.status === 'changes_requested' && (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                        Revision Requested
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {req.submittedEvidence.githubRepo && (
                    <a
                      href={req.submittedEvidence.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-50 hover:bg-purple-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors text-slate-700 hover:text-purple-700"
                    >
                      <span className="flex items-center gap-2">
                        <Github className="w-3.5 h-3.5" />
                        <span>Inspect Repository</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {req.submittedEvidence.demoUrl && (
                    <a
                      href={req.submittedEvidence.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-50 hover:bg-purple-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors text-slate-700 hover:text-purple-700"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Interactive Demo</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {req.submittedEvidence.projectReportUrl && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Project Report (PDF)</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">Attached</span>
                    </div>
                  )}
                </div>

                {/* Student Note */}
                {req.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                    <strong>{req.status === 'pending' ? 'Student Note' : `Review${req.reviewerName ? ` by ${req.reviewerName}` : ''}`}:</strong> {req.notes}
                  </p>
                )}

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-end gap-3 border-t border-slate-100">
                    <input value={reviewNotes[req.id] || ''} onChange={(e) => setReviewNotes({ ...reviewNotes, [req.id]: e.target.value })} placeholder="Optional review note..." className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-purple-600" />
                    <button
                      disabled={busyId === req.id}
                      onClick={() => review(req.id, req.studentName, 'changes_requested')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Request Revisions
                    </button>
                    <button
                      disabled={busyId === req.id}
                      onClick={() => review(req.id, req.studentName, 'approved')}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify & Sign Endorsement</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Student Roster Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Mentored Student Cohort
              </h2>
              <p className="text-xs text-slate-500">
                Track cumulative progress and viva readiness across your department lab group.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {(cohort.data || []).map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={st.avatar} name={st.name} />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{st.name}</h3>
                    <p className="text-[11px] text-slate-500">{st.targetRole}</p>
                    <p className="text-[10px] text-purple-700 font-semibold mt-0.5">
                      {st.verifiedCount} Verified Skills
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-600 block tabular-nums">
                    {st.overallScore}%
                  </span>
                  <span className="text-[10px] text-slate-400">Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
