import React, { useState } from 'react';
import { talentforgeApi } from '../services/api';
import { useApi } from '../hooks/useApi';
import { timeAgo } from '../lib/format';
import { Avatar, ErrorState, LoadingState } from '../components/common/ui';
import { Users, Plus, ArrowRight, Sparkles, Check, Send, Search, X } from 'lucide-react';
import { AuthUser } from '../types';
import confetti from 'canvas-confetti';

export const CollaboratePage: React.FC<{
  user: AuthUser | null;
  onNavigate: (path: string) => void;
  onOpenAuth: (role?: string) => void;
}> = ({ user, onOpenAuth }) => {
  const postsApi = useApi(() => talentforgeApi.getCollaborationPosts(), [user?.id]);
  const posts = postsApi.data || [];
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New post form
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('AI & Machine Learning');
  const [description, setDescription] = useState('');
  const [lookingFor, setLookingFor] = useState('');

  const handleApply = async (id: string) => {
    if (!user) return onOpenAuth('student');
    try {
      const updated = await talentforgeApi.joinCollaboration(id);
      postsApi.setData(posts.map((p) => (p.id === id ? updated : p)));
      setActionError(null);
      try {
        confetti({ particleCount: 35, spread: 60 });
      } catch {
        // ignore
      }
    } catch (e) {
      setActionError((e as Error).message);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      const created = await talentforgeApi.createCollaborationPost({
        title,
        domain,
        description,
        maxMembers: 4,
        lookingFor: lookingFor.split(',').map((s) => s.trim()).filter(Boolean),
        tags: [domain],
      });
      postsApi.setData([created, ...posts]);
    } catch (err) {
      setActionError((err as Error).message);
    }
    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setLookingFor('');
  };

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Cross-Disciplinary Team Builder
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Collaborate & Build Teams
            </h1>
            <p className="text-base text-slate-600 mt-2">
              Ambitious hackathon and capstone projects require balanced teams. Connect with frontend architects, machine learning researchers, and cloud systems engineers.
            </p>
          </div>

          <button
            onClick={() => (user ? setIsCreateModalOpen(true) : onOpenAuth('student'))}
            className="self-start md:self-auto px-5 py-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post Collaboration Request</span>
          </button>
        </div>

        {actionError && <p className="text-xs text-rose-600">{actionError}</p>}
        {postsApi.loading && !postsApi.data && <LoadingState />}
        {postsApi.error && <ErrorState message={postsApi.error} onRetry={postsApi.reload} />}

        {/* Posts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const hasApplied = !!post.isMember;
            const isFull = post.currentMembers >= post.maxMembers;
            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-teal-400 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                      {post.domain}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {post.currentMembers} / {post.maxMembers} Members
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {post.description}
                  </p>

                  {/* Looking For */}
                  <div className="py-2.5 border-t border-slate-100 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Seeking Roles:
                    </p>
                    <div className="space-y-1.5">
                      {post.lookingFor.map((role, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-800 border border-slate-100 flex items-center justify-between"
                        >
                          <span>{role}</span>
                          <span className="text-[10px] text-teal-600 font-bold">Open</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <Avatar src={post.creatorAvatar} name={post.creatorName} className="w-7 h-7 rounded-full" textClass="text-[9px]" />
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {post.creatorName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {post.creatorCollege}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {timeAgo(post.postedDate)}
                  </span>

                  <button
                    disabled={hasApplied || isFull}
                    onClick={() => handleApply(post.id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                      hasApplied
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                    }`}
                  >
                    {hasApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isFull ? 'Team Full' : 'Join Team'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Post Team Request</h3>
                <p className="text-xs text-slate-500">Find complementary talent across universities</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real-Time Autonomous Drone Mesh Network"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-600"
                >
                  <option>AI & Machine Learning</option>
                  <option>Cloud & Systems</option>
                  <option>Web & Mobile</option>
                  <option>Robotics & IoT</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly describe what the team will build and what skills are needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Roles Needed (comma-separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Embedded Systems Developer, React Native Lead"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
                >
                  Publish Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
