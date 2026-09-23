"""SQLite connection helpers and database bootstrap for TalentForge."""
import os
import sqlite3
from pathlib import Path

import bcrypt
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DATABASE_PATH = Path(os.getenv("DATABASE_PATH", BASE_DIR / "talentforge.db"))
if not DATABASE_PATH.is_absolute():
    DATABASE_PATH = BASE_DIR / DATABASE_PATH

SCHEMA_FILE = BASE_DIR / "schema.sql"
SEED_FILE = BASE_DIR / "seed.sql"

# Every seeded account (students, teachers, recruiters, admin) gets this password.
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "demo1234")


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def init_db(reset: bool = False) -> None:
    """Create the schema and seed data. With reset=False this is a no-op if the DB already exists."""
    if DATABASE_PATH.exists() and not reset:
        with connect() as conn:
            if conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").fetchone():
                return
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = connect()
    try:
        conn.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))
        conn.executescript(SEED_FILE.read_text(encoding="utf-8"))
        demo_hash = hash_password(DEMO_PASSWORD)
        conn.execute("UPDATE users SET password_hash=? WHERE email IS NOT NULL", (demo_hash,))
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    import sys

    init_db(reset="--reset" in sys.argv or not DATABASE_PATH.exists())
    print(f"Database ready at {DATABASE_PATH} (demo password: {DEMO_PASSWORD})")
