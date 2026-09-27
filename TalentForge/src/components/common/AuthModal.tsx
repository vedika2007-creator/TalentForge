import React, { useEffect, useState } from 'react';
import { X, GraduationCap, ShieldCheck, Building2, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { talentforgeApi } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: string;
  initialTab?: 'signin' | 'register';
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

type SignupRole = Exclude<UserRole, 'admin'>;

const SIGNUP_ROLES: { role: SignupRole; label: string; hint: string; icon: React.ElementType; active: string; iconColor: string }[] = [
  { role: 'student', label: 'Student', hint: 'Build a verified profile', icon: GraduationCap, active: 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20', iconColor: 'text-blue-600' },
  { role: 'recruiter', label: 'Recruiter', hint: 'Hire verified talent', icon: Building2, active: 'border-cyan-600 bg-cyan-50/50 ring-2 ring-cyan-500/20', iconColor: 'text-cyan-600' },
  { role: 'teacher', label: 'Faculty', hint: 'Needs admin approval', icon: ShieldCheck, active: 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20', iconColor: 'text-purple-600' },
];

const DEMO: { role: UserRole; label: string; tone: string }[] = [
  { role: 'student', label: 'Student', tone: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { role: 'recruiter', label: 'Recruiter', tone: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
  { role: 'teacher', label: 'Faculty', tone: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  { role: 'admin', label: 'Admin', tone: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
];

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialRole = 'student', initialTab = 'signin', onClose, onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);
  const [role, setRole] = useState<SignupRole>(initialRole === 'recruiter' || initialRole === 'teacher' ? initialRole : 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const run = async (key: string, action: () => Promise<AuthUser | { pending_approval: true; message: string }>) => {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      const result = await action();
      if ('pending_approval' in result) {
        setNotice(result.message);
        setTab('signin');
        setPassword('');
      } else {
        onSuccess(result);
        onClose();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'signin') run('form', () => talentforgeApi.login(email, password));
    else run('form', () => talentforgeApi.register({ name, email, password, role, college: org || undefined }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{tab === 'signin' ? 'Sign in to TalentForge' : 'Create your account'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {tab === 'signin' ? "We'll open the right workspace for your account." : 'Evidence-based capability for academia & hiring'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 pt-3">
          {(['signin', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className={`pb-2 text-xs font-semibold border-b-2 transition-colors mr-6 ${
                tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {notice && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            {tab === 'register' && (
              <>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">I am a…</p>
                  <div className="grid grid-cols-3 gap-2">
                    {SIGNUP_ROLES.map(({ role: r, label, hint, icon: Icon, active, iconColor }) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${role === r ? active : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                        <p className="text-xs font-bold text-slate-900 mt-1">{label}</p>
                        <p className="text-[10px] text-slate-500 leading-tight">{hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {role === 'recruiter' ? 'Company' : 'College / Institution'}
                  </label>
                  <input
                    type="text"
                    required={role !== 'student'}
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder={role === 'recruiter' ? 'TechRecruit Global' : 'Apex Institute of Technology'}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={tab === 'register' ? 6 : 1}
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                placeholder={tab === 'register' ? 'At least 6 characters' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!!busy}
              className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl flex items-center justify-center gap-2"
            >
              {busy === 'form' && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{tab === 'signin' ? 'Sign in' : 'Create account'}</span>
              {busy !== 'form' && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] text-center text-slate-500 mb-2">Try a seeded demo account (password demo1234):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {DEMO.map(({ role: r, label, tone }) => (
                <button
                  key={r}
                  type="button"
                  disabled={!!busy}
                  onClick={() => run(r, () => talentforgeApi.loginDemo(r))}
                  className={`px-2.5 py-1.5 rounded-md font-medium flex items-center justify-center gap-1 disabled:opacity-60 ${tone}`}
                >
                  {busy === r && <Loader2 className="w-3 h-3 animate-spin" />}
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
