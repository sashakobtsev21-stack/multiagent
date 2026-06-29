@echo off
chcp 65001 >nul
rem Тихая пересборка дашборда (без открытия браузера). Для Планировщика Windows.
rem build-gsc-ga: GSC+GA4 данные (троттлинг 30 мин внутри — API не дёргается каждый прогон).
node "%~dp0build-gsc-ga.mjs"
node "%~dp0build-status.mjs"
node "%~dp0build-html.mjs"
