import React, { useEffect, useState } from 'react';
import { X, GraduationCap, ShieldCheck, Building2, Users, ArrowRight, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, talentforgeApi } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: string;
  initialTab?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

const ROLES: { role: UserRole; label: string; hint: string; icon: React.ElementType; active: string; iconColor: string }[] = [
  { role: 'student', label: 'Student', hint: 'Showcase skills & projects', icon: GraduationCap, active: 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20', iconColor: 'text-blue-600' },
  { role: 'teacher', label: 'Teacher', hint: 'Verify student work', icon: ShieldCheck, active: 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-500/20', iconColor: 'text-purple-600' },
  { role: 'recruiter', label: 'Recruiter', hint: 'Source verified talent', icon: Building2, active: 'border-cyan-600 bg-cyan-50/50 text-cyan-900 ring-2 ring-cyan-500/20', iconColor: 'text-cyan-600' },
  { role: 'admin', label: 'Admin', hint: 'Platform operations', icon: Users, active: 'border-teal-600 bg-teal-50/50 text-teal-900 ring-2 ring-teal-500/20', iconColor: 'text-teal-600' },
];

const DEMO_BUTTON_TONES: Record<UserRole, string> = {
  student: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  teacher: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  recruiter: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
  admin: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
};

const inputClass =
  'w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'student',
  initialTab = 'signin',
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>((initialRole as UserRole) || 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const finish = (user: AuthUser) => {
    onSuccess(user);
    onClose();
  };

  const run = async (key: string, action: () => Promise<AuthUser>) => {
    setBusy(key);
    setError(null);
    try {
      finish(await action());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signin') {
      run('form', () => talentforgeApi.login(email, password, selectedRole));
    } else {
      run('form', () =>
        talentforgeApi.register({ name: fullName, email, password, role: selectedRole, college: college || undefined })
      );
    }
  };

  const fillDemo = () => {
    setActiveTab('signin');
    setEmail(DEMO_ACCOUNTS[selectedRole]);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const roleName = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {activeTab === 'signin' ? 'Access Your Portal' : 'Create TALENTFORGE Profile'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Evidence-based capability intelligence for academia & hiring</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 px-6 pt-3">
          {(['signin', 'register'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError(null);
              }}
              className={`pb-2 text-xs font-semibold border-b-2 transition-colors mr-6 ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'signin' ? 'Sign In' : 'New Registration'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Your Role</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ role, label, hint, icon: Icon, active, iconColor }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedRole === role ? active : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 ${iconColor}`} />
                  <div>
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[10px] text-slate-500">{hint}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Mehta"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {selectedRole === 'recruiter' ? 'Company' : 'College / Institution'}
                    <span className="text-slate-400 font-normal"> (optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={selectedRole === 'recruiter' ? 'e.g. TechRecruit Global' : 'e.g. Apex Institute of Technology'}
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="e.g. name@college.edu or name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={activeTab === 'register' ? 6 : 1}
                autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                placeholder={activeTab === 'register' ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!!busy}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {busy === 'form' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{activeTab === 'signin' ? `Sign in to ${roleName} Portal` : `Create ${roleName} Account`}</span>
              {busy !== 'form' && <ArrowRight className="w-4 h-4" />}
            </button>

            {activeTab === 'signin' && (
              <button
                type="button"
                onClick={fillDemo}
                className="w-full text-[11px] text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3 h-3" />
                Fill demo {selectedRole} credentials
              </button>
            )}
          </form>

          {/* One-click demo sign-in with seeded accounts */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] text-center text-slate-500 mb-2">One-click demo sign-in (seeded accounts):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {ROLES.map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  disabled={!!busy}
                  onClick={() => run(role, () => talentforgeApi.loginDemo(role))}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-60 ${DEMO_BUTTON_TONES[role]}`}
                >
                  {busy === role && <Loader2 className="w-3 h-3 animate-spin" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
