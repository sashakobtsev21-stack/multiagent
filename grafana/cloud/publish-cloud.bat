@echo off
chcp 65001 >nul
cd /d "%~dp0..\.."
echo ============================================
echo   Публикация данных для Grafana Cloud
echo ============================================
echo.
echo [1/2] Собираю свежие данные по сайтам...
node "%~dp0..\build-status.mjs"
if errorlevel 1 (
  echo.
  echo [!] Не удалось собрать данные. Проверь Node.js и gh ^(gh auth status^).
  pause
  exit /b 1
)
echo.
echo [2/2] Публикую на закрытую ссылку и готовлю файл дашборда...
node "%~dp0make-cloud.mjs"
if errorlevel 1 (
  echo.
  echo [!] Не удалось опубликовать. Проверь, что выполнен вход: gh auth status
  pause
  exit /b 1
)
echo.
echo ============================================
echo   Готово. Дальше — импорт в Grafana Cloud:
echo   файл  grafana\cloud\network-ops-cloud.json
echo   ^(пошаговая инструкция — в чате^)
echo ============================================
pause
