@echo off
chcp 65001 >nul
cd /d "%~dp0..\.."
echo ============================================
echo   Publish data for Grafana Cloud
echo ============================================
echo.
echo [1/2] Building fresh data from your sites...
node "%~dp0..\build-status.mjs"
if errorlevel 1 (
  echo.
  echo [!] Could not build data. Check Node.js and gh ^(run: gh auth status^).
  pause
  exit /b 1
)
echo.
echo [2/2] Publishing to a private link and preparing the dashboard file...
node "%~dp0make-cloud.mjs"
if errorlevel 1 (
  echo.
  echo [!] Publish failed. Check that you are logged in: gh auth status
  pause
  exit /b 1
)
echo.
echo ============================================
echo   Done. Next: import this file into Grafana Cloud
echo   grafana\cloud\network-ops-cloud.json
echo ============================================
pause
