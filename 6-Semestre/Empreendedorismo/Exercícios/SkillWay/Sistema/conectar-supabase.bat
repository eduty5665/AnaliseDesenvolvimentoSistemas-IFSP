@echo off
chcp 65001 >nul
title SkillWay - conectar ao Supabase
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   O Node.js nao foi encontrado neste computador.
  echo   Instale a versao LTS em https://nodejs.org e abra este arquivo de novo.
  echo.
  pause
  exit /b 1
)
node servidor\configurar.js
echo.
pause
