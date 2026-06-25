@echo off
chcp 65001 >nul
echo Installing post-commit auto-refresh hooks into hub + 5 site clones...
node "%~dp0install-refresh-hooks.mjs"
if errorlevel 1 (
  echo.
  echo [!] Failed. Check Node.js is installed.
)
echo.
echo Done. From now on, every commit refreshes the Grafana data link.
pause
