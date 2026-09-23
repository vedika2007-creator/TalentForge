import React, { useState } from 'react';
import { Users, Plus, ArrowRight, Sparkles, Check, Send } from 'lucide-react';
import { MOCK_COLLABORATION_POSTS, MOCK_STUDENTS } from '../../data/mockData';

export const CollaborationPreviewSection: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [invitedStudents, setInvitedStudents] = useState<string[]>([]);
  const post = MOCK_COLLABORATION_POSTS[0]; // AI Healthcare Assistant

  const handleInvite = (name: string) => {
    if (invitedStudents.includes(name)) {
      setInvitedStudents(invitedStudents.filter(n => n !== name));
    } else {
      setInvitedStudents([...invitedStudents, name]);
    }
  };

  // Recommended students with complementary skills
  const recommendedPeers = [
    {
      name: 'Sneha Verma',
      role: 'UI/UX & Frontend Lead',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      matchedRole: 'UI/UX Designer',
      complementarySkills: ['Figma', 'React', 'Tailwind CSS'],
      score: 91,
    },
    {
      name: 'Aarav Mehta',
      role: 'Backend & Cloud Systems',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      matchedRole: 'Backend Developer (FastAPI)',
      complementarySkills: ['Python', 'FastAPI', 'PostgreSQL'],
      score: 94,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Multi-Disciplinary Synergy
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Build Better Teams
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Ambitious capstones require diverse talents. TALENTFORGE matches engineers and designers based on complementary, verified capability graphs.
          </p>
        </div>

        <div className="bg-slate-50/70 rounded-3xl border border-slate-200 p-6 sm:p-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Project Seeking Teammates */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  {post.domain}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {post.currentMembers} / {post.maxMembers} Members
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {post.description}
                </p>
              </div>

              <div className="py-3 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Looking for Complementary Roles:
                </p>
                <div className="space-y-1.5">
                  {post.lookingFor.map((role, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <span className="font-semibold text-slate-800">{role}</span>
                      <span className="text-[11px] text-blue-600 font-medium">Seeking</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <img
                    src={post.creatorAvatar}
                    alt={post.creatorName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>Created by <strong>{post.creatorName}</strong></span>
                </div>
                <span>{post.postedDate}</span>
              </div>
            </div>

            {/* Recommended Teammates with Complementary Skills */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Algorithmic Teammate Recommendations</span>
                </p>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">
                  Complementary Match
                </span>
              </div>

              <div className="space-y-3">
                {recommendedPeers.map((peer) => {
                  const isInvited = invitedStudents.includes(peer.name);
                  return (
                    <div
                      key={peer.name}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-blue-300"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={peer.avatar}
                          alt={peer.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{peer.name}</h4>
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                              {peer.score}%
                            </span>
                          </div>
                          <p className="text-xs font-medium text-purple-700">
                            Fulfills: {peer.matchedRole}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            {peer.complementarySkills.join(' · ')}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInvite(peer.name)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
                          isInvited
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isInvited ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Invited</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Invite</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Find Teammates Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/collaborate')}
                  className="w-full py-3 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Find Teammates Across All Disciplines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
