@echo off
chcp 65001 >nul
echo Stopping the dashboard...
docker compose -f "%~dp0docker-compose.yml" down
echo.
echo Stopped. To start again, run start-dashboard.bat
pause
