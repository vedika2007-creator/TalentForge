-- TALENTFORGE PostgreSQL Database
-- Schema designed from the supplied TalentForge frontend types/mock data.
-- PostgreSQL 14+

DROP SCHEMA IF EXISTS talentforge CASCADE;
CREATE SCHEMA talentforge;
SET search_path TO talentforge;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- ENUMS
-- =========================
CREATE TYPE user_role AS ENUM ('student','teacher','admin','recruiter');
CREATE TYPE skill_category AS ENUM ('Frontend','Backend','AI/ML','DevOps','Database','Mobile');
CREATE TYPE evidence_status AS ENUM ('verified','pending','needs_revision');
CREATE TYPE project_domain AS ENUM ('Web Development','AI & Machine Learning','Cloud & Systems','Mobile','Cybersecurity');
CREATE TYPE verification_type AS ENUM ('project','skill_assessment','certificate');
CREATE TYPE verification_status AS ENUM ('pending','approved','changes_requested');
CREATE TYPE location_type AS ENUM ('Remote','Hybrid','Onsite');

-- =========================
-- USERS
-- One authentication/account table for all roles.
-- =========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    role user_role NOT NULL,
    avatar_url TEXT,
    college VARCHAR(255),
    department VARCHAR(255),
    batch_year SMALLINT,
    location VARCHAR(255),
    bio TEXT,
    headline VARCHAR(255),
    github_username VARCHAR(100),
    target_role VARCHAR(150),
    overall_score NUMERIC(5,2) DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
    available_for_hire BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- SKILLS
-- =========================
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    category skill_category NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A student's demonstrated skill.
CREATE TABLE student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    confidence_score NUMERIC(5,2) DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
    status evidence_status NOT NULL DEFAULT 'pending',
    projects_count INTEGER NOT NULL DEFAULT 0 CHECK (projects_count >= 0),
    github_contributions INTEGER NOT NULL DEFAULT 0 CHECK (github_contributions >= 0),
    assessments_completed INTEGER NOT NULL DEFAULT 0 CHECK (assessments_completed >= 0),
    certificates_count INTEGER NOT NULL DEFAULT 0 CHECK (certificates_count >= 0),
    faculty_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verifier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    projects_weight NUMERIC(5,2) DEFAULT 35,
    github_weight NUMERIC(5,2) DEFAULT 25,
    assessment_weight NUMERIC(5,2) DEFAULT 20,
    faculty_weight NUMERIC(5,2) DEFAULT 20,
    UNIQUE(student_id, skill_id)
);

-- Optional individual certificates used as evidence.
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    certificate_url TEXT,
    issued_date DATE,
    verification_status evidence_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional assessments used as evidence.
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    score NUMERIC(5,2) CHECK (score BETWEEN 0 AND 100),
    completed_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- GitHub activity evidence.
CREATE TABLE github_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100),
    repository_count INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    contributions INTEGER DEFAULT 0,
    last_synced_at TIMESTAMPTZ
);

-- =========================
-- PROJECTS
-- =========================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(500),
    description TEXT,
    domain project_domain NOT NULL,
    github_url TEXT,
    demo_url TEXT,
    is_faculty_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verification_date DATE,
    stars INTEGER DEFAULT 0 CHECK (stars >= 0),
    commits INTEGER DEFAULT 0 CHECK (commits >= 0),
    contributors INTEGER DEFAULT 0 CHECK (contributors >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A project can have multiple students.
CREATE TABLE project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(150),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (project_id, student_id)
);

CREATE TABLE project_technologies (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE project_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    highlight TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- =========================
-- TEACHER VERIFICATION
-- =========================
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    verification_type verification_type NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status verification_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE verification_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
    github_repo_url TEXT,
    project_report_url TEXT,
    demo_url TEXT,
    certificate_issuer VARCHAR(255),
    assessment_score NUMERIC(5,2) CHECK (assessment_score BETWEEN 0 AND 100)
);

-- =========================
-- RECRUITER / JOBS
-- =========================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    min_confidence NUMERIC(5,2) DEFAULT 0 CHECK (min_confidence BETWEEN 0 AND 100),
    preferred_projects INTEGER DEFAULT 0 CHECK (preferred_projects >= 0),
    require_faculty_verification BOOLEAN NOT NULL DEFAULT FALSE,
    location_type location_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE job_required_skills (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE recruiter_shortlists (
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (recruiter_id, student_id, job_id)
);

-- =========================
-- COLLABORATION
-- =========================
CREATE TABLE collaboration_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(150),
    max_members INTEGER NOT NULL DEFAULT 2 CHECK (max_members > 0),
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE collaboration_members (
    post_id UUID NOT NULL REFERENCES collaboration_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE collaboration_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES collaboration_posts(id) ON DELETE CASCADE,
    role_name VARCHAR(150) NOT NULL
);

CREATE TABLE collaboration_tags (
    post_id UUID NOT NULL REFERENCES collaboration_posts(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (post_id, tag)
);

-- =========================
-- ANALYTICS
-- Can be calculated from transactional tables; this table stores dashboard snapshots.
-- =========================
CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_students INTEGER DEFAULT 0,
    verified_projects INTEGER DEFAULT 0,
    hiring_companies INTEGER DEFAULT 0,
    match_accuracy NUMERIC(5,2) DEFAULT 0,
    pending_verifications INTEGER DEFAULT 0,
    active_teachers INTEGER DEFAULT 0,
    total_skills_verified INTEGER DEFAULT 0,
    weekly_growth_rate NUMERIC(6,2) DEFAULT 0,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_target_role ON users(target_role);
CREATE INDEX idx_users_available ON users(available_for_hire);
CREATE INDEX idx_student_skills_skill ON student_skills(skill_id);
CREATE INDEX idx_student_skills_confidence ON student_skills(confidence_score);
CREATE INDEX idx_projects_domain ON projects(domain);
CREATE INDEX idx_projects_verified ON projects(is_faculty_verified);
CREATE INDEX idx_project_members_student ON project_members(student_id);
CREATE INDEX idx_verification_status ON verification_requests(status);
CREATE INDEX idx_verification_student ON verification_requests(student_id);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_collaboration_creator ON collaboration_posts(creator_id);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_projects_updated
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================
-- USEFUL VIEWS FOR THE FRONTEND
-- =========================

CREATE VIEW student_profiles AS
SELECT
    u.id,
    u.external_id,
    u.name,
    u.headline,
    u.bio,
    u.avatar_url AS avatar,
    u.college,
    u.batch_year,
    u.overall_score,
    u.location,
    u.github_username,
    u.target_role,
    u.available_for_hire,
    COUNT(DISTINCT pm.project_id)::INT AS project_count,
    COUNT(DISTINCT CASE WHEN ss.status = 'verified' THEN ss.id END)::INT AS verified_count,
    COALESCE(ga.total_commits, 0) AS total_github_commits
FROM users u
LEFT JOIN project_members pm ON pm.student_id = u.id
LEFT JOIN student_skills ss ON ss.student_id = u.id
LEFT JOIN github_activity ga ON ga.student_id = u.id
WHERE u.role = 'student'
GROUP BY u.id, ga.total_commits;

CREATE VIEW pending_verifications AS
SELECT
    vr.id,
    vr.external_id,
    vr.student_id,
    u.name AS student_name,
    u.avatar_url AS student_avatar,
    u.department AS student_department,
    vr.title,
    vr.verification_type,
    vr.submitted_at,
    vr.status,
    vr.notes,
    ve.github_repo_url,
    ve.project_report_url,
    ve.demo_url,
    ve.certificate_issuer,
    ve.assessment_score
FROM verification_requests vr
JOIN users u ON u.id = vr.student_id
LEFT JOIN verification_evidence ve ON ve.request_id = vr.id;

-- =========================
-- SEED DATA
-- =========================

INSERT INTO users
(external_id,name,role,avatar_url,college,department,batch_year,location,bio,headline,github_username,target_role,overall_score,available_for_hire)
VALUES
('std_aarav','Aarav Mehta','student','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150','Apex Institute of Technology','B.Tech Computer Science',2026,'Bengaluru, India (Open to Remote)','Computer Science senior focused on production-ready React, Python, and microservice architectures.','Full Stack & Distributed Systems Engineer','aarav-mehta-dev','Python Backend Developer',92,TRUE),
('std_priya','Priya Sharma','student','https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150','National Institute of Engineering','B.Tech AI & Data Science',2026,'Hyderabad, India (Hybrid)','Specializing in computer vision models, convolutional neural networks, and edge ML deployment.','AI / Machine Learning Researcher & Developer','priya-sharma-ml','Machine Learning Engineer',89,TRUE),
('std_rohan','Rohan Patel','student','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150','St. Xavier College of Technology','B.Tech Information Technology',2026,'Pune, India','Kubernetes, Docker, and Terraform automation specialist.','Cloud Systems & DevOps Practitioner','rohan-devops','DevOps / Cloud Engineer',87,TRUE),
('std_sneha','Sneha Verma','student','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150','Metro Design & Technology School','B.Tech Computer Science',2027,'Mumbai, India','Bridges design systems and accessible React interfaces.','Modern UI/UX Designer & Frontend Engineer','sneha-ux','Frontend & UI Systems Engineer',91,TRUE),
('teacher_ramesh','Prof. Ramesh Kulkarni','teacher',NULL,'Apex Institute of Technology','Computer Science',NULL,NULL,NULL,NULL,NULL,NULL,0,FALSE),
('teacher_sunita','Dr. Sunita Rao','teacher',NULL,'Apex Institute of Technology','Cybersecurity',NULL,NULL,NULL,NULL,NULL,NULL,0,FALSE),
('teacher_arvind','Dr. Arvind Swaminathan','teacher',NULL,'National Institute of Engineering','AgriTech Lab',NULL,NULL,NULL,NULL,NULL,NULL,0,FALSE),
('teacher_sandeep','Prof. Sandeep Joshi','teacher',NULL,'St. Xavier College of Technology','Networks & Distributed Systems',NULL,NULL,NULL,NULL,NULL,NULL,0,FALSE),
('teacher_neha','Prof. Neha Deshmukh','teacher',NULL,'Metro Design & Technology School','Design Systems',NULL,NULL,NULL,NULL,NULL,NULL,0,FALSE);

INSERT INTO skills(name,category) VALUES
('Python','Backend'),
('Django & REST APIs','Backend'),
('React & TypeScript','Frontend'),
('PostgreSQL','Database'),
('Machine Learning','AI/ML'),
('TensorFlow & PyTorch','AI/ML'),
('Pandas & NumPy','AI/ML'),
('Deep Learning','AI/ML'),
('Docker & Kubernetes','DevOps'),
('CI/CD Pipelines (GitHub Actions)','DevOps'),
('Tailwind CSS & Design Systems','Frontend'),
('React & Next.js','Frontend'),
('FastAPI','Backend'),
('OpenCV','AI/ML'),
('Flutter','Mobile'),
('Go','Backend'),
('Prometheus','DevOps'),
('Grafana','DevOps'),
('Cryptography','Backend'),
('Redis','Backend');

-- Project records
INSERT INTO projects
(external_id,title,tagline,description,domain,github_url,demo_url,is_faculty_verified,verification_date,stars,commits,contributors)
VALUES
('proj_1','Smart City Traffic Intelligence','Real-time adaptive signal control using camera feed edge computing','An intelligent traffic management system that processes streaming CCTV video frames at intersections using YOLOv8, detects congestion density, and automatically updates signal phase timings through a FastAPI microservice backend.','AI & Machine Learning','https://github.com/talentforge/smart-traffic-intel','https://traffic-demo.talentforge.dev',TRUE,'2026-08-18',124,142,3),
('proj_2','AI-Based Crop Disease Detection','Lightweight MobileNet classifier detecting 26 plant leaf pathologies','Developed an offline-first computer vision model that identifies fungal and bacterial crop diseases from smartphone camera snaps, generating localized treatment recommendations in 6 vernacular languages.','AI & Machine Learning','https://github.com/talentforge/crop-disease-vision','https://crop-guard.talentforge.dev',TRUE,'2026-07-24',89,98,2),
('proj_3','Decentralized Academic Credential Vault','Tamper-proof verifiable credentials protocol for university transcripts','An open protocol standard enabling educational boards to issue cryptographically signed, self-sovereign digital diplomas and transcripts verifiable in sub-second time without central database reliance.','Cloud & Systems','https://github.com/talentforge/credential-vault',NULL,TRUE,'2026-06-12',76,112,2),
('proj_4','Neural Health Diagnostic Assistant','Multi-modal EHR summarization and lab biomarker risk prediction','Clinical decision-support prototype parsing electronic health records, lab blood panels, and patient medical history to highlight contraindications and cardiovascular risk signals.','AI & Machine Learning','https://github.com/talentforge/neural-health-diagnostics',NULL,FALSE,NULL,62,77,3),
('proj_5','Multi-Cluster Microservice Orchestrator','Zero-downtime deployment engine with automated health rollbacks','Lightweight internal developer platform running automated canary deployments, traffic splitting, and telemetry metric scrapers across Kubernetes worker nodes.','Cloud & Systems','https://github.com/talentforge/cluster-orchestrator',NULL,TRUE,'2026-08-02',108,135,1);

-- Project membership
INSERT INTO project_members(project_id,student_id,role,is_featured)
SELECT p.id,u.id,'Lead Backend & Algorithm Architect',TRUE
FROM projects p JOIN users u ON u.external_id='std_aarav' WHERE p.external_id='proj_1';
INSERT INTO project_members(project_id,student_id,role,is_featured)
SELECT p.id,u.id,'ML Researcher & Model Architect',TRUE
FROM projects p JOIN users u ON u.external_id='std_priya' WHERE p.external_id='proj_2';
INSERT INTO project_members(project_id,student_id,role,is_featured)
SELECT p.id,u.id,'Systems Architect',TRUE
FROM projects p JOIN users u ON u.external_id='std_aarav' WHERE p.external_id='proj_3';
INSERT INTO project_members(project_id,student_id,role,is_featured)
SELECT p.id,u.id,'Data Science Lead',FALSE
FROM projects p JOIN users u ON u.external_id='std_priya' WHERE p.external_id='proj_4';
INSERT INTO project_members(project_id,student_id,role,is_featured)
SELECT p.id,u.id,'Infrastructure Engineer',TRUE
FROM projects p JOIN users u ON u.external_id='std_rohan' WHERE p.external_id='proj_5';

-- Project technologies
INSERT INTO project_technologies(project_id,skill_id)
SELECT p.id,s.id FROM projects p, skills s
WHERE p.external_id='proj_1' AND s.name IN ('React & TypeScript','Python','FastAPI','Machine Learning','Docker & Kubernetes','PostgreSQL');
INSERT INTO project_technologies(project_id,skill_id)
SELECT p.id,s.id FROM projects p, skills s
WHERE p.external_id='proj_2' AND s.name IN ('Python','TensorFlow & PyTorch','OpenCV','FastAPI','Flutter');
INSERT INTO project_technologies(project_id,skill_id)
SELECT p.id,s.id FROM projects p, skills s
WHERE p.external_id='proj_3' AND s.name IN ('Python','Django & REST APIs','PostgreSQL','Cryptography','Redis');
INSERT INTO project_technologies(project_id,skill_id)
SELECT p.id,s.id FROM projects p, skills s
WHERE p.external_id='proj_4' AND s.name IN ('Python','TensorFlow & PyTorch','Pandas & NumPy','FastAPI','React & TypeScript');
INSERT INTO project_technologies(project_id,skill_id)
SELECT p.id,s.id FROM projects p, skills s
WHERE p.external_id='proj_5' AND s.name IN ('Go','Docker & Kubernetes','Prometheus','Grafana');

-- Skill evidence
INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at,projects_weight,github_weight,assessment_weight,faculty_weight)
SELECT u.id,s.id,94,'verified',6,320,4,2,TRUE,t.id,'2026-08-01',35,30,15,20
FROM users u,skills s,users t WHERE u.external_id='std_aarav' AND s.name='Python' AND t.external_id='teacher_ramesh';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at,projects_weight,github_weight,assessment_weight,faculty_weight)
SELECT u.id,s.id,92,'verified',4,180,3,1,TRUE,t.id,'2026-09-01',40,25,15,20
FROM users u,skills s,users t WHERE u.external_id='std_aarav' AND s.name='Django & REST APIs' AND t.external_id='teacher_ramesh';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at,projects_weight,github_weight,assessment_weight,faculty_weight)
SELECT u.id,s.id,88,'verified',5,210,2,1,TRUE,t.id,'2026-07-01',35,25,20,20
FROM users u,skills s,users t WHERE u.external_id='std_aarav' AND s.name='React & TypeScript' AND t.external_id='teacher_sunita';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at,projects_weight,github_weight,assessment_weight,faculty_weight)
SELECT u.id,s.id,90,'verified',4,95,3,1,TRUE,t.id,'2026-08-01',30,20,25,25
FROM users u,skills s,users t WHERE u.external_id='std_aarav' AND s.name='PostgreSQL' AND t.external_id='teacher_ramesh';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at)
SELECT u.id,s.id,93,'verified',5,280,4,3,TRUE,t.id,'2026-08-01'
FROM users u,skills s,users t WHERE u.external_id='std_priya' AND s.name='Machine Learning' AND t.external_id='teacher_arvind';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at)
SELECT u.id,s.id,90,'verified',4,190,3,2,TRUE,t.id,'2026-08-01'
FROM users u,skills s,users t WHERE u.external_id='std_priya' AND s.name='TensorFlow & PyTorch' AND t.external_id='teacher_arvind';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at)
SELECT u.id,s.id,95,'verified',6,310,5,2,TRUE,t.id,'2026-06-01'
FROM users u,skills s,users t WHERE u.external_id='std_priya' AND s.name='Pandas & NumPy' AND t.external_id='teacher_arvind';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified)
SELECT u.id,s.id,78,'pending',2,90,1,1,FALSE
FROM users u,skills s WHERE u.external_id='std_priya' AND s.name='Deep Learning';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at)
SELECT u.id,s.id,89,'verified',4,180,2,2,TRUE,t.id,'2026-07-01'
FROM users u,skills s,users t WHERE u.external_id='std_rohan' AND s.name='Docker & Kubernetes' AND t.external_id='teacher_sandeep';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at)
SELECT u.id,s.id,86,'verified',5,140,2,1,TRUE,t.id,'2026-08-01'
FROM users u,skills s,users t WHERE u.external_id='std_rohan' AND s.name='CI/CD Pipelines (GitHub Actions)' AND t.external_id='teacher_sandeep';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at)
SELECT u.id,s.id,96,'verified',7,240,4,2,TRUE,t.id,'2026-07-01'
FROM users u,skills s,users t WHERE u.external_id='std_sneha' AND s.name='Tailwind CSS & Design Systems' AND t.external_id='teacher_neha';

INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at)
SELECT u.id,s.id,92,'verified',5,210,3,2,TRUE,t.id,'2026-08-01'
FROM users u,skills s,users t WHERE u.external_id='std_sneha' AND s.name='React & Next.js' AND t.external_id='teacher_neha';

-- GitHub activity
INSERT INTO github_activity(student_id,username,repository_count,total_commits,contributions,last_synced_at)
SELECT id,github_username,8,482,482,NOW() FROM users WHERE external_id='std_aarav';
INSERT INTO github_activity(student_id,username,repository_count,total_commits,contributions,last_synced_at)
SELECT id,github_username,6,395,395,NOW() FROM users WHERE external_id='std_priya';
INSERT INTO github_activity(student_id,username,repository_count,total_commits,contributions,last_synced_at)
SELECT id,github_username,5,310,310,NOW() FROM users WHERE external_id='std_rohan';
INSERT INTO github_activity(student_id,username,repository_count,total_commits,contributions,last_synced_at)
SELECT id,github_username,7,290,290,NOW() FROM users WHERE external_id='std_sneha';

-- Verification requests
INSERT INTO verification_requests(external_id,student_id,title,verification_type,submitted_at,status,notes)
SELECT 'req_1',id,'AI-Based Crop Disease Detection','project','2026-09-16 10:30:00+05:30','pending','Submitted updated confusion matrix and INT8 quantization benchmarks following feedback.'
FROM users WHERE external_id='std_priya';
INSERT INTO verification_requests(external_id,student_id,title,verification_type,submitted_at,status,notes)
SELECT 'req_2',id,'Advanced PostgreSQL Database Indexing Assessment','skill_assessment','2026-09-15 16:15:00+05:30','approved','Completed live SQL query optimization trial on 10M record dataset.'
FROM users WHERE external_id='std_aarav';
INSERT INTO verification_requests(external_id,student_id,title,verification_type,submitted_at,status,notes)
SELECT 'req_3',id,'Kubernetes Multi-Cluster Orchestration','project','2026-09-14 12:00:00+05:30','pending','Demonstrated automated rollback in network laboratory.'
FROM users WHERE external_id='std_rohan';

INSERT INTO verification_evidence(request_id,github_repo_url,project_report_url,demo_url,certificate_issuer)
SELECT vr.id,'https://github.com/talentforge/crop-disease-vision','https://talentforge.dev/reports/priya-crop-disease-v2.pdf','https://crop-guard.talentforge.dev','National Agri-Tech Symposium Finalist'
FROM verification_requests vr WHERE vr.external_id='req_1';
INSERT INTO verification_evidence(request_id,certificate_issuer,assessment_score)
SELECT vr.id,'TalentForge Verified Sandbox Exam #492',96
FROM verification_requests vr WHERE vr.external_id='req_2';
INSERT INTO verification_evidence(request_id,github_repo_url,demo_url)
SELECT vr.id,'https://github.com/talentforge/cluster-orchestrator','https://k8s-cluster.campus.edu'
FROM verification_requests vr WHERE vr.external_id='req_3';

-- Collaboration posts
INSERT INTO collaboration_posts(external_id,creator_id,title,description,domain,max_members,posted_at)
SELECT 'collab_1,id',''::uuid,'','', '', 4, NOW()
WHERE FALSE;
-- Explicit inserts without relying on mock-only "Just now" strings.
INSERT INTO collaboration_posts(external_id,creator_id,title,description,domain,max_members,posted_at)
SELECT 'collab_1',id,'AI Healthcare Assistant for Primary Clinics','Building a multi-lingual symptom triage tool designed for rural health workers with intermittent cellular connectivity.','Healthcare AI',4,NOW()
FROM users WHERE external_id='std_priya';
INSERT INTO collaboration_posts(external_id,creator_id,title,description,domain,max_members,posted_at)
SELECT 'collab_2',id,'Autonomous Solar Microgrid Power Allocator','IoT telemetry aggregator balancing rooftop solar feed-in tariffs across residential college dorms.','CleanTech & IoT',3,NOW()
FROM users WHERE external_id='std_rohan';
INSERT INTO collaboration_posts(external_id,creator_id,title,description,domain,max_members,posted_at)
SELECT 'collab_3',id,'Open Source College Exam Timetable Optimizer','Constraint satisfaction solver using genetic algorithms to schedule 120+ courses without classroom or faculty conflicts.','Operations Research & Web',5,NOW()
FROM users WHERE external_id='std_aarav';

-- Collaboration members: creator is initial member.
INSERT INTO collaboration_members(post_id,user_id)
SELECT cp.id,u.id FROM collaboration_posts cp,users u WHERE cp.external_id='collab_1' AND u.external_id='std_priya';
INSERT INTO collaboration_members(post_id,user_id)
SELECT cp.id,u.id FROM collaboration_posts cp,users u WHERE cp.external_id='collab_2' AND u.external_id='std_rohan';
INSERT INTO collaboration_members(post_id,user_id)
SELECT cp.id,u.id FROM collaboration_posts cp,users u WHERE cp.external_id='collab_3' AND u.external_id='std_aarav';

-- Roles/tags
INSERT INTO collaboration_roles(post_id,role_name)
SELECT id,'ML Developer (Edge ML)' FROM collaboration_posts WHERE external_id='collab_1';
INSERT INTO collaboration_roles(post_id,role_name)
SELECT id,'UI/UX Designer' FROM collaboration_posts WHERE external_id='collab_1';
INSERT INTO collaboration_roles(post_id,role_name)
SELECT id,'Backend Developer (FastAPI)' FROM collaboration_posts WHERE external_id='collab_1';
INSERT INTO collaboration_roles(post_id,role_name)
SELECT id,'Embedded Firmware Dev' FROM collaboration_posts WHERE external_id='collab_2';
INSERT INTO collaboration_roles(post_id,role_name)
SELECT id,'Full Stack Dashboard Lead' FROM collaboration_posts WHERE external_id='collab_2';
INSERT INTO collaboration_roles(post_id,role_name)
SELECT id,'Frontend Engineer (Tailwind/React)' FROM collaboration_posts WHERE external_id='collab_3';
INSERT INTO collaboration_roles(post_id,role_name)
SELECT id,'QA / Test Lead' FROM collaboration_posts WHERE external_id='collab_3';

INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Python' FROM collaboration_posts WHERE external_id='collab_1';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'FastAPI' FROM collaboration_posts WHERE external_id='collab_1';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'React' FROM collaboration_posts WHERE external_id='collab_1';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Offline-First' FROM collaboration_posts WHERE external_id='collab_1';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Go' FROM collaboration_posts WHERE external_id='collab_2';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Docker' FROM collaboration_posts WHERE external_id='collab_2';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Time-Series DB' FROM collaboration_posts WHERE external_id='collab_2';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Hardware' FROM collaboration_posts WHERE external_id='collab_2';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Python' FROM collaboration_posts WHERE external_id='collab_3';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Django' FROM collaboration_posts WHERE external_id='collab_3';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'React' FROM collaboration_posts WHERE external_id='collab_3';
INSERT INTO collaboration_tags(post_id,tag)
SELECT id,'Algorithms' FROM collaboration_posts WHERE external_id='collab_3';

-- Add recruiter accounts and jobs from the same users/jobs tables when the backend is connected.

-- Analytics snapshot matching the supplied frontend demo.
INSERT INTO analytics_snapshots
(total_students,verified_projects,hiring_companies,match_accuracy,pending_verifications,active_teachers,total_skills_verified,weekly_growth_rate)
VALUES (10450,5280,2150,95.4,42,380,14890,14.8);

-- =========================
-- EXAMPLE BACKEND QUERIES
-- =========================

-- Search students by skill and minimum confidence:
-- SELECT sp.*
-- FROM student_profiles sp
-- JOIN student_skills ss ON ss.student_id = sp.id
-- JOIN skills s ON s.id = ss.skill_id
-- WHERE LOWER(s.name) LIKE LOWER('%python%')
--   AND ss.confidence_score >= 80;

-- Get verified projects:
-- SELECT * FROM projects WHERE is_faculty_verified = TRUE;

-- Get pending teacher verification requests:
-- SELECT * FROM pending_verifications WHERE status = 'pending';

-- Recruiter matching example:
-- SELECT u.name, u.target_role, u.overall_score, ss.confidence_score
-- FROM users u
-- JOIN student_skills ss ON ss.student_id = u.id
-- JOIN skills s ON s.id = ss.skill_id
-- WHERE u.role = 'student'
--   AND u.available_for_hire = TRUE
--   AND s.name = 'Python'
--   AND ss.confidence_score >= 80
-- ORDER BY ss.confidence_score DESC;
