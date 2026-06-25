@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo ============================================
echo   Network dashboard - start
echo ============================================
echo.
echo [1/2] Building fresh data from your sites...
node "%~dp0build-status.mjs"
if errorlevel 1 (
  echo.
  echo [!] Could not build data. Check Node.js and gh ^(gh auth status^).
  pause
  exit /b 1
)
echo.
echo [2/2] Starting Grafana ^(first run downloads images - a few minutes^)...
docker compose -f "%~dp0docker-compose.yml" up -d
if errorlevel 1 (
  echo.
  echo [!] Grafana did not start. Make sure Docker Desktop is installed and running.
  pause
  exit /b 1
)
echo.
echo ============================================
echo   Done. Dashboard opens in your browser:
echo   http://localhost:3000
echo ============================================
start "" "http://localhost:3000"
echo If the browser did not open, go to http://localhost:3000 manually.
pause
