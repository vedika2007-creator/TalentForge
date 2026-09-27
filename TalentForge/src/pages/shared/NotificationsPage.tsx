import React from 'react';
import { Award, Bell, Briefcase, CalendarClock, MessageSquare, ShieldCheck, Star, UserCog } from 'lucide-react';
import { talentforgeApi } from '../../services/api';
import { useWorkspace } from '../../app/session';
import { EmptyState } from '../../components/common/ui';
import { Button, PageHeader } from '../../components/common/workspace';
import { timeAgo } from '../../lib/format';

const ICONS: Record<string, React.ElementType> = {
  verification: ShieldCheck,
  application: Briefcase,
  interview: CalendarClock,
  message: MessageSquare,
  shortlist: Star,
  account: UserCog,
  certificate: Award,
};

export const NotificationsPage: React.FC = () => {
  const { notifications, unread, setNotifications, navigate } = useWorkspace();

  const open = (id: string, link: string | null) => {
    talentforgeApi.markNotificationRead(id).then(setNotifications).catch(() => undefined);
    if (link) navigate(link);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You're all caught up."}
        actions={
          unread > 0 && (
            <Button variant="secondary" onClick={() => talentforgeApi.markAllNotificationsRead().then(setNotifications)}>
              Mark all as read
            </Button>
          )
        }
      />
      {notifications.length === 0 ? (
        <EmptyState title="No notifications yet" hint="Verification results, application updates and messages will show up here." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => open(n.id, n.link)}
                className={`w-full text-left px-5 py-4 flex gap-3 hover:bg-slate-50 ${n.read ? '' : 'bg-blue-50/40'}`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-700'}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${n.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</span>
                  {n.body && <span className="block text-xs text-slate-500 mt-0.5">{n.body}</span>}
                  <span className="block text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" aria-label="Unread" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
