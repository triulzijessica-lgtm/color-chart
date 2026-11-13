@echo off
title DecoTime Color Tracker - Server Wi-Fi Sincronizzazione
cd /d "%~dp0decotime-tracker"
powershell -NoProfile -ExecutionPolicy Bypass -File "server.ps1"
pause
