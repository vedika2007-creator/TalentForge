# TalentForge Backend (FastAPI + SQLite)

The database is a single SQLite file (`backend/talentforge.db`). It is created and seeded automatically
the first time the API starts. The schema was ported from `talentforge_database.sql` (PostgreSQL) into `schema.sql` and `seed.sql`.

## Run

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Frontend (in the project root, a second terminal):
```bash
npm install
npm run dev        # http://localhost:3000
```

Reset the database to the seed data: `python database.py --reset`

API docs: http://localhost:8000/docs

## Demo accounts (password `demo1234`)
| Role | Email |
|---|---|
| Student | aarav@talentforge.dev (also priya@, rohan@, sneha@) |
| Teacher | ramesh@talentforge.dev (also sunita@, arvind@, sandeep@, neha@) |
| Recruiter | recruiter@talentforge.dev |
| Admin | admin@talentforge.dev |

## Workflow endpoints (v2)
- Profile: `GET /api/v1/students/me/profile`, `GET /api/v1/profiles/{id}` (recruiter/faculty/admin), education, achievements, skills, skill evidence and certificates under `/api/v1/students/me/...`
- Opportunities & applications: `GET /api/v1/opportunities`, `POST /api/v1/jobs/{id}/apply`, `GET /api/v1/applications/mine`, `POST /api/v1/applications/{id}/withdraw`
- Recruiter pipeline: `GET /api/v1/recruiter/applications`, `PATCH /api/v1/applications/{id}` (shortlisted / interview / selected / rejected), `POST /api/v1/applications/{id}/interviews`, `GET /api/v1/jobs/{id}/candidates`, `GET /api/v1/recruiter/shortlist`
- Messaging: `GET /api/v1/conversations`, `GET|POST /api/v1/applications/{id}/messages` (opens once shortlisted)
- Notifications: `GET /api/v1/notifications`, `POST /api/v1/notifications/{id}/read`, `POST /api/v1/notifications/read-all`
- Admin: `GET /api/v1/admin/reports`, `GET /api/v1/admin/jobs`, `PATCH /api/v1/admin/users/{id}/status`

Existing databases are upgraded in place on startup (`database.migrate`). `python database.py --reset` recreates the demo data.
