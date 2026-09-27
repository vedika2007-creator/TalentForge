import json
import os
import sqlite3
from contextlib import asynccontextmanager
from typing import Literal, Optional

import bcrypt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

from core import (db, get_current_user, get_optional_user, issue_token, many,
                  now_iso, one, public_user, require_roles, resolve_user)
from database import DATABASE_PATH, hash_password, init_db
from workflow import apply_verification_effects, notify, notify_teachers, router as workflow_router
from serializers import (JOB_SELECT, PROJECT_SELECT, get_or_create_skill,
                         serialize_job, serialize_project, serialize_student, serialize_verification)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="TalentForge API",
    version="2.0.0",
    description="Backend for the TalentForge React frontend, backed by SQLite",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

Role = Literal["student", "teacher", "admin", "recruiter"]


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
    role: Optional[Role] = None


class RegisterIn(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["student", "recruiter", "teacher"] = "student"
    college: Optional[str] = None
    department: Optional[str] = None
    batch_year: Optional[int] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    batch_year: Optional[int] = None
    location: Optional[str] = None
    github_username: Optional[str] = None
    target_role: Optional[str] = None
    available_for_hire: Optional[bool] = None
    avatar_url: Optional[str] = None


class ProjectIn(BaseModel):
    title: str = Field(min_length=1)
    tagline: Optional[str] = None
    description: Optional[str] = None
    domain: Literal["Web Development", "AI & Machine Learning", "Cloud & Systems", "Mobile", "Cybersecurity"] = "Web Development"
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    role: Optional[str] = "Lead Developer"
    technologies: list[str] = []
    highlights: list[str] = []


class CollaborationIn(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = None
    domain: Optional[str] = None
    max_members: int = Field(default=2, gt=0)
    looking_for: list[str] = []
    tags: list[str] = []


class ShortlistIn(BaseModel):
    student_id: str
    job_id: Optional[str] = None


class VerificationUpdate(BaseModel):
    status: Literal["approved", "changes_requested", "rejected"]
    notes: Optional[str] = None


class JobIn(BaseModel):
    title: str = Field(min_length=1)
    company: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    min_confidence: float = 0
    preferred_projects: int = 0
    require_faculty_verification: bool = False
    location_type: Literal["Remote", "Hybrid", "Onsite"] = "Remote"
    required_skills: list[str] = []


class UserStatusIn(BaseModel):
    is_active: bool


# ---------------------------------------------------------------------------
# Routes: health & auth
# ---------------------------------------------------------------------------

@app.get("/api/v1/health")
def health(conn=Depends(db)):
    users = one(conn, "SELECT COUNT(*) n FROM users")["n"]
    return {"status": "ok", "database": "sqlite", "path": str(DATABASE_PATH.name), "users": users, "service": "TalentForge API"}


@app.post("/api/v1/auth/login")
def login(data: LoginIn, conn=Depends(db)):
    user = one(conn, "SELECT * FROM users WHERE email=?", (data.email,))
    if not user or not user["password_hash"] or not bcrypt.checkpw(data.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Invalid email or password")
    if not user["is_active"]:
        if user["role"] == "teacher" and not one(conn, "SELECT 1 FROM verification_requests WHERE reviewed_by=?", (user["id"],)):
            raise HTTPException(403, "Your faculty account is awaiting administrator approval")
        raise HTTPException(403, "This account has been suspended. Contact the platform administrator.")
    return issue_token(user)


@app.post("/api/v1/auth/register")
def register(data: RegisterIn, conn=Depends(db)):
    if one(conn, "SELECT id FROM users WHERE email=?", (data.email,)):
        raise HTTPException(409, "Email already registered")
    needs_approval = data.role == "teacher"
    user = one(conn, """INSERT INTO users(name,email,password_hash,role,college,department,batch_year,available_for_hire,is_active)
        VALUES (?,?,?,?,?,?,?,?,?) RETURNING *""",
        (data.name, data.email, hash_password(data.password), data.role, data.college, data.department,
         data.batch_year, 1 if data.role == "student" else 0, 0 if needs_approval else 1))
    if needs_approval:
        for admin in many(conn, "SELECT id FROM users WHERE role='admin' AND is_active=1"):
            notify(conn, admin["id"], "account", f"Faculty account awaiting approval: {data.name}",
                   f"{data.email}" + (f" — {data.college}" if data.college else ""), "/admin/users")
        conn.commit()
        return {"pending_approval": True,
                "message": "Faculty account created. An administrator must approve it before you can sign in."}
    notify(conn, user["id"], "account", "Welcome to TalentForge!",
           "Complete your profile to get discovered." if data.role == "student" else "Post your first job to start hiring.",
           "/student/profile" if data.role == "student" else "/recruiter/jobs")
    conn.commit()
    return issue_token(user)


@app.get("/api/v1/auth/me")
def me(user=Depends(get_current_user)):
    return public_user(user)


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

@app.get("/api/v1/analytics")
def analytics(conn=Depends(db)):
    snap = one(conn, "SELECT * FROM analytics_snapshots ORDER BY captured_at DESC LIMIT 1") or {}
    live = one(conn, """SELECT
        (SELECT COUNT(*) FROM users WHERE role='student') students,
        (SELECT COUNT(*) FROM users WHERE role='teacher') teachers,
        (SELECT COUNT(*) FROM users WHERE role='recruiter') recruiters,
        (SELECT COUNT(*) FROM projects) projects,
        (SELECT COUNT(*) FROM projects WHERE is_faculty_verified=1) verified_projects,
        (SELECT COUNT(*) FROM verification_requests WHERE status='pending') pending_verifications,
        (SELECT COUNT(*) FROM student_skills WHERE status='verified') verified_skills,
        (SELECT COUNT(*) FROM jobs WHERE is_active=1) open_jobs,
        (SELECT COUNT(*) FROM collaboration_posts WHERE is_active=1) collaborations""")
    return {
        "totalStudents": snap.get("total_students", 0),
        "verifiedProjects": snap.get("verified_projects", 0),
        "hiringCompanies": snap.get("hiring_companies", 0),
        "matchAccuracy": snap.get("match_accuracy", 0),
        "pendingVerifications": snap.get("pending_verifications", 0),
        "activeTeachers": snap.get("active_teachers", 0),
        "totalSkillsVerified": snap.get("total_skills_verified", 0),
        "weeklyGrowthRate": snap.get("weekly_growth_rate", 0),
        "live": {
            "students": live["students"],
            "teachers": live["teachers"],
            "recruiters": live["recruiters"],
            "projects": live["projects"],
            "verifiedProjects": live["verified_projects"],
            "pendingVerifications": live["pending_verifications"],
            "verifiedSkills": live["verified_skills"],
            "openJobs": live["open_jobs"],
            "collaborations": live["collaborations"],
        },
    }


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------

@app.get("/api/v1/students")
def students(skill: Optional[str] = None, minScore: Optional[float] = None, role: Optional[str] = None,
             user=Depends(require_roles("recruiter", "teacher", "admin")), conn=Depends(db)):
    rows = many(conn, """SELECT id FROM student_profiles sp
        WHERE is_active=1
        AND (? IS NULL OR EXISTS (SELECT 1 FROM student_skills ss JOIN skills s ON s.id=ss.skill_id
             WHERE ss.student_id=sp.id AND LOWER(s.name) LIKE '%'||LOWER(?)||'%'))
        AND (? IS NULL OR overall_score >= ?)
        AND (? IS NULL OR LOWER(target_role) LIKE '%'||LOWER(?)||'%')
        ORDER BY overall_score DESC, name""", (skill, skill, minScore, minScore, role, role))
    return [serialize_student(conn, r["id"]) for r in rows]


@app.get("/api/v1/students/me")
def get_me_student(user=Depends(require_roles("student")), conn=Depends(db)):
    return serialize_student(conn, user["id"])


@app.patch("/api/v1/students/me")
def update_me(data: ProfileUpdate, user=Depends(require_roles("student")), conn=Depends(db)):
    fields = data.model_dump(exclude_none=True)
    if fields:
        sets = ", ".join(f"{k}=?" for k in fields)
        conn.execute(f"UPDATE users SET {sets} WHERE id=?", [*fields.values(), user["id"]])
        conn.commit()
    return serialize_student(conn, user["id"])


@app.get("/api/v1/students/{student_id}")
def get_student(student_id: str, user=Depends(get_current_user), conn=Depends(db)):
    u = resolve_user(conn, student_id)
    if user["role"] == "student" and (not u or u["id"] != user["id"]):
        raise HTTPException(403, "Students can only view their own profile")
    if not u or u["role"] != "student":
        raise HTTPException(404, "Student not found")
    return serialize_student(conn, u["id"])


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

@app.get("/api/v1/projects")
def projects(domain: Optional[str] = None, verifiedOnly: bool = False, search: Optional[str] = None,
             authorId: Optional[str] = None, conn=Depends(db)):
    where, params = ["1=1"], []
    if domain and domain != "All":
        where.append("p.domain=?"); params.append(domain)
    if verifiedOnly:
        where.append("p.is_faculty_verified=1")
    if authorId:
        where.append("EXISTS (SELECT 1 FROM project_members m WHERE m.project_id=p.id AND m.student_id=?)")
        params.append(authorId)
    if search:
        where.append("""(LOWER(p.title) LIKE '%'||LOWER(?)||'%' OR LOWER(COALESCE(p.tagline,'')) LIKE '%'||LOWER(?)||'%'
            OR EXISTS (SELECT 1 FROM project_technologies pt JOIN skills s ON s.id=pt.skill_id
                WHERE pt.project_id=p.id AND LOWER(s.name) LIKE '%'||LOWER(?)||'%')
            OR EXISTS (SELECT 1 FROM project_members m JOIN users mu ON mu.id=m.student_id
                WHERE m.project_id=p.id AND LOWER(mu.name) LIKE '%'||LOWER(?)||'%'))""")
        params += [search] * 4
    rows = many(conn, PROJECT_SELECT + f" WHERE {' AND '.join(where)} ORDER BY p.created_at DESC", params)
    return [serialize_project(r) for r in rows]


@app.post("/api/v1/projects", status_code=201)
def create_project(data: ProjectIn, user=Depends(require_roles("student")), conn=Depends(db)):
    """A student submits a project; it is stored unverified and queued for faculty review."""
    p = one(conn, """INSERT INTO projects(title,tagline,description,domain,github_url,demo_url,commits,contributors)
        VALUES (?,?,?,?,?,?,0,1) RETURNING *""",
        (data.title, data.tagline or "Submitted for faculty verification", data.description,
         data.domain, data.github_url, data.demo_url))
    conn.execute("INSERT INTO project_members(project_id,student_id,role,is_featured) VALUES (?,?,?,1)",
                 (p["id"], user["id"], data.role))
    for tech in data.technologies:
        skill_id = get_or_create_skill(conn, tech)
        if skill_id:
            conn.execute("INSERT OR IGNORE INTO project_technologies(project_id,skill_id) VALUES (?,?)", (p["id"], skill_id))
    for i, h in enumerate(data.highlights):
        conn.execute("INSERT INTO project_highlights(project_id,highlight,display_order) VALUES (?,?,?)", (p["id"], h, i))
    req = one(conn, """INSERT INTO verification_requests(student_id,project_id,title,verification_type,notes)
        VALUES (?,?,?,'project',?) RETURNING id""", (user["id"], p["id"], data.title, data.description))
    conn.execute("INSERT INTO verification_evidence(request_id,github_repo_url,demo_url) VALUES (?,?,?)",
                 (req["id"], data.github_url, data.demo_url))
    notify_teachers(conn, user, "New project to review", f"{user['name']} submitted {data.title}.")
    conn.commit()
    return serialize_project(one(conn, PROJECT_SELECT + " WHERE p.id=?", (p["id"],)))


# ---------------------------------------------------------------------------
# Teacher verification
# ---------------------------------------------------------------------------

@app.get("/api/v1/verifications")
def verifications(status: Optional[str] = None, studentId: Optional[str] = None, type: Optional[str] = None,
                  user=Depends(require_roles("student", "teacher", "admin")), conn=Depends(db)):
    if user["role"] == "student":
        studentId = user["id"]
    where, params = ["1=1"], []
    if type:
        where.append("verification_type=?"); params.append(type)
    if status:
        where.append("status=?"); params.append(status)
    if studentId:
        where.append("student_id=?"); params.append(studentId)
    rows = many(conn, f"SELECT * FROM pending_verifications WHERE {' AND '.join(where)} ORDER BY submitted_at DESC", params)
    return [serialize_verification(r) for r in rows]


@app.patch("/api/v1/verifications/{request_id}")
def update_verification(request_id: str, data: VerificationUpdate, user=Depends(require_roles("teacher", "admin")), conn=Depends(db)):
    req = one(conn, "SELECT * FROM verification_requests WHERE id=? OR external_id=?", (request_id, request_id))
    if not req:
        raise HTTPException(404, "Verification request not found")
    if data.status == "rejected" and not (data.notes or "").strip():
        raise HTTPException(400, "A reason is required to decline a submission")
    note = data.notes or ("Faculty verification confirmed. Evidence verified against university rubrics."
                          if data.status == "approved" else "Changes requested by faculty mentor.")
    conn.execute("UPDATE verification_requests SET status=?, notes=?, reviewed_by=?, reviewed_at=? WHERE id=?",
                 (data.status, note, user["id"], now_iso(), req["id"]))
    apply_verification_effects(conn, {**req, "notes": note}, data.status, user)
    conn.commit()
    return serialize_verification(one(conn, "SELECT * FROM pending_verifications WHERE id=?", (req["id"],)))


# ---------------------------------------------------------------------------
# Collaboration
# ---------------------------------------------------------------------------

def serialize_collab(r: dict, user_id: Optional[str]):
    member_ids = json.loads(r["member_ids"] or "[]")
    return {
        "id": r["id"],
        "title": r["title"],
        "description": r["description"] or "",
        "domain": r["domain"] or "",
        "creatorId": r["creator_id"],
        "creatorName": r["creator_name"],
        "creatorAvatar": r["creator_avatar"] or "",
        "creatorRole": r["creator_headline"] or r["creator_role"].capitalize(),
        "creatorCollege": r["creator_college"],
        "lookingFor": json.loads(r["looking_for"] or "[]"),
        "currentMembers": len(member_ids),
        "maxMembers": r["max_members"],
        "postedDate": r["posted_at"],
        "tags": json.loads(r["tags"] or "[]"),
        "isMember": bool(user_id and user_id in member_ids),
    }


COLLAB_SELECT = """
    SELECT cp.*, u.name creator_name, u.avatar_url creator_avatar, u.role creator_role,
        u.headline creator_headline, u.college creator_college,
        (SELECT json_group_array(user_id) FROM collaboration_members cm WHERE cm.post_id=cp.id) member_ids,
        (SELECT json_group_array(role_name) FROM collaboration_roles cr WHERE cr.post_id=cp.id) looking_for,
        (SELECT json_group_array(tag) FROM collaboration_tags ct WHERE ct.post_id=cp.id) tags
    FROM collaboration_posts cp JOIN users u ON u.id=cp.creator_id
"""


@app.get("/api/v1/collaborations")
def collaborations(user=Depends(get_optional_user), conn=Depends(db)):
    rows = many(conn, COLLAB_SELECT + " WHERE cp.is_active=1 ORDER BY cp.posted_at DESC")
    return [serialize_collab(r, user and user["id"]) for r in rows]


@app.post("/api/v1/collaborations", status_code=201)
def create_collaboration(data: CollaborationIn, user=Depends(require_roles("student", "teacher")), conn=Depends(db)):
    p = one(conn, "INSERT INTO collaboration_posts(creator_id,title,description,domain,max_members) VALUES (?,?,?,?,?) RETURNING id",
            (user["id"], data.title, data.description, data.domain, data.max_members))
    conn.execute("INSERT INTO collaboration_members(post_id,user_id) VALUES (?,?)", (p["id"], user["id"]))
    for role in data.looking_for:
        if role.strip():
            conn.execute("INSERT INTO collaboration_roles(post_id,role_name) VALUES (?,?)", (p["id"], role.strip()))
    for tag in {t.strip() for t in data.tags if t.strip()}:
        conn.execute("INSERT INTO collaboration_tags(post_id,tag) VALUES (?,?)", (p["id"], tag))
    conn.commit()
    return serialize_collab(one(conn, COLLAB_SELECT + " WHERE cp.id=?", (p["id"],)), user["id"])


@app.post("/api/v1/collaborations/{post_id}/join")
def join_collaboration(post_id: str, user=Depends(get_current_user), conn=Depends(db)):
    p = one(conn, "SELECT * FROM collaboration_posts WHERE id=? OR external_id=?", (post_id, post_id))
    if not p:
        raise HTTPException(404, "Post not found")
    count = one(conn, "SELECT COUNT(*) n FROM collaboration_members WHERE post_id=?", (p["id"],))["n"]
    if count >= p["max_members"]:
        raise HTTPException(409, "This team is already full")
    try:
        conn.execute("INSERT INTO collaboration_members(post_id,user_id) VALUES (?,?)", (p["id"], user["id"]))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(409, "You have already joined this team")
    return serialize_collab(one(conn, COLLAB_SELECT + " WHERE cp.id=?", (p["id"],)), user["id"])


# ---------------------------------------------------------------------------
# Recruiters: shortlist, jobs, matching
# ---------------------------------------------------------------------------

@app.get("/api/v1/shortlist")
def shortlist(user=Depends(require_roles("recruiter")), conn=Depends(db)):
    rows = many(conn, "SELECT DISTINCT student_id FROM recruiter_shortlists WHERE recruiter_id=?", (user["id"],))
    return [r["student_id"] for r in rows]


@app.post("/api/v1/shortlist/toggle")
def toggle_shortlist(data: ShortlistIn, user=Depends(require_roles("recruiter")), conn=Depends(db)):
    student = resolve_user(conn, data.student_id)
    if not student or student["role"] != "student":
        raise HTTPException(404, "Student not found")
    job_id = None
    if data.job_id:
        job = one(conn, "SELECT id FROM jobs WHERE id=?", (data.job_id,))
        job_id = job["id"] if job else None
    params = (user["id"], student["id"], job_id)
    if one(conn, "SELECT 1 FROM recruiter_shortlists WHERE recruiter_id=? AND student_id=? AND job_id IS ?", params):
        conn.execute("DELETE FROM recruiter_shortlists WHERE recruiter_id=? AND student_id=? AND job_id IS ?", params)
    else:
        conn.execute("INSERT INTO recruiter_shortlists(recruiter_id,student_id,job_id) VALUES (?,?,?)", params)
        company = user["college"] or "a company"
        notify(conn, student["id"], "shortlist", f"A recruiter from {company} shortlisted your profile",
               f"{user['name']} added you to their talent pool.", "/student/opportunities")
    conn.commit()
    return shortlist(user, conn)


@app.get("/api/v1/jobs")
def jobs(mine: bool = False, user=Depends(get_current_user), conn=Depends(db)):
    where, params = "j.is_active=1", []
    if mine:
        where += " AND j.recruiter_id=?"; params.append(user["id"])
    return [serialize_job(r) for r in many(conn, JOB_SELECT + f" WHERE {where} ORDER BY j.created_at DESC", params)]


@app.post("/api/v1/jobs", status_code=201)
def create_job(data: JobIn, user=Depends(require_roles("recruiter")), conn=Depends(db)):
    job = one(conn, """INSERT INTO jobs(recruiter_id,company,title,department,location,description,min_confidence,
        preferred_projects,require_faculty_verification,location_type) VALUES (?,?,?,?,?,?,?,?,?,?) RETURNING id""",
        (user["id"], data.company or user["college"], data.title, data.department, data.location, data.description,
         data.min_confidence, data.preferred_projects, int(data.require_faculty_verification), data.location_type))
    for name in data.required_skills:
        skill_id = get_or_create_skill(conn, name)
        if skill_id:
            conn.execute("INSERT OR IGNORE INTO job_required_skills(job_id,skill_id) VALUES (?,?)", (job["id"], skill_id))
    conn.commit()
    return serialize_job(one(conn, JOB_SELECT + " WHERE j.id=?", (job["id"],)))


@app.get("/api/v1/matches")
def matches(skill: Optional[str] = None, min_confidence: float = 0, require_verified: bool = False,
            user=Depends(require_roles("recruiter", "admin")), conn=Depends(db)):
    rows = many(conn, """SELECT u.id, u.name, u.target_role, u.overall_score, ss.confidence_score, s.name skill_name,
            ss.faculty_verified
        FROM users u JOIN student_skills ss ON ss.student_id=u.id JOIN skills s ON s.id=ss.skill_id
        WHERE u.role='student' AND u.is_active=1 AND u.available_for_hire=1 AND ss.confidence_score >= ?
        AND (? IS NULL OR LOWER(s.name) LIKE '%'||LOWER(?)||'%')
        AND (?=0 OR ss.faculty_verified=1)
        ORDER BY ss.confidence_score DESC, u.overall_score DESC""",
        (min_confidence, skill, skill, int(require_verified)))
    return [{"studentId": r["id"], "name": r["name"], "targetRole": r["target_role"], "overallScore": r["overall_score"],
             "skillName": r["skill_name"], "confidenceScore": r["confidence_score"],
             "facultyVerified": bool(r["faculty_verified"])} for r in rows]


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------

@app.get("/api/v1/admin/users")
def admin_users(user=Depends(require_roles("admin")), conn=Depends(db)):
    rows = many(conn, "SELECT * FROM users ORDER BY CASE role WHEN 'admin' THEN 3 ELSE 0 END, created_at DESC")
    return [public_user(r) for r in rows]


@app.patch("/api/v1/admin/users/{user_id}/status")
def admin_set_status(user_id: str, data: UserStatusIn, user=Depends(require_roles("admin")), conn=Depends(db)):
    target = resolve_user(conn, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    if target["id"] == user["id"]:
        raise HTTPException(400, "You cannot suspend your own account")
    conn.execute("UPDATE users SET is_active=? WHERE id=?", (int(data.is_active), target["id"]))
    conn.commit()
    return public_user(one(conn, "SELECT * FROM users WHERE id=?", (target["id"],)))


app.include_router(workflow_router)
