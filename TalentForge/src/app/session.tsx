import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthUser, NotificationItem } from '../types';
import { talentforgeApi } from '../services/api';

interface Workspace {
  user: AuthUser;
  navigate: (path: string) => void;
  /** Unread notification count + latest items, refreshed by polling and after actions. */
  notifications: NotificationItem[];
  unread: number;
  refreshNotifications: () => void;
  setNotifications: (data: { unread: number; items: NotificationItem[] }) => void;
}

const WorkspaceContext = createContext<Workspace | null>(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside the signed-in workspace');
  return ctx;
};

const POLL_MS = 20000;

export const WorkspaceProvider: React.FC<{ user: AuthUser; navigate: (path: string) => void; children: React.ReactNode }> = ({
  user,
  navigate,
  children,
}) => {
  const [data, setData] = useState<{ unread: number; items: NotificationItem[] }>({ unread: 0, items: [] });

  const refreshNotifications = useCallback(() => {
    talentforgeApi.getNotifications().then(setData).catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshNotifications();
    const t = setInterval(refreshNotifications, POLL_MS);
    return () => clearInterval(t);
  }, [refreshNotifications, user.id]);

  return (
    <WorkspaceContext.Provider
      value={{ user, navigate, notifications: data.items, unread: data.unread, refreshNotifications, setNotifications: setData }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
