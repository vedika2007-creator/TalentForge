import {
  Bell,
  Briefcase,
  BarChart3,
  Award,
  ClipboardCheck,
  FileCheck2,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Star,
  UserCircle2,
  Users,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

/** Sidebar navigation: each role only ever sees the features it is allowed to use. */
export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Overview', path: '/student', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: UserCircle2 },
    { label: 'Skills', path: '/student/skills', icon: Sparkles },
    { label: 'Projects', path: '/student/projects', icon: FolderGit2 },
    { label: 'Certificates & Evidence', path: '/student/certificates', icon: Award },
    { label: 'Discover Opportunities', path: '/student/opportunities', icon: Search },
    { label: 'Applications', path: '/student/applications', icon: Send },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Collaborate', path: '/collaborate', icon: Users },
  ],
  recruiter: [
    { label: 'Overview', path: '/recruiter', icon: LayoutDashboard },
    { label: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Applications', path: '/recruiter/applications', icon: ClipboardCheck },
    { label: 'Discover Talent', path: '/recruiter/talent', icon: Search },
    { label: 'Shortlist', path: '/recruiter/shortlist', icon: Star },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ],
  teacher: [
    { label: 'Verification Requests', path: '/teacher', icon: ShieldCheck },
    { label: 'Certificate & Evidence Review', path: '/teacher/evidence', icon: FileCheck2 },
    { label: 'Student Verification', path: '/teacher/students', icon: GraduationCap },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Collaborate', path: '/collaborate', icon: Users },
  ],
  admin: [
    { label: 'Overview & Reports', path: '/admin', icon: BarChart3 },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Platform Management', path: '/admin/platform', icon: Settings2 },
    { label: 'Verification Monitoring', path: '/admin/verifications', icon: ShieldCheck },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ],
};

export const ROLE_LABEL: Record<UserRole, string> = {
  student: 'Student',
  recruiter: 'Recruiter',
  teacher: 'Faculty',
  admin: 'Admin',
};

export const ROLE_THEME: Record<UserRole, { accent: string; soft: string; text: string }> = {
  student: { accent: 'bg-blue-600', soft: 'bg-blue-50', text: 'text-blue-700' },
  recruiter: { accent: 'bg-cyan-600', soft: 'bg-cyan-50', text: 'text-cyan-700' },
  teacher: { accent: 'bg-purple-600', soft: 'bg-purple-50', text: 'text-purple-700' },
  admin: { accent: 'bg-teal-600', soft: 'bg-teal-50', text: 'text-teal-700' },
};
