@echo off
title DecoTime Color Tracker
cd /d "%~dp0decotime-tracker"

powershell -Command "$c = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue; if (!$c) { Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File server.ps1' -WindowStyle Minimized; Start-Sleep -Seconds 2 }; Start-Process 'http://localhost:8080'"
