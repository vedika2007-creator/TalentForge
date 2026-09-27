import React from 'react';
import { UserRole } from '../types';
import { StudentOverviewPage } from '../pages/student/StudentOverviewPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentSkillsPage } from '../pages/student/StudentSkillsPage';
import { StudentProjectsPage } from '../pages/student/StudentProjectsPage';
import { StudentCertificatesPage } from '../pages/student/StudentCertificatesPage';
import { OpportunitiesPage } from '../pages/student/OpportunitiesPage';
import { StudentApplicationsPage } from '../pages/student/StudentApplicationsPage';
import { RecruiterOverviewPage } from '../pages/recruiter/RecruiterOverviewPage';
import { RecruiterJobsPage } from '../pages/recruiter/RecruiterJobsPage';
import { RecruiterApplicationsPage } from '../pages/recruiter/RecruiterApplicationsPage';
import { RecruiterTalentPage } from '../pages/recruiter/RecruiterTalentPage';
import { RecruiterShortlistPage } from '../pages/recruiter/RecruiterShortlistPage';
import { TeacherVerificationPage } from '../pages/teacher/TeacherVerificationPage';
import { TeacherStudentsPage } from '../pages/teacher/TeacherStudentsPage';
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminPlatformPage } from '../pages/admin/AdminPlatformPage';
import { AdminVerificationsPage } from '../pages/admin/AdminVerificationsPage';
import { MessagesPage } from '../pages/shared/MessagesPage';
import { NotificationsPage } from '../pages/shared/NotificationsPage';
import { ProfileViewPage } from '../pages/shared/ProfileViewPage';
import { CollaboratePage } from '../pages/CollaboratePage';
import { useWorkspace } from './session';

export interface AppRoute {
  path: string;
  /** Roles allowed to open this page. The backend enforces the same rules on every API call. */
  roles: UserRole[];
  render: (params: Record<string, string>) => React.ReactNode;
}

const ALL: UserRole[] = ['student', 'recruiter', 'teacher', 'admin'];

const CollaborateRoute: React.FC = () => {
  const { user, navigate } = useWorkspace();
  return <CollaboratePage user={user} onNavigate={navigate} onOpenAuth={() => undefined} />;
};

export const APP_ROUTES: AppRoute[] = [
  // Student
  { path: '/student', roles: ['student'], render: () => <StudentOverviewPage /> },
  { path: '/student/profile', roles: ['student'], render: () => <StudentProfilePage /> },
  { path: '/student/skills', roles: ['student'], render: () => <StudentSkillsPage /> },
  { path: '/student/projects', roles: ['student'], render: () => <StudentProjectsPage /> },
  { path: '/student/certificates', roles: ['student'], render: () => <StudentCertificatesPage /> },
  { path: '/student/opportunities', roles: ['student'], render: () => <OpportunitiesPage /> },
  { path: '/student/applications', roles: ['student'], render: () => <StudentApplicationsPage /> },

  // Recruiter
  { path: '/recruiter', roles: ['recruiter'], render: () => <RecruiterOverviewPage /> },
  { path: '/recruiter/jobs', roles: ['recruiter'], render: () => <RecruiterJobsPage /> },
  { path: '/recruiter/applications', roles: ['recruiter'], render: () => <RecruiterApplicationsPage /> },
  { path: '/recruiter/talent', roles: ['recruiter'], render: () => <RecruiterTalentPage /> },
  { path: '/recruiter/shortlist', roles: ['recruiter'], render: () => <RecruiterShortlistPage /> },

  // Faculty (admins may also work the queue)
  {
    path: '/teacher',
    roles: ['teacher', 'admin'],
    render: () => (
      <TeacherVerificationPage
        title="Verification Requests"
        subtitle="Review projects, certificates and skill evidence. Accept to add verified skills to the student's profile, or decline with a reason."
      />
    ),
  },
  {
    path: '/teacher/evidence',
    roles: ['teacher', 'admin'],
    render: () => (
      <TeacherVerificationPage
        types={['certificate', 'skill_assessment']}
        title="Certificate & Evidence Review"
        subtitle="Certificates and skill evidence submitted by students."
      />
    ),
  },
  { path: '/teacher/students', roles: ['teacher', 'admin'], render: () => <TeacherStudentsPage /> },

  // Admin
  { path: '/admin', roles: ['admin'], render: () => <AdminOverviewPage /> },
  { path: '/admin/users', roles: ['admin'], render: () => <AdminUsersPage /> },
  { path: '/admin/platform', roles: ['admin'], render: () => <AdminPlatformPage /> },
  { path: '/admin/verifications', roles: ['admin'], render: () => <AdminVerificationsPage /> },

  // Shared
  { path: '/profile/:id', roles: ['recruiter', 'teacher', 'admin'], render: (p) => <ProfileViewPage studentId={p.id} /> },
  { path: '/messages', roles: ['student', 'recruiter'], render: () => <MessagesPage /> },
  { path: '/notifications', roles: ALL, render: () => <NotificationsPage /> },
  { path: '/collaborate', roles: ['student', 'teacher'], render: () => <CollaborateRoute /> },
];

/** Old URLs from the previous version of the site. */
export const ALIASES: Record<string, string> = { '/discover': '/recruiter/talent' };

export const PUBLIC_PATHS = ['/', '/projects', '/skills-evidence', '/how-it-works'];

export function matchRoute(pathname: string): { route: AppRoute; params: Record<string, string> } | null {
  const parts = pathname.replace(/\/+$/, '').split('/');
  for (const route of APP_ROUTES) {
    const pattern = route.path.split('/');
    if (pattern.length !== parts.length) continue;
    const params: Record<string, string> = {};
    const ok = pattern.every((seg, i) => {
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = decodeURIComponent(parts[i]);
        return !!parts[i];
      }
      return seg === parts[i];
    });
    if (ok) return { route, params };
  }
  return null;
}
