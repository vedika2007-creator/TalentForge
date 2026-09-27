"""Collaboration hub: students/faculty post team ideas; others request to join and the creator
accepts or declines. Nobody joins a team without the creator's permission."""
import json
import sqlite3
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core import db, get_optional_user, many, now_iso, one, require_roles
from workflow import notify

router = APIRouter(prefix="/api/v1")

COLLAB_ROLES = ("student", "teacher")

COLLAB_SELECT = """
    SELECT cp.*, u.name creator_name, u.avatar_url creator_avatar, u.role creator_role,
        u.headline creator_headline, u.college creator_college,
        (SELECT json_group_array(user_id) FROM collaboration_members cm WHERE cm.post_id=cp.id) member_ids,
        (SELECT json_group_array(role_name) FROM collaboration_roles cr WHERE cr.post_id=cp.id) looking_for,
        (SELECT json_group_array(tag) FROM collaboration_tags ct WHERE ct.post_id=cp.id) tags,
        (SELECT COUNT(*) FROM collaboration_requests rq WHERE rq.post_id=cp.id AND rq.status='pending') pending_requests
    FROM collaboration_posts cp JOIN users u ON u.id=cp.creator_id
"""


def serialize_collab(conn, r: dict, user: Optional[dict]):
    member_ids = json.loads(r["member_ids"] or "[]")
    user_id = user["id"] if user else None
    is_owner = user_id == r["creator_id"]
    my_request = (one(conn, "SELECT status FROM collaboration_requests WHERE post_id=? AND user_id=?", (r["id"], user_id))
                  if user_id else None)
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
        "isOwner": is_owner,
        "myRequestStatus": my_request["status"] if my_request else None,
        # Only the creator sees how many requests are waiting.
        "pendingRequests": r["pending_requests"] if is_owner else 0,
    }


def load_post(conn, post_id: str):
    p = one(conn, COLLAB_SELECT + " WHERE cp.id=? OR cp.external_id=?", (post_id, post_id))
    if not p:
        raise HTTPException(404, "Collaboration post not found")
    return p


class CollaborationIn(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = None
    domain: Optional[str] = None
    max_members: int = Field(default=2, gt=0)
    looking_for: list[str] = []
    tags: list[str] = []


class JoinRequestIn(BaseModel):
    message: Optional[str] = Field(default=None, max_length=1000)


@router.get("/collaborations")
def collaborations(user=Depends(get_optional_user), conn=Depends(db)):
    rows = many(conn, COLLAB_SELECT + " WHERE cp.is_active=1 ORDER BY cp.posted_at DESC")
    return [serialize_collab(conn, r, user) for r in rows]


@router.post("/collaborations", status_code=201)
def create_collaboration(data: CollaborationIn, user=Depends(require_roles(*COLLAB_ROLES)), conn=Depends(db)):
    p = one(conn, "INSERT INTO collaboration_posts(creator_id,title,description,domain,max_members) VALUES (?,?,?,?,?) RETURNING id",
            (user["id"], data.title, data.description, data.domain, data.max_members))
    conn.execute("INSERT INTO collaboration_members(post_id,user_id) VALUES (?,?)", (p["id"], user["id"]))
    for role in data.looking_for:
        if role.strip():
            conn.execute("INSERT INTO collaboration_roles(post_id,role_name) VALUES (?,?)", (p["id"], role.strip()))
    for tag in {t.strip() for t in data.tags if t.strip()}:
        conn.execute("INSERT INTO collaboration_tags(post_id,tag) VALUES (?,?)", (p["id"], tag))
    conn.commit()
    return serialize_collab(conn, load_post(conn, p["id"]), user)


@router.post("/collaborations/{post_id}/join")
def request_to_join(post_id: str, data: JoinRequestIn = JoinRequestIn(), user=Depends(require_roles(*COLLAB_ROLES)),
                    conn=Depends(db)):
    """Asks the creator for permission to join. Membership is only granted when they accept."""
    p = load_post(conn, post_id)
    if p["creator_id"] == user["id"]:
        raise HTTPException(409, "You created this team")
    if user["id"] in json.loads(p["member_ids"] or "[]"):
        raise HTTPException(409, "You are already a member of this team")
    if len(json.loads(p["member_ids"] or "[]")) >= p["max_members"]:
        raise HTTPException(409, "This team is already full")
    existing = one(conn, "SELECT * FROM collaboration_requests WHERE post_id=? AND user_id=?", (p["id"], user["id"]))
    if existing and existing["status"] == "pending":
        raise HTTPException(409, "Your request is already waiting for the creator's approval")
    if existing:
        conn.execute("UPDATE collaboration_requests SET status='pending', message=?, created_at=?, decided_at=NULL WHERE id=?",
                     (data.message, now_iso(), existing["id"]))
    else:
        conn.execute("INSERT INTO collaboration_requests(post_id,user_id,message) VALUES (?,?,?)", (p["id"], user["id"], data.message))
    notify(conn, p["creator_id"], "collaboration", f"{user['name']} wants to join “{p['title']}”",
           data.message or "Review the request in the Collaborate hub.", "/collaborate")
    conn.commit()
    return serialize_collab(conn, load_post(conn, p["id"]), user)


@router.delete("/collaborations/{post_id}/join")
def withdraw_request(post_id: str, user=Depends(require_roles(*COLLAB_ROLES)), conn=Depends(db)):
    p = load_post(conn, post_id)
    conn.execute("DELETE FROM collaboration_requests WHERE post_id=? AND user_id=? AND status='pending'", (p["id"], user["id"]))
    conn.commit()
    return serialize_collab(conn, load_post(conn, p["id"]), user)


def require_owner(p: dict, user: dict):
    if p["creator_id"] != user["id"]:
        raise HTTPException(403, "Only the team creator can manage join requests")


@router.get("/collaborations/{post_id}/requests")
def list_requests(post_id: str, user=Depends(require_roles(*COLLAB_ROLES)), conn=Depends(db)):
    p = load_post(conn, post_id)
    require_owner(p, user)
    rows = many(conn, """SELECT rq.*, u.name, u.avatar_url, u.college, u.headline, u.role,
            (SELECT json_group_array(s.name) FROM student_skills ss JOIN skills s ON s.id=ss.skill_id
                WHERE ss.student_id=u.id AND ss.status='verified') verified_skills
        FROM collaboration_requests rq JOIN users u ON u.id=rq.user_id
        WHERE rq.post_id=? ORDER BY CASE rq.status WHEN 'pending' THEN 0 ELSE 1 END, rq.created_at DESC""", (p["id"],))
    return [{
        "id": r["id"], "status": r["status"], "message": r["message"] or "", "createdAt": r["created_at"],
        "decidedAt": r["decided_at"],
        "user": {"id": r["user_id"], "name": r["name"], "avatar": r["avatar_url"], "college": r["college"] or "",
                 "headline": r["headline"] or "", "role": r["role"],
                 "verifiedSkills": json.loads(r["verified_skills"] or "[]")},
    } for r in rows]


def decide(conn, request_id: str, user: dict, accept: bool):
    rq = one(conn, "SELECT * FROM collaboration_requests WHERE id=?", (request_id,))
    if not rq:
        raise HTTPException(404, "Join request not found")
    p = load_post(conn, rq["post_id"])
    require_owner(p, user)
    if rq["status"] != "pending":
        raise HTTPException(409, f"This request was already {rq['status']}")
    if accept:
        if len(json.loads(p["member_ids"] or "[]")) >= p["max_members"]:
            raise HTTPException(409, "The team is full — increase capacity or decline the request")
        try:
            conn.execute("INSERT INTO collaboration_members(post_id,user_id) VALUES (?,?)", (p["id"], rq["user_id"]))
        except sqlite3.IntegrityError:
            pass  # already a member
    conn.execute("UPDATE collaboration_requests SET status=?, decided_at=? WHERE id=?",
                 ("accepted" if accept else "declined", now_iso(), request_id))
    notify(conn, rq["user_id"], "collaboration",
           f"{'You joined' if accept else 'Request declined:'} “{p['title']}”",
           f"{user['name']} {'accepted' if accept else 'declined'} your request to join the team.", "/collaborate")
    conn.commit()
    return list_requests(p["id"], user, conn)


@router.post("/collaboration-requests/{request_id}/accept")
def accept_request(request_id: str, user=Depends(require_roles(*COLLAB_ROLES)), conn=Depends(db)):
    return decide(conn, request_id, user, True)


@router.post("/collaboration-requests/{request_id}/decline")
def decline_request(request_id: str, user=Depends(require_roles(*COLLAB_ROLES)), conn=Depends(db)):
    return decide(conn, request_id, user, False)
