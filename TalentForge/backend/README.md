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
