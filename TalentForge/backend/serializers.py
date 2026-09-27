"""Row -> JSON serializers shared by all route modules (shapes match src/types/index.ts)."""
import json

from core import long_date, many, month_year, one


# ---------------------------------------------------------------------------
# Serializers (DB rows -> frontend camelCase types in src/types/index.ts)
# ---------------------------------------------------------------------------

def serialize_student(conn, student_id: str):
    u = one(conn, "SELECT * FROM student_profiles WHERE id=?", (student_id,))
    if not u:
        return None
    skills = many(conn, """
        SELECT ss.*, s.name skill_name, s.category, v.name verifier_name
        FROM student_skills ss JOIN skills s ON s.id=ss.skill_id
        LEFT JOIN users v ON v.id=ss.verifier_id
        WHERE ss.student_id=? ORDER BY ss.confidence_score DESC""", (student_id,))
    featured = many(conn, "SELECT project_id FROM project_members WHERE student_id=? AND is_featured=1", (student_id,))
    return {
        "id": u["id"],
        "name": u["name"],
        "headline": u["headline"] or "",
        "bio": u["bio"] or "",
        "avatar": u["avatar"] or "",
        "college": u["college"] or "",
        "department": u["department"] or "",
        "batchYear": u["batch_year"],
        "overallScore": round(u["overall_score"] or 0),
        "location": u["location"] or "",
        "githubUsername": u["github_username"] or "",
        "targetRole": u["target_role"] or "",
        "availableForHire": bool(u["available_for_hire"]),
        "projectCount": u["project_count"],
        "verifiedCount": u["verified_count"],
        "totalGithubCommits": u["total_github_commits"],
        "repositoryCount": u["repository_count"],
        "featuredProjects": [f["project_id"] for f in featured],
        "skills": [{
            "id": x["id"],
            "skillName": x["skill_name"],
            "category": x["category"],
            "confidenceScore": round(x["confidence_score"] or 0),
            "status": x["status"],
            "evidenceSources": {
                "projectsCount": x["projects_count"],
                "githubContributions": x["github_contributions"],
                "assessmentsCompleted": x["assessments_completed"],
                "certificatesCount": x["certificates_count"],
                "facultyVerified": bool(x["faculty_verified"]),
                "verifierName": x["verifier_name"],
                "verifiedDate": month_year(x["verified_at"]),
            },
            "weightBreakdown": {
                "projects": x["projects_weight"] or 0,
                "github": x["github_weight"] or 0,
                "assessment": x["assessment_weight"] or 0,
                "faculty": x["faculty_weight"] or 0,
            },
        } for x in skills],
    }


PROJECT_SELECT = """
    SELECT p.*,
        u.id author_id, u.name author_name, u.avatar_url author_avatar, pm.role member_role,
        v.name verified_by_name, v.headline verified_by_title,
        (SELECT json_group_array(name) FROM (SELECT s.name FROM project_technologies pt JOIN skills s ON s.id=pt.skill_id
            WHERE pt.project_id=p.id ORDER BY s.name)) technologies,
        (SELECT json_group_array(highlight) FROM (SELECT highlight FROM project_highlights ph
            WHERE ph.project_id=p.id ORDER BY display_order)) highlights
    FROM projects p
    LEFT JOIN project_members pm ON pm.project_id=p.id AND pm.student_id=(
        SELECT student_id FROM project_members WHERE project_id=p.id ORDER BY is_featured DESC LIMIT 1)
    LEFT JOIN users u ON u.id=pm.student_id
    LEFT JOIN users v ON v.id=p.verified_by
"""


def serialize_project(r: dict):
    verified_by = r["verified_by_name"]
    if verified_by and r["verified_by_title"]:
        verified_by = f"{verified_by} ({r['verified_by_title']})"
    return {
        "id": r["id"],
        "title": r["title"],
        "tagline": r["tagline"] or "",
        "description": r["description"] or "",
        "authorId": r["author_id"] or "",
        "authorName": r["author_name"] or "",
        "authorAvatar": r["author_avatar"] or "",
        "role": r["member_role"] or "",
        "technologies": json.loads(r["technologies"] or "[]"),
        "domain": r["domain"],
        "isFacultyVerified": bool(r["is_faculty_verified"]),
        "verifiedBy": verified_by,
        "verificationDate": long_date(r["verification_date"]),
        "githubUrl": r["github_url"] or "",
        "demoUrl": r["demo_url"],
        "metrics": {"stars": r["stars"], "commits": r["commits"], "contributors": r["contributors"]},
        "highlights": json.loads(r["highlights"] or "[]"),
        "createdAt": r["created_at"],
    }


def serialize_verification(r: dict):
    return {
        "id": r["id"],
        "studentId": r["student_id"],
        "studentName": r["student_name"],
        "studentAvatar": r["student_avatar"] or "",
        "studentDepartment": r["student_department"] or "",
        "projectId": r["project_id"],
        "skillId": r.get("skill_id"),
        "skillName": r.get("skill_name"),
        "certificateId": r.get("certificate_id"),
        "certificateTitle": r.get("certificate_title"),
        "skillOrProjectTitle": r["title"],
        "type": r["verification_type"],
        "submittedAt": r["submitted_at"],
        "status": r["status"],
        "reviewedAt": r["reviewed_at"],
        "reviewerName": r["reviewer_name"],
        "notes": r["notes"],
        "submittedEvidence": {
            "githubRepo": r["github_repo_url"],
            "projectReportUrl": r["project_report_url"],
            "demoUrl": r["demo_url"],
            "certificateIssuer": r["certificate_issuer"],
            "assessmentScore": r["assessment_score"],
            "certificateUrl": r.get("certificate_url"),
        },
    }


def serialize_job(r: dict):
    return {
        "id": r["id"],
        "title": r["title"],
        "company": r["company"] or "",
        "department": r["department"] or "",
        "requiredSkills": json.loads(r["required_skills"] or "[]"),
        "minConfidence": r["min_confidence"],
        "preferredProjects": r["preferred_projects"],
        "requireFacultyVerification": bool(r["require_faculty_verification"]),
        "locationType": r["location_type"],
        "location": r.get("location") or "",
        "description": r.get("description") or "",
        "recruiterId": r["recruiter_id"],
        "isActive": bool(r["is_active"]),
        "applicantCount": r.get("applicant_count") or 0,
        "createdAt": r["created_at"],
    }


JOB_SELECT = """
    SELECT j.*, (SELECT json_group_array(s.name) FROM job_required_skills jrs JOIN skills s ON s.id=jrs.skill_id
        WHERE jrs.job_id=j.id) required_skills,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id=j.id AND a.status!='withdrawn') applicant_count
    FROM jobs j
"""

SKILL_CATEGORY_HINTS = {
    "Frontend": ["react", "vue", "angular", "tailwind", "css", "html", "next", "svelte", "typescript", "javascript"],
    "AI/ML": ["ml", "learning", "tensorflow", "pytorch", "pandas", "numpy", "opencv", "vision", "nlp", "llm", "ai"],
    "DevOps": ["docker", "kubernetes", "k8s", "ci", "cd", "terraform", "aws", "gcp", "azure", "prometheus", "grafana", "linux"],
    "Database": ["sql", "postgres", "mysql", "mongo", "sqlite", "database", "redis"],
    "Mobile": ["flutter", "android", "ios", "swift", "kotlin", "react native"],
}


def get_or_create_skill(conn, name: str):
    name = name.strip()
    if not name:
        return None
    s = one(conn, "SELECT id FROM skills WHERE LOWER(name)=LOWER(?)", (name,))
    if s:
        return s["id"]
    lower = name.lower()
    category = next((cat for cat, hints in SKILL_CATEGORY_HINTS.items() if any(h in lower for h in hints)), "Backend")
    return conn.execute("INSERT INTO skills(name,category) VALUES (?,?) RETURNING id", (name, category)).fetchone()["id"]
