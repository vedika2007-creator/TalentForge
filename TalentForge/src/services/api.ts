/**
 * TALENTFORGE API client — talks to the FastAPI + SQLite backend in /backend.
 * Response shapes map 1:1 to the interfaces in `../types`.
 */
import {
  AuthUser,
  CollaborationPost,
  JobOpportunity,
  PlatformAnalytics,
  ProjectItem,
  RecruiterJobRequirement,
  SkillMatch,
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

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function setSession(token: string | null, user: AuthUser | null) {
  try {
    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
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

export const talentforgeApi = {
  // --- Auth ---
  login: async (email: string, password: string, role?: UserRole) => {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    setSession(data.access_token, data.user);
    return data.user;
  },

  loginDemo: (role: UserRole) => talentforgeApi.login(DEMO_ACCOUNTS[role], DEMO_PASSWORD, role),

  register: async (payload: { name: string; email: string; password: string; role: UserRole; college?: string }) => {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setSession(data.access_token, data.user);
    return data.user;
  },

  logout: () => setSession(null, null),

  me: () => request<AuthUser>('/auth/me'),

  // --- Analytics ---
  getAnalytics: () => request<PlatformAnalytics>('/analytics'),

  // --- Students ---
  getStudents: (filters?: { skill?: string; minScore?: number; role?: string }) =>
    request<StudentProfile[]>(`/students${qs({ ...filters })}`),

  getStudentById: (id: string) => request<StudentProfile>(`/students/${encodeURIComponent(id)}`),

  getMyProfile: () => request<StudentProfile>('/students/me'),

  getMyOpportunities: () => request<JobOpportunity[]>('/students/me/opportunities'),

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
  }) => request<ProjectItem>('/projects', { method: 'POST', body: JSON.stringify(project) }),

  // --- Teacher verifications ---
  getVerificationRequests: (filters?: { status?: string; studentId?: string }) =>
    request<VerificationRequest[]>(`/verifications${qs({ ...filters })}`),

  updateVerificationStatus: (requestId: string, status: 'approved' | 'changes_requested', notes?: string) =>
    request<VerificationRequest>(`/verifications/${encodeURIComponent(requestId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // --- Collaboration ---
  getCollaborationPosts: () => request<CollaborationPost[]>('/collaborations'),

  createCollaborationPost: (post: {
    title: string;
    description: string;
    domain: string;
    maxMembers: number;
    lookingFor: string[];
    tags: string[];
  }) =>
    request<CollaborationPost>('/collaborations', {
      method: 'POST',
      body: JSON.stringify({
        title: post.title,
        description: post.description,
        domain: post.domain,
        max_members: post.maxMembers,
        looking_for: post.lookingFor,
        tags: post.tags,
      }),
    }),

  joinCollaboration: (postId: string) =>
    request<CollaborationPost>(`/collaborations/${encodeURIComponent(postId)}/join`, { method: 'POST' }),

  // --- Recruiter ---
  getShortlist: () => request<string[]>('/shortlist'),

  toggleShortlist: (studentId: string, jobId?: string) =>
    request<string[]>('/shortlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, job_id: jobId }),
    }),

  getJobs: (mine = false) => request<RecruiterJobRequirement[]>(`/jobs${qs({ mine })}`),

  createJob: (job: {
    title: string;
    company?: string;
    department?: string;
    min_confidence?: number;
    require_faculty_verification?: boolean;
    location_type: RecruiterJobRequirement['locationType'];
    required_skills: string[];
  }) => request<RecruiterJobRequirement>('/jobs', { method: 'POST', body: JSON.stringify(job) }),

  getMatches: (params?: { skill?: string; min_confidence?: number; require_verified?: boolean }) =>
    request<SkillMatch[]>(`/matches${qs({ ...params })}`),

  // --- Admin ---
  getUsers: () => request<AuthUser[]>('/admin/users'),

  setUserActive: (userId: string, isActive: boolean) =>
    request<AuthUser>(`/admin/users/${encodeURIComponent(userId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),
};
