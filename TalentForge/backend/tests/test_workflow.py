"""End-to-end check of the TalentForge business workflow against a running API.

Usage:  python tests/test_workflow.py [base_url]   (default http://localhost:8020/api/v1)
Run it against a throwaway database — it creates users, jobs and applications.
"""
import json
import sys
import time
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8020/api/v1"
PASSWORD = "demo1234"
failures = []


def call(method, path, token=None, body=None):
    req = urllib.request.Request(BASE + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json", **({"Authorization": f"Bearer {token}"} if token else {})})
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null")


def check(name, cond, detail=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  -> {detail}" if not cond else ""))
    if not cond:
        failures.append(name)


def login(email):
    status, data = call("POST", "/auth/login", body={"email": email, "password": PASSWORD})
    assert status == 200, (email, data)
    return data["access_token"], data["user"]


stamp = str(int(time.time()))

# 1. Registration: role comes from the account; admins cannot self-register; faculty need approval
s, _ = call("POST", "/auth/register", body={"name": "Evil", "email": f"evil{stamp}@x.io", "password": "secret12", "role": "admin"})
check("admin self-registration is rejected", s == 422, s)
s, reg = call("POST", "/auth/register", body={"name": "Maya Rao", "email": f"maya{stamp}@x.edu", "password": "secret12",
                                              "role": "student", "college": "Apex Institute of Technology"})
check("student registers and gets a token", s == 200 and reg["user"]["role"] == "student", reg)
student_token, student = reg["access_token"], reg["user"]
s, fac = call("POST", "/auth/register", body={"name": "Dr New", "email": f"fac{stamp}@x.edu", "password": "secret12", "role": "teacher"})
check("faculty registration is held for approval", s == 200 and fac.get("pending_approval"), fac)
s, d = call("POST", "/auth/login", body={"email": f"fac{stamp}@x.edu", "password": "secret12"})
check("pending faculty cannot sign in", s == 403 and "approval" in d["detail"], d)

teacher_token, teacher = login("ramesh@talentforge.dev")
recruiter_token, recruiter = login("recruiter@talentforge.dev")
admin_token, _ = login("admin@talentforge.dev")
check("login detects role automatically", teacher["role"] == "teacher" and recruiter["role"] == "recruiter")

# 2. Backend authorization: a student cannot reach recruiter/admin/faculty data
for method, path, body in [("GET", "/admin/users", None), ("GET", "/admin/reports", None), ("GET", "/students", None),
                           ("GET", "/recruiter/applications", None), ("GET", "/shortlist", None),
                           ("POST", "/jobs", {"title": "x", "location_type": "Remote"}),
                           ("PATCH", "/verifications/req_1", {"status": "approved"}), ("GET", "/profiles/std_aarav", None)]:
    s, _ = call(method, path, student_token, body)
    check(f"student blocked from {method} {path}", s == 403, s)
s, _ = call("GET", "/admin/users", recruiter_token)
check("recruiter blocked from admin", s == 403, s)
s, _ = call("GET", "/opportunities", recruiter_token)
check("recruiter blocked from student opportunities", s == 403, s)
s, _ = call("GET", "/verifications")
check("anonymous blocked from verification queue", s == 401, s)

# 3. Student completes profile: education, skills, project, certificate, evidence
call("PATCH", "/students/me", student_token, {"headline": "Backend developer", "bio": "I like APIs", "github_username": "maya-dev"})
s, prof = call("POST", "/students/me/education", student_token, {"institution": "Apex Institute of Technology", "degree": "B.Tech",
                                                                  "field_of_study": "CS", "start_year": 2023, "end_year": 2027})
check("education added", s == 201 and len(prof["education"]) == 1, prof)
s, prof = call("POST", "/students/me/skills", student_token, {"name": "Python"})
check("skill added as pending", s == 201 and prof["skills"][0]["status"] == "pending", prof.get("skills"))
s, _ = call("POST", "/students/me/skills", student_token, {"name": "python"})
check("duplicate skill rejected", s == 409, s)
skill_id = prof["skills"][0]["id"]
s, prof = call("POST", f"/students/me/skills/{skill_id}/evidence", student_token,
               {"description": "Built a FastAPI service", "evidence_url": "https://github.com/maya/api"})
check("skill evidence submitted", s == 201, prof)
s, prof = call("POST", "/students/me/certificates", student_token, {"title": "PostgreSQL Basics", "issuer": "EDB", "skill": "PostgreSQL"})
check("certificate submitted as pending", s == 201 and prof["certificates"][0]["status"] == "pending", prof.get("certificates"))
s, proj = call("POST", "/projects", student_token, {"title": f"Maya API {stamp}", "domain": "Web Development",
                                                     "technologies": ["Python", "Django & REST APIs"]})
check("project submitted", s == 201, proj)
s, mine = call("GET", "/verifications", student_token)
check("student sees only own verification requests", s == 200 and len(mine) == 3 and all(r["studentId"] == student["id"] for r in mine),
      [r["studentId"] for r in mine] if isinstance(mine, list) else mine)

# 4. Teacher verifies -> verified skills appear on the profile, student is notified
s, queue = call("GET", "/verifications?status=pending", teacher_token)
maya_reqs = {r["type"]: r for r in queue if r["studentId"] == student["id"]}
check("teacher sees skill, certificate and project requests", set(maya_reqs) == {"skill_assessment", "certificate", "project"},
      list(maya_reqs))
s, _ = call("PATCH", f"/verifications/{maya_reqs['skill_assessment']['id']}", teacher_token, {"status": "approved"})
s2, _ = call("PATCH", f"/verifications/{maya_reqs['certificate']['id']}", teacher_token, {"status": "approved"})
s3, _ = call("PATCH", f"/verifications/{maya_reqs['project']['id']}", teacher_token, {"status": "rejected"})
check("teacher decline requires reason", s3 == 400, s3)
s3, _ = call("PATCH", f"/verifications/{maya_reqs['project']['id']}", teacher_token, {"status": "rejected", "notes": "Repo missing"})
check("teacher decisions saved", (s, s2, s3) == (200, 200, 200), (s, s2, s3))
s, prof = call("GET", "/students/me/profile", student_token)
py = next(k for k in prof["skills"] if k["skillName"] == "Python")
check("Python now faculty-verified on profile", py["status"] == "verified" and py["evidenceSources"]["facultyVerified"], py)
check("certificate verified", prof["certificates"][0]["status"] == "verified", prof["certificates"])
check("overall score updated", prof["overallScore"] > 0, prof["overallScore"])
s, notes = call("GET", "/notifications", student_token)
check("student notified of decisions", sum(n["type"] == "verification" for n in notes["items"]) >= 3, notes["items"][:3])

# 5. Recruiter posts a job; student discovers it with a match score and applies
s, job = call("POST", "/jobs", recruiter_token, {"title": f"Python Intern {stamp}", "company": "TechRecruit Global",
                                                 "location_type": "Remote", "required_skills": ["Python", "PostgreSQL"]})
check("recruiter creates job", s == 201, job)
s, opps = call("GET", "/opportunities", student_token)
opp = next(o for o in opps if o["id"] == job["id"])
check("student sees job with match score", opp["match"] > 0 and "Python" in opp["matchedSkills"], opp)
s, _ = call("POST", f"/jobs/{job['id']}/apply", student_token, {"cover_note": "Hire me"})
check("student applies", s == 201, s)
s, _ = call("POST", f"/jobs/{job['id']}/apply", student_token, {})
check("duplicate application rejected", s == 409, s)

# 6. Recruiter reviews, discovers, shortlists, interviews, messages, selects
s, apps = call("GET", f"/recruiter/applications?job_id={job['id']}", recruiter_token)
check("recruiter sees the application", s == 200 and len(apps) == 1, apps)
app_id = apps[0]["id"]
s, cands = call("GET", f"/jobs/{job['id']}/candidates", recruiter_token)
check("discover talent ranks candidates for the job", s == 200 and any(c["student"]["id"] == student["id"] for c in cands), s)
s, _ = call("GET", f"/profiles/{student['id']}", recruiter_token)
check("recruiter views verified profile", s == 200, s)
s, _ = call("POST", f"/applications/{app_id}/messages", student_token, {"body": "Hello?"})
check("messaging locked before shortlist", s == 409, s)
other_token, _ = login("hiring@cloudscale.co")
s, _ = call("PATCH", f"/applications/{app_id}", other_token, {"status": "selected"})
check("another recruiter cannot manage this application", s == 403, s)
s, a = call("PATCH", f"/applications/{app_id}", recruiter_token, {"status": "shortlisted"})
check("recruiter shortlists", s == 200 and a["status"] == "shortlisted", a)
s, msgs = call("POST", f"/applications/{app_id}/messages", recruiter_token, {"body": "Great profile! Free Tuesday?"})
s2, msgs = call("POST", f"/applications/{app_id}/messages", student_token, {"body": "Yes, Tuesday works."})
check("recruiter and student exchange messages", (s, s2) == (201, 201) and len(msgs) == 2, msgs)
s, a = call("POST", f"/applications/{app_id}/interviews", recruiter_token,
            {"scheduled_at": "2026-10-06T10:00:00Z", "mode": "Online", "location": "https://meet.example/x"})
check("interview scheduled", s == 201 and a["status"] == "interview" and len(a["interviews"]) == 1, a)
s, a = call("PATCH", f"/applications/{app_id}", recruiter_token, {"status": "selected"})
check("recruiter selects candidate", s == 200 and a["status"] == "selected", a)
s, mine = call("GET", "/applications/mine", student_token)
check("student sees selected status + interview", mine[0]["status"] == "selected" and mine[0]["interviews"], mine[0])
s, notes = call("GET", "/notifications", student_token)
titles = [n["title"] for n in notes["items"]]
check("student notified: shortlist, interview, message, selection",
      any("shortlisted" in t for t in titles) and any("Interview" in t for t in titles)
      and any("message" in t for t in titles) and any("selected" in t for t in titles), titles)
s, convos = call("GET", "/conversations", student_token)
check("conversation listed for student", any(c["applicationId"] == app_id for c in convos), convos)

# 7. Admin: approve faculty, reports, platform management
s, users = call("GET", "/admin/users", admin_token)
pending = next(u for u in users if u["email"] == f"fac{stamp}@x.edu")
check("pending faculty visible to admin", not pending["isActive"], pending)
call("PATCH", f"/admin/users/{pending['id']}/status", admin_token, {"is_active": True})
s, _ = call("POST", "/auth/login", body={"email": f"fac{stamp}@x.edu", "password": "secret12"})
check("approved faculty can sign in", s == 200, s)
s, rep = call("GET", "/admin/reports", admin_token)
check("admin reports", s == 200 and rep["applicationsByStatus"].get("selected", 0) >= 1, rep)
s, j = call("PATCH", f"/jobs/{job['id']}", admin_token, {"is_active": False})
check("admin can close a job", s == 200 and not j["isActive"], j)

# 8. Collaboration: joining needs the creator's permission
s, post = call("POST", "/collaborations", student_token, {"title": f"Hackathon team {stamp}", "description": "x", "domain": "AI",
                                                          "max_members": 3, "looking_for": ["Backend"], "tags": ["AI"]})
check("student creates a collaboration post", s == 201 and post["isOwner"] and post["currentMembers"] == 1, post)
rohan_token, _ = login("rohan@talentforge.dev")
s, _ = call("POST", f"/collaborations/{post['id']}/join", recruiter_token, {})
check("recruiter cannot join student collaborations", s == 403, s)
s, p2 = call("POST", f"/collaborations/{post['id']}/join", rohan_token, {"message": "I can do backend"})
check("join creates a pending request, not membership",
      s == 200 and p2["myRequestStatus"] == "pending" and not p2["isMember"] and p2["currentMembers"] == 1, p2)
s, _ = call("POST", f"/collaborations/{post['id']}/join", rohan_token, {})
check("duplicate join request rejected", s == 409, s)
s, _ = call("GET", f"/collaborations/{post['id']}/requests", rohan_token)
check("only the creator can see join requests", s == 403, s)
s, reqs = call("GET", f"/collaborations/{post['id']}/requests", student_token)
check("creator sees the pending request", s == 200 and reqs[0]["status"] == "pending" and reqs[0]["message"] == "I can do backend", reqs)
s, _ = call("POST", f"/collaboration-requests/{reqs[0]['id']}/accept", rohan_token)
check("requester cannot accept their own request", s == 403, s)
s, reqs = call("POST", f"/collaboration-requests/{reqs[0]['id']}/accept", student_token)
check("creator accepts", s == 200 and reqs[0]["status"] == "accepted", reqs)
s, posts = call("GET", "/collaborations", rohan_token)
mine = next(x for x in posts if x["id"] == post["id"])
check("accepted user becomes a member", mine["isMember"] and mine["currentMembers"] == 2, mine)
s, notes = call("GET", "/notifications", rohan_token)
check("requester notified of acceptance", any("You joined" in n["title"] for n in notes["items"]), notes["items"][:2])

print(f"\n{len(failures)} failure(s)" if failures else "\nALL CHECKS PASSED")
sys.exit(1 if failures else 0)
