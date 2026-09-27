/**
 * TALENTFORGE API client — talks to the FastAPI + SQLite backend in /backend.
 * Response shapes map 1:1 to the interfaces in `../types`.
 */
import {
  Application,
  ApplicationStatus,
  AuthUser,
  Candidate,
  ChatMessage,
  CollaborationPost,
  Conversation,
  Interview,
  Job,
  NotificationItem,
  Opportunity,
  PlatformAnalytics,
  ProjectItem,
  AdminReports,
  StudentFullProfile,
  StudentProfile,
  UserRole,
  VerificationRequest,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'talentforge_token';
const USER_KEY = 'talentforge_user';
export const AUTH_EVENT = 'talentforge:auth';

/** Every seeded account uses this password (see backend/.env DEMO_PASSWORD). */
export const DEMO_PASSWORD = 'demo1234';
export const DEMO_ACCOUNTS: Record<UserRole, string> = {
  student: 'aarav@talentforge.dev',
  teacher: 'ramesh@talentforge.dev',
  recruiter: 'recruiter@talentforge.dev',
  admin: 'admin@talentforge.dev',
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Sessions live in sessionStorage so each browser tab can be signed in as a different role
// (e.g. a student in one tab and faculty in another) without overwriting each other.
const store = window.sessionStorage;

function getToken() {
  try {
    return store.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = store.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function setSession(token: string | null, user: AuthUser | null) {
  try {
    if (token && user) {
      store.setItem(TOKEN_KEY, token);
      store.setItem(USER_KEY, JSON.stringify(user));
    } else {
      store.removeItem(TOKEN_KEY);
      store.removeItem(USER_KEY);
    }
  } catch {
    // storage unavailable — session lives only in memory for this page load
  }
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Cannot reach the TalentForge API. Is the backend running on port 8000?', 0);
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((d: { msg: string }) => d.msg).join(', ');
    } catch {
      // non-JSON error body
    }
    // Stale or invalid session: drop it so the UI falls back to signed-out state.
    if (response.status === 401 && token) setSession(null, null);
    throw new ApiError(message, response.status);
  }
  return response.json();
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== false) q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

type AuthResponse = { access_token: string; user: AuthUser };
type PendingApproval = { pending_approval: true; message: string };
type Profile = StudentFullProfile;

const post = (body?: unknown): RequestInit => ({ method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
const patch = (body: unknown): RequestInit => ({ method: 'PATCH', body: JSON.stringify(body) });
const del: RequestInit = { method: 'DELETE' };
const enc = encodeURIComponent;

export const talentforgeApi = {
  // --- Auth: the role is read from the account, never chosen at sign-in ---
  login: async (email: string, password: string) => {
    const data = await request<AuthResponse>('/auth/login', post({ email, password }));
    setSession(data.access_token, data.user);
    return data.user;
  },

  loginDemo: (role: UserRole) => talentforgeApi.login(DEMO_ACCOUNTS[role], DEMO_PASSWORD),

  /** Returns the signed-in user, or a pending-approval notice for faculty sign-ups. */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: Exclude<UserRole, 'admin'>;
    college?: string;
  }): Promise<AuthUser | PendingApproval> => {
    const data = await request<AuthResponse | PendingApproval>('/auth/register', post(payload));
    if ('pending_approval' in data) return data;
    setSession(data.access_token, data.user);
    return data.user;
  },

  logout: () => setSession(null, null),

  me: () => request<AuthUser>('/auth/me'),

  // --- Analytics (public landing numbers) ---
  getAnalytics: () => request<PlatformAnalytics>('/analytics'),

  // --- Students directory (recruiters, faculty, admins) ---
  getStudents: (filters?: { skill?: string; minScore?: number; role?: string }) =>
    request<StudentProfile[]>(`/students${qs({ ...filters })}`),

  getProfile: (studentId: string) => request<Profile>(`/profiles/${enc(studentId)}`),

  // --- Student: own profile ---
  getMyProfile: () => request<Profile>('/students/me/profile'),
  updateMyProfile: (fields: Partial<{
    name: string;
    headline: string;
    bio: string;
    college: string;
    department: string;
    batch_year: number;
    location: string;
    github_username: string;
    target_role: string;
    available_for_hire: boolean;
    avatar_url: string;
  }>) => request<StudentProfile>('/students/me', patch(fields)),
  addEducation: (e: { institution: string; degree?: string; field_of_study?: string; start_year?: number; end_year?: number; grade?: string }) =>
    request<Profile>('/students/me/education', post(e)),
  deleteEducation: (id: string) => request<Profile>(`/students/me/education/${enc(id)}`, del),
  addAchievement: (a: { title: string; description?: string; achieved_on?: string }) =>
    request<Profile>('/students/me/achievements', post(a)),
  deleteAchievement: (id: string) => request<Profile>(`/students/me/achievements/${enc(id)}`, del),
  addSkill: (name: string) => request<Profile>('/students/me/skills', post({ name })),
  deleteSkill: (id: string) => request<Profile>(`/students/me/skills/${enc(id)}`, del),
  submitSkillEvidence: (id: string, description: string, evidenceUrl?: string) =>
    request<Profile>(`/students/me/skills/${enc(id)}/evidence`, post({ description, evidence_url: evidenceUrl })),
  addCertificate: (c: { title: string; issuer?: string; certificate_url?: string; issued_date?: string; skill?: string }) =>
    request<Profile>('/students/me/certificates', post(c)),
  deleteCertificate: (id: string) => request<Profile>(`/students/me/certificates/${enc(id)}`, del),

  // --- Projects ---
  getProjects: (filters?: { domain?: string; verifiedOnly?: boolean; search?: string; authorId?: string }) =>
    request<ProjectItem[]>(`/projects${qs({ ...filters })}`),

  submitProject: (project: {
    title: string;
    tagline?: string;
    description?: string;
    domain: ProjectItem['domain'];
    github_url?: string;
    demo_url?: string;
    technologies: string[];
  }) => request<ProjectItem>('/projects', post(project)),

  // --- Verification (faculty review; students see only their own) ---
  getVerificationRequests: (filters?: { status?: string; studentId?: string; type?: string }) =>
    request<VerificationRequest[]>(`/verifications${qs({ ...filters })}`),

  updateVerificationStatus: (requestId: string, status: 'approved' | 'changes_requested' | 'rejected', notes?: string) =>
    request<VerificationRequest>(`/verifications/${enc(requestId)}`, patch({ status, notes })),

  // --- Student: opportunities & applications ---
  getOpportunities: () => request<Opportunity[]>('/opportunities'),
  applyToJob: (jobId: string, coverNote?: string) => request<{ ok: true }>(`/jobs/${enc(jobId)}/apply`, post({ cover_note: coverNote })),
  getMyApplications: () => request<Application[]>('/applications/mine'),
  withdrawApplication: (id: string) => request<Application>(`/applications/${enc(id)}/withdraw`, post()),

  // --- Recruiter: jobs, pipeline, talent ---
  getJobs: (mine = false) => request<Job[]>(`/jobs${qs({ mine })}`),
  createJob: (job: {
    title: string;
    company?: string;
    department?: string;
    location?: string;
    description?: string;
    min_confidence?: number;
    require_faculty_verification?: boolean;
    location_type: Job['locationType'];
    required_skills: string[];
  }) => request<Job>('/jobs', post(job)),
  setJobActive: (jobId: string, isActive: boolean) => request<Job>(`/jobs/${enc(jobId)}`, patch({ is_active: isActive })),
  getRecruiterApplications: (filters?: { job_id?: string; status?: string }) =>
    request<Application[]>(`/recruiter/applications${qs({ ...filters })}`),
  updateApplication: (id: string, status: Exclude<ApplicationStatus, 'withdrawn'>, note?: string) =>
    request<Application>(`/applications/${enc(id)}`, patch({ status, note })),
  scheduleInterview: (id: string, interview: { scheduled_at: string; duration_minutes: number; mode: Interview['mode']; location?: string; notes?: string }) =>
    request<Application>(`/applications/${enc(id)}/interviews`, post(interview)),
  updateInterview: (id: string, status: Interview['status']) => request<Application>(`/interviews/${enc(id)}`, patch({ status })),
  getJobCandidates: (jobId: string) => request<Candidate[]>(`/jobs/${enc(jobId)}/candidates`),
  getShortlist: () => request<string[]>('/shortlist'),
  getShortlistProfiles: () => request<(StudentProfile & { shortlistedAt: string })[]>('/recruiter/shortlist'),
  toggleShortlist: (studentId: string, jobId?: string) =>
    request<string[]>('/shortlist/toggle', post({ student_id: studentId, job_id: jobId })),

  // --- Messaging ---
  getConversations: () => request<Conversation[]>('/conversations'),
  getMessages: (applicationId: string) => request<ChatMessage[]>(`/applications/${enc(applicationId)}/messages`),
  sendMessage: (applicationId: string, body: string) =>
    request<ChatMessage[]>(`/applications/${enc(applicationId)}/messages`, post({ body })),

  // --- Notifications ---
  getNotifications: () => request<{ unread: number; items: NotificationItem[] }>('/notifications'),
  markNotificationRead: (id: string) => request<{ unread: number; items: NotificationItem[] }>(`/notifications/${enc(id)}/read`, post()),
  markAllNotificationsRead: () => request<{ unread: number; items: NotificationItem[] }>('/notifications/read-all', post()),

  // --- Collaboration ---
  getCollaborationPosts: () => request<CollaborationPost[]>('/collaborations'),

  createCollaborationPost: (p: { title: string; description: string; domain: string; maxMembers: number; lookingFor: string[]; tags: string[] }) =>
    request<CollaborationPost>('/collaborations', post({
      title: p.title,
      description: p.description,
      domain: p.domain,
      max_members: p.maxMembers,
      looking_for: p.lookingFor,
      tags: p.tags,
    })),

  joinCollaboration: (postId: string) => request<CollaborationPost>(`/collaborations/${enc(postId)}/join`, post()),

  // --- Admin ---
  getUsers: () => request<AuthUser[]>('/admin/users'),
  setUserActive: (userId: string, isActive: boolean) =>
    request<AuthUser>(`/admin/users/${enc(userId)}/status`, patch({ is_active: isActive })),
  getReports: () => request<AdminReports>('/admin/reports'),
  getAllJobs: () => request<Job[]>('/admin/jobs'),
};
