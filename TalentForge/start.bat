@echo off
REM TalentForge one-click launcher (Windows). Requires Python 3.10+ and Node.js 18+.
cd /d "%~dp0"

where python >nul 2>nul || (echo Python is not installed. Get it from https://www.python.org/downloads/ & pause & exit /b 1)
where npm >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org/ & pause & exit /b 1)

if not exist backend\venv (
  echo [1/3] Setting up Python backend...
  python -m venv backend\venv || (pause & exit /b 1)
  backend\venv\Scripts\python -m pip install -q -r backend\requirements.txt || (pause & exit /b 1)
)
if not exist backend\.env copy backend\.env.example backend\.env >nul

if not exist node_modules (
  echo [2/3] Installing frontend packages (first run only, takes a minute)...
  call npm install || (pause & exit /b 1)
)

echo [3/3] Starting TalentForge...
start "TalentForge API" cmd /k "cd /d %~dp0backend && venv\Scripts\python -m uvicorn main:app --port 8000"
start "TalentForge Web" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 6 >nul
start http://localhost:3000
echo.
echo TalentForge is running at http://localhost:3000
echo Demo login password for all accounts: demo1234  (e.g. aarav@talentforge.dev)
echo Close the two server windows to stop the app.
