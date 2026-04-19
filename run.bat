@echo off
cd /d "%~dp0"

echo Signal Lab - Docker Compose
echo.

where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found in PATH. Install Docker Desktop and restart the PC if needed.
  pause
  exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] "docker compose" is not available. Update Docker Desktop.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    echo Creating .env from .env.example ...
    copy /Y ".env.example" ".env" >nul
    echo OK.
  ) else (
    echo [ERROR] .env.example not found in this folder.
    pause
    exit /b 1
  )
)

echo.
echo Building and starting containers...
echo Waiting until Postgres is healthy and API responds on /api/health ...
docker compose up -d --build --wait
if errorlevel 1 (
  echo.
  echo [ERROR] docker compose failed. See messages above.
  pause
  exit /b 1
)

echo.
echo Done.
echo   UI:       http://localhost:3000
echo   API:      http://localhost:3001/api/health
echo   Grafana:  http://localhost:3010
echo.
echo Stop stack: docker compose down
echo.
pause
