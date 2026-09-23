import React from 'react';
import { AlertTriangle, Inbox, Loader2, Lock, ArrowRight } from 'lucide-react';
import { initials } from '../../lib/format';
import { UserRole } from '../../types';

const AVATAR_TONES = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-fuchsia-500',
  'from-teal-500 to-emerald-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
];

export const Avatar: React.FC<{ src?: string | null; name: string; className?: string; textClass?: string }> = ({
  src,
  name,
  className = 'w-10 h-10 rounded-xl',
  textClass = 'text-xs',
}) => {
  const [failed, setFailed] = React.useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${className} object-cover border border-slate-200 shrink-0`}
      />
    );
  }
  const tone = AVATAR_TONES[name.length % AVATAR_TONES.length];
  return (
    <div
      aria-label={name}
      className={`${className} bg-gradient-to-br ${tone} text-white font-bold flex items-center justify-center shrink-0`}
    >
      <span className={textClass}>{initials(name)}</span>
    </div>
  );
};

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
    <span className="text-xs font-medium">{label}</span>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
    <div className="flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-rose-800">Something went wrong</p>
        <p className="text-xs text-rose-700 mt-0.5">{message}</p>
      </div>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-100 rounded-lg self-start sm:self-auto"
      >
        Try again
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="py-14 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
    <Inbox className="w-6 h-6 text-slate-300" />
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    {hint && <p className="text-xs text-slate-500 max-w-sm">{hint}</p>}
  </div>
);

const ROLE_COPY: Record<UserRole, { label: string; tone: string; button: string }> = {
  student: { label: 'Student Portal', tone: 'text-blue-700 bg-blue-50', button: 'bg-blue-600 hover:bg-blue-700' },
  teacher: { label: 'Faculty Portal', tone: 'text-purple-700 bg-purple-50', button: 'bg-purple-600 hover:bg-purple-700' },
  recruiter: { label: 'Recruiter Portal', tone: 'text-cyan-700 bg-cyan-50', button: 'bg-cyan-600 hover:bg-cyan-700' },
  admin: { label: 'Admin Console', tone: 'text-teal-700 bg-teal-50', button: 'bg-teal-600 hover:bg-teal-700' },
};

export const SignInRequired: React.FC<{
  role: UserRole;
  currentRole?: UserRole | null;
  onSignIn: (role: UserRole) => void;
}> = ({ role, currentRole, onSignIn }) => {
  const copy = ROLE_COPY[role];
  const wrongRole = currentRole && currentRole !== role;
  return (
    <div className="min-h-[70vh] bg-slate-50/50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-slate-500" />
        </div>
        <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${copy.tone}`}>
          {copy.label}
        </span>
        <h1 className="text-xl font-extrabold text-slate-900">
          {wrongRole ? `This portal is for ${role}s` : 'Sign in to continue'}
        </h1>
        <p className="text-sm text-slate-500">
          {wrongRole
            ? `You're signed in as a ${currentRole}. Switch to a ${role} account to open this portal.`
            : `The ${copy.label.toLowerCase()} shows live data from your account.`}
        </p>
        <button
          onClick={() => onSignIn(role)}
          className={`w-full py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-colors ${copy.button}`}
        >
          <span>{wrongRole ? `Switch to ${role} account` : `Sign in as ${role}`}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
