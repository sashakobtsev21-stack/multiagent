@echo off
chcp 65001 >nul
rem Тихая пересборка дашборда (без открытия браузера). Для Планировщика Windows.
node "%~dp0build-status.mjs"
node "%~dp0build-html.mjs"
