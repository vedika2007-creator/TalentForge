-- TALENTFORGE schema v2: student profiles, recruitment workflow, messaging and notifications.
-- Idempotent: applied on top of schema.sql for new databases and to upgrade existing ones.
-- (Columns added to existing tables are handled in database.py because SQLite has no
--  "ADD COLUMN IF NOT EXISTS".)

-- LinkedIn-style profile sections
CREATE TABLE IF NOT EXISTS student_education (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree TEXT,
    field_of_study TEXT,
    start_year INTEGER,
    end_year INTEGER,
    grade TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS student_achievements (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    achieved_on TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- Recruitment pipeline: applied -> shortlisted -> interview -> selected | rejected (or withdrawn by the student)
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied','shortlisted','interview','selected','rejected','withdrawn')),
    cover_note TEXT,
    recruiter_note TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    UNIQUE(job_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);

CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_at TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    mode TEXT NOT NULL DEFAULT 'Online' CHECK (mode IN ('Online','Onsite','Phone')),
    location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);

-- Recruiter <-> candidate conversation, scoped to one application
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    read_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_application ON messages(application_id);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    read_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);

-- Verification queue view, extended with the skill / certificate a request refers to.
DROP VIEW IF EXISTS pending_verifications;
CREATE VIEW pending_verifications AS
SELECT
    vr.id,
    vr.external_id,
    vr.student_id,
    u.external_id AS student_external_id,
    u.name AS student_name,
    u.avatar_url AS student_avatar,
    u.department AS student_department,
    vr.project_id,
    vr.skill_id,
    s.name AS skill_name,
    vr.certificate_id,
    c.title AS certificate_title,
    c.certificate_url,
    vr.title,
    vr.verification_type,
    vr.submitted_at,
    vr.status,
    vr.notes,
    vr.reviewed_at,
    r.name AS reviewer_name,
    ve.github_repo_url,
    ve.project_report_url,
    ve.demo_url,
    ve.certificate_issuer,
    ve.assessment_score
FROM verification_requests vr
JOIN users u ON u.id = vr.student_id
LEFT JOIN users r ON r.id = vr.reviewed_by
LEFT JOIN skills s ON s.id = vr.skill_id
LEFT JOIN certificates c ON c.id = vr.certificate_id
LEFT JOIN verification_evidence ve ON ve.request_id = vr.id;
