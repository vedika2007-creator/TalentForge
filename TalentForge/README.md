# TalentForge

Evidence-based student talent platform — React (Vite) frontend + FastAPI backend + SQLite database.

**Student profile → verified skills → job matching → application → shortlist → interview → selection → notification**

## Quick start
1. Install **Python 3.10+** (tick "Add Python to PATH") and **Node.js 18+**.
2. Unzip this folder.
3. **Windows:** double-click `start.bat`  ·  **macOS/Linux:** run `bash start.sh`

The first run installs dependencies (a few minutes), then the browser opens http://localhost:3000.
The SQLite database (`backend/talentforge.db`) is created, seeded and upgraded automatically.

## Demo accounts — password `demo1234`
Sign in with just email + password; the workspace is chosen from the account's role.

| Role | Email | What they can do |
|---|---|---|
| Student | aarav@talentforge.dev (also priya@, rohan@, sneha@) | Profile, skills, projects, certificates/evidence, discover opportunities, applications, messages, notifications |
| Recruiter | recruiter@talentforge.dev · hiring@cloudscale.co | Create jobs, discover talent, view verified profiles, shortlist, interview, select/reject, messages |
| Faculty | ramesh@talentforge.dev (also sunita@, arvind@, sandeep@, neha@) | Verification requests, certificate & evidence review, accept/decline, student verification |
| Admin | admin@talentforge.dev | User management (incl. faculty approval), platform management, reports, verification monitoring |

Self-registration is available for students, recruiters and faculty. Faculty accounts stay inactive until an admin approves them; admin accounts cannot be self-registered.

## Security model
- Every API endpoint checks the caller's role on the server (`require_roles`), so typing another role's URL or calling its API returns 403.
- The frontend route table (`src/app/routes.tsx`) mirrors those rules and shows *Access denied* for pages outside your role.
- Sessions are per browser tab, so you can test different roles side by side.

## Project layout
```
backend/   FastAPI app (main.py, workflow.py), SQLite schema + seed data, tests/test_workflow.py
src/app/   Signed-in shell: role navigation, route protection, notifications
src/pages/ student/, recruiter/, teacher/, admin/, shared/ workspaces + public landing pages
```

Run the backend end-to-end test (against a throwaway DB on port 8020):
```bash
cd backend && DATABASE_PATH=/tmp/e2e.db venv/Scripts/python -m uvicorn main:app --port 8020 &
venv/Scripts/python tests/test_workflow.py
```
See `backend/README.md` for manual setup and the API.
