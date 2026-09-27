"""Shared database helpers and authentication dependencies for the TalentForge API."""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException

from database import connect

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-in-production")
JWT_ALGORITHM = "HS256"
TOKEN_HOURS = 24


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

def db():
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()


def one(conn, sql, params=()):
    row = conn.execute(sql, params).fetchone()
    return dict(row) if row else None


def many(conn, sql, params=()):
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def month_year(value: Optional[str]):
    """'2026-08-01' -> 'Aug 2026'"""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value[:10]).strftime("%b %Y")
    except ValueError:
        return value


def long_date(value: Optional[str]):
    """'2026-08-18' -> 'August 18, 2026'"""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value[:10]).strftime("%B %d, %Y")
    except ValueError:
        return value


def resolve_user(conn, value: str):
    return one(conn, "SELECT * FROM users WHERE id=? OR external_id=? OR email=?", (value, value, value))


def public_user(u: dict):
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "role": u["role"],
        "avatar": u["avatar_url"],
        "college": u["college"],
        "department": u["department"],
        "headline": u["headline"],
        "isActive": bool(u["is_active"]),
        "createdAt": u["created_at"],
    }


def issue_token(user: dict):
    exp = datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS)
    token = jwt.encode({"sub": user["id"], "role": user["role"], "exp": exp}, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "user": public_user(user)}


# ---------------------------------------------------------------------------
# Auth dependencies
# ---------------------------------------------------------------------------

def _user_from_header(authorization: Optional[str], conn):
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = one(conn, "SELECT * FROM users WHERE id=? AND is_active=1", (payload.get("sub"),))
    if not user:
        raise HTTPException(401, "User not found or suspended")
    return user


def get_current_user(authorization: Optional[str] = Header(default=None), conn=Depends(db)):
    user = _user_from_header(authorization, conn)
    if not user:
        raise HTTPException(401, "Authentication required")
    return user


def get_optional_user(authorization: Optional[str] = Header(default=None), conn=Depends(db)):
    try:
        return _user_from_header(authorization, conn)
    except HTTPException:
        return None


def require_roles(*roles):
    def dep(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return dep
