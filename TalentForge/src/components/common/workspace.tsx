import React from 'react';
import { Loader2, Lock, X } from 'lucide-react';
import { UserRole } from '../../types';

// Layout & form primitives for the signed-in workspace.

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode; eyebrow?: string }> = ({
  title,
  subtitle,
  actions,
  eyebrow,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
    <div>
      {eyebrow && <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{eyebrow}</p>}
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const Card: React.FC<{ className?: string; children: React.ReactNode; title?: string; action?: React.ReactNode }> = ({
  className = '',
  children,
  title,
  action,
}) => (
  <section className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 mb-4">
        {title && <h2 className="text-base font-bold text-slate-900">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

const BUTTON_VARIANTS = {
  primary: 'text-white bg-blue-600 hover:bg-blue-700 shadow-xs',
  secondary: 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50',
  danger: 'text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100',
  success: 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON_VARIANTS; size?: 'sm' | 'md'; busy?: boolean }
> = ({ variant = 'primary', size = 'md', busy, className = '', children, disabled, type = 'button', ...rest }) => (
  <button
    {...rest}
    type={type}
    disabled={disabled || busy}
    className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
    } ${BUTTON_VARIANTS[variant]} ${className}`}
  >
    {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
    {children}
  </button>
);

const fieldClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600';

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input {...props} className={`${fieldClass} ${className}`} />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea rows={3} {...props} className={`${fieldClass} resize-y ${className}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', ...props }) => (
  <select {...props} className={`${fieldClass} ${className}`} />
);

export const FormError: React.FC<{ message: string | null }> = ({ message }) =>
  message ? <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{message}</p> : null;

export const Modal: React.FC<{
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ open, title, subtitle, onClose, children, wide }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-left`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const PILL_STYLES: Record<string, string> = {
  verified: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  needs_revision: 'text-rose-700 bg-rose-50 border-rose-200',
  changes_requested: 'text-slate-700 bg-slate-100 border-slate-200',
  applied: 'text-blue-700 bg-blue-50 border-blue-200',
  shortlisted: 'text-purple-700 bg-purple-50 border-purple-200',
  interview: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  selected: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  rejected: 'text-rose-700 bg-rose-50 border-rose-200',
  withdrawn: 'text-slate-500 bg-slate-100 border-slate-200',
  scheduled: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  cancelled: 'text-slate-500 bg-slate-100 border-slate-200',
};

const PILL_LABELS: Record<string, string> = {
  verified: 'Verified',
  approved: 'Accepted',
  pending: 'Pending review',
  needs_revision: 'Needs revision',
  changes_requested: 'Changes requested',
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  selected: 'Selected',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const StatusPill: React.FC<{ status: string; label?: string }> = ({ status, label }) => (
  <span
    className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
      PILL_STYLES[status] || PILL_STYLES.withdrawn
    }`}
  >
    {label || PILL_LABELS[status] || status}
  </span>
);

export const StatTile: React.FC<{ label: string; value: React.ReactNode; hint?: string; tone?: string; onClick?: () => void }> = ({
  label,
  value,
  hint,
  tone = 'text-slate-900',
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-left ${onClick ? 'cursor-pointer hover:border-blue-300' : ''}`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`text-2xl font-extrabold font-mono tabular-nums mt-1 ${tone}`}>{value}</p>
    {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

export const Tabs: React.FC<{ tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (k: string) => void }> = ({
  tabs,
  active,
  onChange,
}) => (
  <div className="inline-flex max-w-full items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
          active === t.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {t.label}
        {t.count !== undefined && <span className="ml-1 text-slate-400">{t.count}</span>}
      </button>
    ))}
  </div>
);

export const AccessDenied: React.FC<{ role: UserRole; onHome: () => void }> = ({ role, onHome }) => (
  <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
    <div className="max-w-md text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
        <Lock className="w-5 h-5 text-rose-600" />
      </div>
      <h1 className="text-xl font-extrabold text-slate-900">Access denied</h1>
      <p className="text-sm text-slate-500">
        This page isn't available to your account. You're signed in as a <strong>{role}</strong>.
      </p>
      <Button onClick={onHome}>Go to my dashboard</Button>
    </div>
  </div>
);

export const MatchBadge: React.FC<{ value: number }> = ({ value }) => (
  <span
    className={`inline-flex items-center text-[11px] font-mono font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
      value >= 75 ? 'text-emerald-700 bg-emerald-50' : value >= 45 ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100'
    }`}
  >
    {value}% match
  </span>
);

export const SkillChip: React.FC<{ name: string; verified?: boolean; missing?: boolean }> = ({ name, verified, missing }) => (
  <span
    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
      missing
        ? 'text-slate-500 bg-white border-dashed border-slate-300'
        : verified
          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
          : 'text-slate-700 bg-slate-50 border-slate-200'
    }`}
  >
    {verified && <span aria-hidden>✓</span>}
    {name}
  </span>
);
