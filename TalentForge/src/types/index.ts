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
  status: 'pending' | 'approved' | 'changes_requested';
  submittedEvidence: {
    githubRepo?: string;
    projectReportUrl?: string;
    demoUrl?: string;
    certificateIssuer?: string;
    assessmentScore?: number;
  };
  notes?: string;
  projectId?: string | null;
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
