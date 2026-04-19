@echo off
cd /d "%~dp0"

echo Signal Lab - stop Docker Compose stack
echo.

where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found in PATH.
  pause
  exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] "docker compose" is not available.
  pause
  exit /b 1
)

if not exist "docker-compose.yml" (
  echo [ERROR] docker-compose.yml not found. Run this file from the project root.
  pause
  exit /b 1
)

echo Stopping containers and removing volumes ^(docker compose down -v^)...
docker compose down -v
if errorlevel 1 (
  echo.
  echo [ERROR] docker compose down failed.
  pause
  exit /b 1
)

echo.
echo Done. Containers stopped; named volumes ^(e.g. PostgreSQL data^) removed.
echo To keep volumes next time: docker compose down
echo.
pause
