@echo off
chcp 65001 >nul
node "%~dp0build-status.mjs"
if errorlevel 1 ( echo Could not build data. Check Node.js and gh ^(gh auth status^). & pause & exit /b 1 )
node "%~dp0build-html.mjs"
if errorlevel 1 ( echo Could not build HTML. & pause & exit /b 1 )
start "" "%~dp0dashboard.html"
