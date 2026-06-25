@echo off
chcp 65001 >nul
echo Останавливаю пульт...
docker compose -f "%~dp0docker-compose.yml" down
echo.
echo Пульт остановлен. Чтобы снова включить — запусти start-dashboard.bat
pause
