"""TalentForge platform workflow:

Student profile -> skills / projects / certificates -> evidence -> faculty verification ->
verified profile -> job matching -> application -> shortlist -> interview -> selection -> notification.

Every route here enforces role-based authorization on the server.
"""
import json
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core import db, get_current_user, many, now_iso, one, require_roles
from serializers import JOB_SELECT, PROJECT_SELECT, get_or_create_skill, serialize_job, serialize_project, serialize_student

router = APIRouter(prefix="/api/v1")

# Applications in these states have an open recruiter <-> student conversation.
MESSAGING_STATUSES = ("shortlisted", "interview", "selected")
NEW_SKILL_CONFIDENCE = 40


# ---------------------------------------------------------------------------
# Notifications & scoring helpers
# ---------------------------------------------------------------------------

def notify(conn, user_id: str, type_: str, title: str, body: Optional[str] = None, link: Optional[str] = None):
    conn.execute("INSERT INTO notifications(user_id,type,title,body,link) VALUES (?,?,?,?,?)",
                 (user_id, type_, title, body, link))


def notify_teachers(conn, student: dict, title: str, body: str):
    """Tell faculty that new evidence is waiting — same-college faculty first, otherwise all faculty."""
    teachers = many(conn, "SELECT id FROM users WHERE role='teacher' AND is_active=1 AND college=?", (student["college"],))
    if not teachers:
        teachers = many(conn, "SELECT id FROM users WHERE role='teacher' AND is_active=1")
    for t in teachers:
        notify(conn, t["id"], "verification", title, body, "/teacher")


def student_skill_map(conn, student_id: str):
    rows = many(conn, """SELECT s.name, ss.confidence_score, ss.status FROM student_skills ss
        JOIN skills s ON s.id=ss.skill_id WHERE ss.student_id=?""", (student_id,))
    return {r["name"].lower(): r for r in rows}


def match_job(skills: dict, required: list[str]):
    """Job match 0-100: average over required skills of the student's confidence,
    counting faculty-verified skills fully and unverified ones at 60%."""
    if not required:
        return 0, [], []
    total, matched, missing = 0.0, [], []
    for name in required:
        s = skills.get(name.lower())
        if s:
            matched.append(name)
            total += (s["confidence_score"] or 0) * (1.0 if s["status"] == "verified" else 0.6)
        else:
            missing.append(name)
    return round(total / len(required)), matched, missing


def recompute_overall(conn, student_id: str):
    rows = many(conn, "SELECT confidence_score c, status FROM student_skills WHERE student_id=?", (student_id,))
    verified = [r["c"] for r in rows if r["status"] == "verified"]
    if verified:
        score = sum(verified) / len(verified)
    elif rows:
        score = 0.6 * sum(r["c"] for r in rows) / len(rows)
    else:
        score = 0
    conn.execute("UPDATE users SET overall_score=? WHERE id=?", (round(score), student_id))


def ensure_student_skill(conn, student_id: str, skill_id: str, confidence: float = NEW_SKILL_CONFIDENCE):
    row = one(conn, "SELECT * FROM student_skills WHERE student_id=? AND skill_id=?", (student_id, skill_id))
    if row:
        return row
    return one(conn, """INSERT INTO student_skills(student_id,skill_id,confidence_score,status) VALUES (?,?,?,'pending')
        RETURNING *""", (student_id, skill_id, confidence))


def apply_verification_effects(conn, req: dict, status: str, reviewer: dict):
    """Propagate a faculty decision to the underlying project / certificate / skill and notify the student."""
    student_id = req["student_id"]
    approved = status == "approved"
    label = {"approved": "verified", "rejected": "declined", "changes_requested": "needs changes"}[status]

    if req["project_id"]:
        if approved:
            conn.execute("UPDATE projects SET is_faculty_verified=1, verified_by=?, verification_date=date('now') WHERE id=?",
                         (reviewer["id"], req["project_id"]))
            # A verified project becomes evidence for every technology it uses.
            for t in many(conn, "SELECT skill_id FROM project_technologies WHERE project_id=?", (req["project_id"],)):
                ss = ensure_student_skill(conn, student_id, t["skill_id"], 45)
                conn.execute("""UPDATE student_skills SET projects_count=projects_count+1,
                    confidence_score=MIN(100, confidence_score+5) WHERE id=?""", (ss["id"],))
        else:
            conn.execute("UPDATE projects SET is_faculty_verified=0, verified_by=NULL, verification_date=NULL WHERE id=?",
                         (req["project_id"],))
        link = "/student/projects"
    elif req.get("certificate_id"):
        conn.execute("UPDATE certificates SET verification_status=? WHERE id=?",
                     ("verified" if approved else "needs_revision", req["certificate_id"]))
        cert = one(conn, "SELECT skill_id FROM certificates WHERE id=?", (req["certificate_id"],))
        if approved and cert and cert["skill_id"]:
            ss = ensure_student_skill(conn, student_id, cert["skill_id"])
            conn.execute("""UPDATE student_skills SET certificates_count=certificates_count+1,
                confidence_score=MIN(100, confidence_score+8) WHERE id=?""", (ss["id"],))
        link = "/student/certificates"
    elif req.get("skill_id"):
        ss = ensure_student_skill(conn, student_id, req["skill_id"])
        if approved:
            conn.execute("""UPDATE student_skills SET status='verified', faculty_verified=1, verifier_id=?,
                verified_at=date('now'), assessments_completed=assessments_completed+1,
                confidence_score=MIN(100, confidence_score + COALESCE(faculty_weight, 20)) WHERE id=?""",
                         (reviewer["id"], ss["id"]))
        else:
            conn.execute("UPDATE student_skills SET status='needs_revision', faculty_verified=0 WHERE id=?", (ss["id"],))
        link = "/student/skills"
    else:
        link = "/student"

    recompute_overall(conn, student_id)
    notify(conn, student_id, "verification", f"{req['title']} — {label}",
           f"Reviewed by {reviewer['name']}" + (f": {req['notes']}" if req.get("notes") and not approved else "."), link)


# ---------------------------------------------------------------------------
# Student profile (LinkedIn-style)
# ---------------------------------------------------------------------------

def serialize_profile(conn, student_id: str, viewer: dict):
    base = serialize_student(conn, student_id)
    if not base:
        raise HTTPException(404, "Student not found")
    user = one(conn, "SELECT email, created_at FROM users WHERE id=?", (student_id,))
    projects = many(conn, PROJECT_SELECT + """ WHERE EXISTS (SELECT 1 FROM project_members m
        WHERE m.project_id=p.id AND m.student_id=?) ORDER BY p.created_at DESC""", (student_id,))
    certificates = many(conn, """SELECT c.*, s.name skill_name FROM certificates c LEFT JOIN skills s ON s.id=c.skill_id
        WHERE c.student_id=? ORDER BY c.issued_date DESC""", (student_id,))
    profile = {
        **base,
        "email": user["email"],
        "joinedAt": user["created_at"],
        "education": [{
            "id": e["id"], "institution": e["institution"], "degree": e["degree"] or "",
            "fieldOfStudy": e["field_of_study"] or "", "startYear": e["start_year"], "endYear": e["end_year"],
            "grade": e["grade"] or "",
        } for e in many(conn, "SELECT * FROM student_education WHERE student_id=? ORDER BY COALESCE(end_year,9999) DESC",
                        (student_id,))],
        "achievements": [{
            "id": a["id"], "title": a["title"], "description": a["description"] or "", "achievedOn": a["achieved_on"],
        } for a in many(conn, "SELECT * FROM student_achievements WHERE student_id=? ORDER BY achieved_on DESC",
                        (student_id,))],
        "certificates": [{
            "id": c["id"], "title": c["title"], "issuer": c["issuer"] or "", "url": c["certificate_url"],
            "issuedDate": c["issued_date"], "status": c["verification_status"], "skillName": c["skill_name"],
        } for c in certificates],
        "projects": [serialize_project(p) for p in projects],
    }
    if viewer["role"] == "recruiter":
        profile["shortlisted"] = bool(one(conn, "SELECT 1 FROM recruiter_shortlists WHERE recruiter_id=? AND student_id=?",
                                          (viewer["id"], student_id)))
        profile["applications"] = [{"id": a["id"], "jobTitle": a["title"], "status": a["status"]} for a in many(conn, """
            SELECT a.id, a.status, j.title FROM applications a JOIN jobs j ON j.id=a.job_id
            WHERE a.student_id=? AND j.recruiter_id=?""", (student_id, viewer["id"]))]
    return profile


@router.get("/profiles/{student_id}")
def get_profile(student_id: str, user=Depends(get_current_user), conn=Depends(db)):
    if user["role"] == "student" and user["id"] != student_id:
        raise HTTPException(403, "Students can only view their own full profile")
    target = one(conn, "SELECT id, role FROM users WHERE id=? OR external_id=?", (student_id, student_id))
    if not target or target["role"] != "student":
        raise HTTPException(404, "Student not found")
    return serialize_profile(conn, target["id"], user)


@router.get("/students/me/profile")
def my_profile(user=Depends(require_roles("student")), conn=Depends(db)):
    return serialize_profile(conn, user["id"], user)


class EducationIn(BaseModel):
    institution: str = Field(min_length=1)
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    grade: Optional[str] = None


class AchievementIn(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = None
    achieved_on: Optional[str] = None


class SkillIn(BaseModel):
    name: str = Field(min_length=1)


class EvidenceIn(BaseModel):
    description: str = Field(min_length=1)
    evidence_url: Optional[str] = None


class CertificateIn(BaseModel):
    title: str = Field(min_length=1)
    issuer: Optional[str] = None
    certificate_url: Optional[str] = None
    issued_date: Optional[str] = None
    skill: Optional[str] = None


@router.post("/students/me/education", status_code=201)
def add_education(data: EducationIn, user=Depends(require_roles("student")), conn=Depends(db)):
    conn.execute("""INSERT INTO student_education(student_id,institution,degree,field_of_study,start_year,end_year,grade)
        VALUES (?,?,?,?,?,?,?)""", (user["id"], data.institution, data.degree, data.field_of_study,
                                     data.start_year, data.end_year, data.grade))
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.delete("/students/me/education/{item_id}")
def delete_education(item_id: str, user=Depends(require_roles("student")), conn=Depends(db)):
    conn.execute("DELETE FROM student_education WHERE id=? AND student_id=?", (item_id, user["id"]))
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.post("/students/me/achievements", status_code=201)
def add_achievement(data: AchievementIn, user=Depends(require_roles("student")), conn=Depends(db)):
    conn.execute("INSERT INTO student_achievements(student_id,title,description,achieved_on) VALUES (?,?,?,?)",
                 (user["id"], data.title, data.description, data.achieved_on))
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.delete("/students/me/achievements/{item_id}")
def delete_achievement(item_id: str, user=Depends(require_roles("student")), conn=Depends(db)):
    conn.execute("DELETE FROM student_achievements WHERE id=? AND student_id=?", (item_id, user["id"]))
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.post("/students/me/skills", status_code=201)
def add_skill(data: SkillIn, user=Depends(require_roles("student")), conn=Depends(db)):
    skill_id = get_or_create_skill(conn, data.name)
    if one(conn, "SELECT 1 FROM student_skills WHERE student_id=? AND skill_id=?", (user["id"], skill_id)):
        raise HTTPException(409, "This skill is already on your profile")
    ensure_student_skill(conn, user["id"], skill_id)
    recompute_overall(conn, user["id"])
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.delete("/students/me/skills/{student_skill_id}")
def delete_skill(student_skill_id: str, user=Depends(require_roles("student")), conn=Depends(db)):
    conn.execute("DELETE FROM student_skills WHERE id=? AND student_id=?", (student_skill_id, user["id"]))
    recompute_overall(conn, user["id"])
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.post("/students/me/skills/{student_skill_id}/evidence", status_code=201)
def submit_skill_evidence(student_skill_id: str, data: EvidenceIn, user=Depends(require_roles("student")), conn=Depends(db)):
    ss = one(conn, """SELECT ss.*, s.name FROM student_skills ss JOIN skills s ON s.id=ss.skill_id
        WHERE ss.id=? AND ss.student_id=?""", (student_skill_id, user["id"]))
    if not ss:
        raise HTTPException(404, "Skill not found on your profile")
    if one(conn, "SELECT 1 FROM verification_requests WHERE skill_id=? AND student_id=? AND status='pending'",
           (ss["skill_id"], user["id"])):
        raise HTTPException(409, "Evidence for this skill is already waiting for faculty review")
    req = one(conn, """INSERT INTO verification_requests(student_id,skill_id,title,verification_type,notes)
        VALUES (?,?,?,'skill_assessment',?) RETURNING id""", (user["id"], ss["skill_id"], f"Skill: {ss['name']}", data.description))
    conn.execute("INSERT INTO verification_evidence(request_id,github_repo_url) VALUES (?,?)", (req["id"], data.evidence_url))
    conn.execute("UPDATE student_skills SET status='pending' WHERE id=?", (ss["id"],))
    notify_teachers(conn, user, "New skill evidence to review", f"{user['name']} submitted evidence for {ss['name']}.")
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.post("/students/me/certificates", status_code=201)
def add_certificate(data: CertificateIn, user=Depends(require_roles("student")), conn=Depends(db)):
    skill_id = get_or_create_skill(conn, data.skill) if data.skill else None
    cert = one(conn, """INSERT INTO certificates(student_id,title,issuer,certificate_url,issued_date,skill_id)
        VALUES (?,?,?,?,?,?) RETURNING id""", (user["id"], data.title, data.issuer, data.certificate_url, data.issued_date, skill_id))
    title = f"Certificate: {data.title}" + (f" ({data.issuer})" if data.issuer else "")
    req = one(conn, """INSERT INTO verification_requests(student_id,certificate_id,skill_id,title,verification_type)
        VALUES (?,?,?,?,'certificate') RETURNING id""", (user["id"], cert["id"], None, title))
    conn.execute("INSERT INTO verification_evidence(request_id,certificate_issuer,demo_url) VALUES (?,?,?)",
                 (req["id"], data.issuer, data.certificate_url))
    notify_teachers(conn, user, "New certificate to review", f"{user['name']} submitted {data.title}.")
    conn.commit()
    return serialize_profile(conn, user["id"], user)


@router.delete("/students/me/certificates/{cert_id}")
def delete_certificate(cert_id: str, user=Depends(require_roles("student")), conn=Depends(db)):
    conn.execute("DELETE FROM verification_requests WHERE certificate_id=? AND student_id=? AND status='pending'",
                 (cert_id, user["id"]))
    conn.execute("DELETE FROM certificates WHERE id=? AND student_id=?", (cert_id, user["id"]))
    conn.commit()
    return serialize_profile(conn, user["id"], user)


# ---------------------------------------------------------------------------
# Opportunities & applications (student side)
# ---------------------------------------------------------------------------

def load_job(conn, job_id: str):
    job = one(conn, JOB_SELECT + " WHERE j.id=?", (job_id,))
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@router.get("/opportunities")
def opportunities(user=Depends(require_roles("student")), conn=Depends(db)):
    skills = student_skill_map(conn, user["id"])
    mine = {a["job_id"]: a for a in many(conn, "SELECT id, job_id, status FROM applications WHERE student_id=?", (user["id"],))}
    out = []
    for row in many(conn, JOB_SELECT + " WHERE j.is_active=1 ORDER BY j.created_at DESC"):
        job = serialize_job(row)
        score, matched, missing = match_job(skills, job["requiredSkills"])
        app = mine.get(job["id"])
        out.append({**job, "match": score, "matchedSkills": matched, "missingSkills": missing,
                    "application": {"id": app["id"], "status": app["status"]} if app else None})
    out.sort(key=lambda j: j["match"], reverse=True)
    return out


class ApplyIn(BaseModel):
    cover_note: Optional[str] = None


@router.post("/jobs/{job_id}/apply", status_code=201)
def apply_to_job(job_id: str, data: ApplyIn, user=Depends(require_roles("student")), conn=Depends(db)):
    job = load_job(conn, job_id)
    if not job["is_active"]:
        raise HTTPException(409, "This job is no longer accepting applications")
    existing = one(conn, "SELECT * FROM applications WHERE job_id=? AND student_id=?", (job_id, user["id"]))
    if existing and existing["status"] != "withdrawn":
        raise HTTPException(409, "You have already applied to this job")
    if existing:
        conn.execute("UPDATE applications SET status='applied', cover_note=?, updated_at=? WHERE id=?",
                     (data.cover_note, now_iso(), existing["id"]))
    else:
        conn.execute("INSERT INTO applications(job_id,student_id,cover_note) VALUES (?,?,?)",
                     (job_id, user["id"], data.cover_note))
    notify(conn, job["recruiter_id"], "application", f"New application: {user['name']}",
           f"{job['title']}" + (f" at {job['company']}" if job["company"] else ""), "/recruiter/applications")
    conn.commit()
    return {"ok": True}


def application_rows(conn, where: str, params: tuple):
    return many(conn, f"""
        SELECT a.*, j.title job_title, j.company, j.location_type, j.location, j.recruiter_id,
            (SELECT json_group_array(s.name) FROM job_required_skills jrs JOIN skills s ON s.id=jrs.skill_id
                WHERE jrs.job_id=j.id) required_skills,
            u.name student_name, u.avatar_url student_avatar, u.college student_college, u.headline student_headline,
            u.overall_score student_score,
            (SELECT COUNT(*) FROM student_skills ss WHERE ss.student_id=u.id AND ss.status='verified') verified_count,
            r.name recruiter_name, r.avatar_url recruiter_avatar
        FROM applications a JOIN jobs j ON j.id=a.job_id JOIN users u ON u.id=a.student_id
        JOIN users r ON r.id=j.recruiter_id
        WHERE {where} ORDER BY a.updated_at DESC""", params)


def serialize_application(conn, r: dict, viewer: dict):
    interviews = many(conn, "SELECT * FROM interviews WHERE application_id=? ORDER BY scheduled_at", (r["id"],))
    unread = one(conn, "SELECT COUNT(*) n FROM messages WHERE application_id=? AND sender_id!=? AND read_at IS NULL",
                 (r["id"], viewer["id"]))["n"]
    required = json.loads(r["required_skills"] or "[]")
    score, matched, missing = match_job(student_skill_map(conn, r["student_id"]), required)
    out = {
        "id": r["id"],
        "status": r["status"],
        "coverNote": r["cover_note"] or "",
        "createdAt": r["created_at"],
        "updatedAt": r["updated_at"],
        "match": score,
        "matchedSkills": matched,
        "missingSkills": missing,
        "unreadMessages": unread,
        "canMessage": r["status"] in MESSAGING_STATUSES,
        "job": {"id": r["job_id"], "title": r["job_title"], "company": r["company"] or "",
                "locationType": r["location_type"], "location": r["location"] or "", "requiredSkills": required},
        "student": {"id": r["student_id"], "name": r["student_name"], "avatar": r["student_avatar"],
                    "college": r["student_college"] or "", "headline": r["student_headline"] or "",
                    "overallScore": round(r["student_score"] or 0), "verifiedCount": r["verified_count"]},
        "recruiter": {"id": r["recruiter_id"], "name": r["recruiter_name"], "avatar": r["recruiter_avatar"]},
        "interviews": [{
            "id": i["id"], "scheduledAt": i["scheduled_at"], "durationMinutes": i["duration_minutes"], "mode": i["mode"],
            "location": i["location"] or "", "notes": i["notes"] or "", "status": i["status"],
        } for i in interviews],
    }
    if viewer["role"] in ("recruiter", "admin"):
        out["recruiterNote"] = r["recruiter_note"] or ""
    return out


@router.get("/applications/mine")
def my_applications(user=Depends(require_roles("student")), conn=Depends(db)):
    return [serialize_application(conn, r, user) for r in application_rows(conn, "a.student_id=?", (user["id"],))]


def load_application(conn, app_id: str, user: dict):
    rows = application_rows(conn, "a.id=?", (app_id,))
    if not rows:
        raise HTTPException(404, "Application not found")
    app = rows[0]
    if user["role"] != "admin" and user["id"] not in (app["student_id"], app["recruiter_id"]):
        raise HTTPException(403, "You are not part of this application")
    return app


@router.post("/applications/{app_id}/withdraw")
def withdraw_application(app_id: str, user=Depends(require_roles("student")), conn=Depends(db)):
    app = load_application(conn, app_id, user)
    if app["status"] in ("selected", "rejected", "withdrawn"):
        raise HTTPException(409, f"An application that is {app['status']} cannot be withdrawn")
    conn.execute("UPDATE applications SET status='withdrawn', updated_at=? WHERE id=?", (now_iso(), app_id))
    notify(conn, app["recruiter_id"], "application", f"{user['name']} withdrew their application",
           app["job_title"], "/recruiter/applications")
    conn.commit()
    return serialize_application(conn, load_application(conn, app_id, user), user)


# ---------------------------------------------------------------------------
# Recruiter pipeline
# ---------------------------------------------------------------------------

@router.get("/recruiter/applications")
def recruiter_applications(job_id: Optional[str] = None, status: Optional[str] = None,
                           user=Depends(require_roles("recruiter", "admin")), conn=Depends(db)):
    where, params = ["a.status!='withdrawn'"], []
    if user["role"] == "recruiter":
        where.append("j.recruiter_id=?"); params.append(user["id"])
    if job_id:
        where.append("a.job_id=?"); params.append(job_id)
    if status:
        where.append("a.status=?"); params.append(status)
    rows = application_rows(conn, " AND ".join(where), tuple(params))
    return [serialize_application(conn, r, user) for r in rows]


STATUS_MESSAGES = {
    "shortlisted": ("You were shortlisted", "The recruiter would like to move forward. You can now message them."),
    "interview": ("Interview stage", "You have moved to the interview stage."),
    "selected": ("Congratulations — you were selected!", "The recruiter has selected you for this role."),
    "rejected": ("Application update", "The recruiter has decided not to move forward this time."),
    "applied": ("Application moved back to review", "Your application is under review again."),
}


class ApplicationStatusIn(BaseModel):
    status: Literal["applied", "shortlisted", "interview", "selected", "rejected"]
    note: Optional[str] = None


def require_job_owner(app: dict, user: dict):
    if user["role"] != "admin" and app["recruiter_id"] != user["id"]:
        raise HTTPException(403, "Only the recruiter who posted this job can manage its applications")


@router.patch("/applications/{app_id}")
def update_application(app_id: str, data: ApplicationStatusIn, user=Depends(require_roles("recruiter", "admin")),
                       conn=Depends(db)):
    app = load_application(conn, app_id, user)
    require_job_owner(app, user)
    if app["status"] == "withdrawn":
        raise HTTPException(409, "The candidate withdrew this application")
    conn.execute("UPDATE applications SET status=?, recruiter_note=COALESCE(?, recruiter_note), updated_at=? WHERE id=?",
                 (data.status, data.note, now_iso(), app_id))
    if data.status != app["status"]:
        title, body = STATUS_MESSAGES[data.status]
        company = f" at {app['company']}" if app["company"] else ""
        notify(conn, app["student_id"], "application", f"{title}: {app['job_title']}{company}", body, "/student/applications")
    conn.commit()
    return serialize_application(conn, load_application(conn, app_id, user), user)


class InterviewIn(BaseModel):
    scheduled_at: str = Field(min_length=10)
    duration_minutes: int = Field(default=30, gt=0, le=480)
    mode: Literal["Online", "Onsite", "Phone"] = "Online"
    location: Optional[str] = None
    notes: Optional[str] = None


@router.post("/applications/{app_id}/interviews", status_code=201)
def schedule_interview(app_id: str, data: InterviewIn, user=Depends(require_roles("recruiter", "admin")), conn=Depends(db)):
    app = load_application(conn, app_id, user)
    require_job_owner(app, user)
    if app["status"] in ("rejected", "withdrawn"):
        raise HTTPException(409, "Cannot schedule an interview for a closed application")
    conn.execute("""INSERT INTO interviews(application_id,scheduled_at,duration_minutes,mode,location,notes)
        VALUES (?,?,?,?,?,?)""", (app_id, data.scheduled_at, data.duration_minutes, data.mode, data.location, data.notes))
    conn.execute("UPDATE applications SET status='interview', updated_at=? WHERE id=?", (now_iso(), app_id))
    notify(conn, app["student_id"], "interview", f"Interview scheduled: {app['job_title']}",
           f"{data.mode} interview on {data.scheduled_at[:16].replace('T', ' ')} UTC"
           + (f" — {data.location}" if data.location else ""), "/student/applications")
    conn.commit()
    return serialize_application(conn, load_application(conn, app_id, user), user)


class InterviewStatusIn(BaseModel):
    status: Literal["scheduled", "completed", "cancelled"]


@router.patch("/interviews/{interview_id}")
def update_interview(interview_id: str, data: InterviewStatusIn, user=Depends(require_roles("recruiter", "admin")),
                     conn=Depends(db)):
    interview = one(conn, "SELECT * FROM interviews WHERE id=?", (interview_id,))
    if not interview:
        raise HTTPException(404, "Interview not found")
    app = load_application(conn, interview["application_id"], user)
    require_job_owner(app, user)
    conn.execute("UPDATE interviews SET status=? WHERE id=?", (data.status, interview_id))
    if data.status == "cancelled":
        notify(conn, app["student_id"], "interview", f"Interview cancelled: {app['job_title']}",
               "The recruiter cancelled the scheduled interview.", "/student/applications")
    conn.commit()
    return serialize_application(conn, app, user)


class JobUpdateIn(BaseModel):
    is_active: bool


@router.patch("/jobs/{job_id}")
def update_job(job_id: str, data: JobUpdateIn, user=Depends(require_roles("recruiter", "admin")), conn=Depends(db)):
    job = load_job(conn, job_id)
    if user["role"] != "admin" and job["recruiter_id"] != user["id"]:
        raise HTTPException(403, "You can only manage your own jobs")
    conn.execute("UPDATE jobs SET is_active=? WHERE id=?", (int(data.is_active), job_id))
    conn.commit()
    return serialize_job(load_job(conn, job_id))


@router.get("/jobs/{job_id}/candidates")
def job_candidates(job_id: str, user=Depends(require_roles("recruiter", "admin")), conn=Depends(db)):
    """Discover Talent ranked against a specific job's required skills."""
    job = serialize_job(load_job(conn, job_id))
    applied = {a["student_id"]: a["status"] for a in many(conn, "SELECT student_id, status FROM applications WHERE job_id=?",
                                                          (job_id,))}
    shortlisted = {r["student_id"] for r in many(conn, "SELECT student_id FROM recruiter_shortlists WHERE recruiter_id=?",
                                                 (user["id"],))}
    out = []
    for s in many(conn, "SELECT id FROM users WHERE role='student' AND is_active=1"):
        score, matched, missing = match_job(student_skill_map(conn, s["id"]), job["requiredSkills"])
        if not matched:
            continue
        out.append({"student": serialize_student(conn, s["id"]), "match": score, "matchedSkills": matched,
                    "missingSkills": missing, "applicationStatus": applied.get(s["id"]), "shortlisted": s["id"] in shortlisted})
    out.sort(key=lambda c: c["match"], reverse=True)
    return out


@router.get("/recruiter/shortlist")
def recruiter_shortlist(user=Depends(require_roles("recruiter")), conn=Depends(db)):
    rows = many(conn, """SELECT student_id, MIN(created_at) created_at FROM recruiter_shortlists WHERE recruiter_id=?
        GROUP BY student_id ORDER BY created_at DESC""", (user["id"],))
    return [{**serialize_student(conn, r["student_id"]), "shortlistedAt": r["created_at"]} for r in rows]


# ---------------------------------------------------------------------------
# Messaging (recruiter <-> candidate, per application)
# ---------------------------------------------------------------------------

@router.get("/conversations")
def conversations(user=Depends(require_roles("student", "recruiter")), conn=Depends(db)):
    who = "a.student_id=?" if user["role"] == "student" else "j.recruiter_id=?"
    rows = application_rows(conn, f"{who} AND (a.status IN ('shortlisted','interview','selected') "
                                  "OR EXISTS (SELECT 1 FROM messages m WHERE m.application_id=a.id))", (user["id"],))
    out = []
    for r in rows:
        last = one(conn, "SELECT body, created_at, sender_id FROM messages WHERE application_id=? ORDER BY created_at DESC LIMIT 1",
                   (r["id"],))
        unread = one(conn, "SELECT COUNT(*) n FROM messages WHERE application_id=? AND sender_id!=? AND read_at IS NULL",
                     (r["id"], user["id"]))["n"]
        other = ({"id": r["recruiter_id"], "name": r["recruiter_name"], "avatar": r["recruiter_avatar"]}
                 if user["role"] == "student" else
                 {"id": r["student_id"], "name": r["student_name"], "avatar": r["student_avatar"]})
        out.append({"applicationId": r["id"], "status": r["status"], "jobTitle": r["job_title"], "company": r["company"] or "",
                    "other": other, "lastMessage": last["body"] if last else None,
                    "lastAt": last["created_at"] if last else r["updated_at"], "unread": unread,
                    "canMessage": r["status"] in MESSAGING_STATUSES})
    out.sort(key=lambda c: c["lastAt"] or "", reverse=True)
    return out


@router.get("/applications/{app_id}/messages")
def get_messages(app_id: str, user=Depends(get_current_user), conn=Depends(db)):
    load_application(conn, app_id, user)
    rows = many(conn, """SELECT m.*, u.name sender_name, u.avatar_url sender_avatar FROM messages m
        JOIN users u ON u.id=m.sender_id WHERE application_id=? ORDER BY m.created_at""", (app_id,))
    conn.execute("UPDATE messages SET read_at=? WHERE application_id=? AND sender_id!=? AND read_at IS NULL",
                 (now_iso(), app_id, user["id"]))
    conn.commit()
    return [{"id": m["id"], "body": m["body"], "createdAt": m["created_at"], "senderId": m["sender_id"],
             "senderName": m["sender_name"], "senderAvatar": m["sender_avatar"], "mine": m["sender_id"] == user["id"]}
            for m in rows]


class MessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


@router.post("/applications/{app_id}/messages", status_code=201)
def send_message(app_id: str, data: MessageIn, user=Depends(require_roles("student", "recruiter")), conn=Depends(db)):
    app = load_application(conn, app_id, user)
    if app["status"] not in MESSAGING_STATUSES:
        raise HTTPException(409, "Messaging opens once the candidate is shortlisted")
    conn.execute("INSERT INTO messages(application_id,sender_id,body) VALUES (?,?,?)", (app_id, user["id"], data.body.strip()))
    other = app["recruiter_id"] if user["id"] == app["student_id"] else app["student_id"]
    notify(conn, other, "message", f"New message from {user['name']}", data.body.strip()[:140], "/messages")
    conn.commit()
    return get_messages(app_id, user, conn)


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

@router.get("/notifications")
def notifications(user=Depends(get_current_user), conn=Depends(db)):
    rows = many(conn, "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100", (user["id"],))
    unread = one(conn, "SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read_at IS NULL", (user["id"],))["n"]
    return {"unread": unread, "items": [{
        "id": n["id"], "type": n["type"], "title": n["title"], "body": n["body"] or "", "link": n["link"],
        "read": n["read_at"] is not None, "createdAt": n["created_at"],
    } for n in rows]}


@router.post("/notifications/{notification_id}/read")
def read_notification(notification_id: str, user=Depends(get_current_user), conn=Depends(db)):
    conn.execute("UPDATE notifications SET read_at=? WHERE id=? AND user_id=? AND read_at IS NULL",
                 (now_iso(), notification_id, user["id"]))
    conn.commit()
    return notifications(user, conn)


@router.post("/notifications/read-all")
def read_all_notifications(user=Depends(get_current_user), conn=Depends(db)):
    conn.execute("UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL", (now_iso(), user["id"]))
    conn.commit()
    return notifications(user, conn)


# ---------------------------------------------------------------------------
# Admin: reports & platform management
# ---------------------------------------------------------------------------

@router.get("/admin/reports")
def admin_reports(user=Depends(require_roles("admin")), conn=Depends(db)):
    def grouped(sql):
        return {r["k"]: r["n"] for r in many(conn, sql)}

    turnaround = one(conn, """SELECT AVG((julianday(reviewed_at) - julianday(submitted_at)) * 24) h
        FROM verification_requests WHERE reviewed_at IS NOT NULL""")["h"]
    return {
        "usersByRole": grouped("SELECT role k, COUNT(*) n FROM users GROUP BY role"),
        "suspendedUsers": one(conn, "SELECT COUNT(*) n FROM users WHERE is_active=0")["n"],
        "pendingFaculty": one(conn, "SELECT COUNT(*) n FROM users WHERE role='teacher' AND is_active=0")["n"],
        "verificationsByStatus": grouped("SELECT status k, COUNT(*) n FROM verification_requests GROUP BY status"),
        "verificationsByType": grouped("SELECT verification_type k, COUNT(*) n FROM verification_requests GROUP BY verification_type"),
        "avgReviewHours": round(turnaround, 1) if turnaround is not None else None,
        "applicationsByStatus": grouped("SELECT status k, COUNT(*) n FROM applications GROUP BY status"),
        "jobs": {"active": one(conn, "SELECT COUNT(*) n FROM jobs WHERE is_active=1")["n"],
                 "closed": one(conn, "SELECT COUNT(*) n FROM jobs WHERE is_active=0")["n"]},
        "topVerifiedSkills": [{"name": r["name"], "count": r["n"]} for r in many(conn, """
            SELECT s.name, COUNT(*) n FROM student_skills ss JOIN skills s ON s.id=ss.skill_id
            WHERE ss.status='verified' GROUP BY s.name ORDER BY n DESC LIMIT 8""")],
        "interviewsScheduled": one(conn, "SELECT COUNT(*) n FROM interviews WHERE status='scheduled'")["n"],
    }


@router.get("/admin/jobs")
def admin_jobs(user=Depends(require_roles("admin")), conn=Depends(db)):
    rows = many(conn, JOB_SELECT.replace("FROM jobs j", ", u.name recruiter_name FROM jobs j JOIN users u ON u.id=j.recruiter_id")
                + " ORDER BY j.created_at DESC")
    return [{**serialize_job(r), "recruiterName": r["recruiter_name"]} for r in rows]
