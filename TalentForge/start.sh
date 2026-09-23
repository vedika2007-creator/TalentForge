#!/usr/bin/env bash
# TalentForge one-click launcher (macOS/Linux). Requires Python 3.10+ and Node.js 18+.
set -e
cd "$(dirname "$0")"
[ -d backend/venv ] || { python3 -m venv backend/venv && backend/venv/bin/pip install -q -r backend/requirements.txt; }
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -d node_modules ] || npm install
(cd backend && venv/bin/python -m uvicorn main:app --port 8000) &
API=$!
trap "kill $API" EXIT
( sleep 6; (open http://localhost:3000 || xdg-open http://localhost:3000) >/dev/null 2>&1 ) &
npm run dev
