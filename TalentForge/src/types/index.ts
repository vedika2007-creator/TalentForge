export type UserRole = 'student' | 'teacher' | 'admin' | 'recruiter';

export interface SkillEvidence {
  id: string;
  skillName: string;
  category: 'Frontend' | 'Backend' | 'AI/ML' | 'DevOps' | 'Database' | 'Mobile';
  confidenceScore: number; // 0 to 100
  status: 'verified' | 'pending' | 'needs_revision';
  evidenceSources: {
    projectsCount: number;
    githubContributions: number;
    assessmentsCompleted: number;
    certificatesCount: number;
    facultyVerified: boolean;
    verifierName?: string;
    verifiedDate?: string;
  };
  weightBreakdown: {
    projects: number; // e.g. 35%
    github: number;   // e.g. 25%
    assessment: number; // e.g. 20%
    faculty: number;  // e.g. 20%
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  headline: string;
  bio: string;
  avatar: string;
  college: string;
  batchYear: number;
  overallScore: number;
  location: string;
  githubUsername: string;
  skills: SkillEvidence[];
  projectCount: number;
  verifiedCount: number;
  totalGithubCommits: number;
  targetRole: string;
  availableForHire: boolean;
  featuredProjects: string[];
  department?: string;
  repositoryCount?: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  role: string;
  technologies: string[];
  domain: 'Web Development' | 'AI & Machine Learning' | 'Cloud & Systems' | 'Mobile' | 'Cybersecurity';
  isFacultyVerified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  githubUrl: string;
  demoUrl?: string;
  metrics: {
    stars: number;
    commits: number;
    contributors: number;
  };
  highlights: string[];
  createdAt?: string;
}

export interface VerificationRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentDepartment: string;
  skillOrProjectTitle: string;
  type: 'project' | 'skill_assessment' | 'certificate';
  submittedAt: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'rejected';
  submittedEvidence: {
    githubRepo?: string;
    projectReportUrl?: string;
    demoUrl?: string;
    certificateIssuer?: string;
    assessmentScore?: number;
    certificateUrl?: string | null;
  };
  notes?: string;
  projectId?: string | null;
  skillId?: string | null;
  skillName?: string | null;
  certificateId?: string | null;
  certificateTitle?: string | null;
  reviewedAt?: string | null;
  reviewerName?: string | null;
}

export interface CollaborationPost {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRole: string;
  creatorCollege?: string;
  lookingFor: string[];
  domain: string;
  currentMembers: number;
  maxMembers: number;
  postedDate: string;
  tags: string[];
  creatorId?: string;
  isMember?: boolean;
}

export interface RecruiterJobRequirement {
  id: string;
  title: string;
  company?: string;
  createdAt?: string;
  department: string;
  requiredSkills: string[];
  minConfidence: number;
  preferredProjects: number;
  requireFacultyVerification: boolean;
  locationType: 'Remote' | 'Hybrid' | 'Onsite';
}

export interface PlatformAnalytics {
  totalStudents: number;
  verifiedProjects: number;
  hiringCompanies: number;
  matchAccuracy: number;
  pendingVerifications: number;
  activeTeachers: number;
  totalSkillsVerified: number;
  weeklyGrowthRate: number;
  live?: {
    students: number;
    teachers: number;
    recruiters: number;
    projects: number;
    verifiedProjects: number;
    pendingVerifications: number;
    verifiedSkills: number;
    openJobs: number;
    collaborations: number;
  };
}

export interface JobOpportunity extends RecruiterJobRequirement {
  match: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface SkillMatch {
  studentId: string;
  name: string;
  targetRole: string;
  overallScore: number;
  skillName: string;
  confidenceScore: number;
  facultyVerified: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  avatar: string | null;
  college: string | null;
  department: string | null;
  headline: string | null;
  isActive: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Platform workflow (profiles, applications, messaging, notifications)
// ---------------------------------------------------------------------------

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number | null;
  endYear: number | null;
  grade: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  achievedOn: string | null;
}

export type EvidenceStatus = 'verified' | 'pending' | 'needs_revision';

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  url: string | null;
  issuedDate: string | null;
  status: EvidenceStatus;
  skillName: string | null;
}

export interface StudentFullProfile extends StudentProfile {
  email: string | null;
  joinedAt: string;
  education: Education[];
  achievements: Achievement[];
  certificates: Certificate[];
  projects: ProjectItem[];
  shortlisted?: boolean;
  applications?: { id: string; jobTitle: string; status: ApplicationStatus }[];
}

export interface Job extends RecruiterJobRequirement {
  location: string;
  description: string;
  recruiterId: string;
  isActive: boolean;
  applicantCount: number;
  recruiterName?: string;
}

export type ApplicationStatus = 'applied' | 'shortlisted' | 'interview' | 'selected' | 'rejected' | 'withdrawn';

export interface Opportunity extends Job {
  match: number;
  matchedSkills: string[];
  missingSkills: string[];
  application: { id: string; status: ApplicationStatus } | null;
}

export interface Interview {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: 'Online' | 'Onsite' | 'Phone';
  location: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  coverNote: string;
  recruiterNote?: string;
  createdAt: string;
  updatedAt: string;
  match: number;
  matchedSkills: string[];
  missingSkills: string[];
  unreadMessages: number;
  canMessage: boolean;
  job: { id: string; title: string; company: string; locationType: string; location: string; requiredSkills: string[] };
  student: {
    id: string;
    name: string;
    avatar: string | null;
    college: string;
    headline: string;
    overallScore: number;
    verifiedCount: number;
  };
  recruiter: { id: string; name: string; avatar: string | null };
  interviews: Interview[];
}

export interface Candidate {
  student: StudentProfile;
  match: number;
  matchedSkills: string[];
  missingSkills: string[];
  applicationStatus: ApplicationStatus | null;
  shortlisted: boolean;
}

export interface Conversation {
  applicationId: string;
  status: ApplicationStatus;
  jobTitle: string;
  company: string;
  other: { id: string; name: string; avatar: string | null };
  lastMessage: string | null;
  lastAt: string;
  unread: number;
  canMessage: boolean;
}

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  mine: boolean;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface AdminReports {
  usersByRole: Record<string, number>;
  suspendedUsers: number;
  pendingFaculty: number;
  verificationsByStatus: Record<string, number>;
  verificationsByType: Record<string, number>;
  avgReviewHours: number | null;
  applicationsByStatus: Record<string, number>;
  jobs: { active: number; closed: number };
  topVerifiedSkills: { name: string; count: number }[];
  interviewsScheduled: number;
}
