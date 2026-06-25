@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo ============================================
echo   Пульт сети путеводителей — запуск
echo ============================================
echo.
echo [1/2] Собираю свежие данные по сайтам...
node "%~dp0build-status.mjs"
if errorlevel 1 (
  echo.
  echo [!] Не удалось собрать данные.
  echo     Проверь: установлен Node.js и GitHub CLI ^(gh^), и ты залогинен ^(gh auth status^).
  pause
  exit /b 1
)
echo.
echo [2/2] Запускаю Grafana ^(в первый раз скачает образы — пара минут^)...
docker compose -f "%~dp0docker-compose.yml" up -d
if errorlevel 1 (
  echo.
  echo [!] Grafana не запустилась.
  echo     Убедись, что Docker Desktop установлен и запущен ^(значок кита вверху, состояние Running^).
  pause
  exit /b 1
)
echo.
echo ============================================
echo   Готово! Пульт открывается в браузере:
echo   http://localhost:3000
echo ============================================
start "" "http://localhost:3000"
echo Если браузер не открылся сам — зайди вручную на http://localhost:3000
pause
