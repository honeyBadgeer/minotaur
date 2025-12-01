@echo off
setlocal enabledelayedexpansion

where node >nul 2>nul
if errorlevel 1 (
  echo Нужен Node.js в PATH
  exit /b 1
)

set SCRIPT=%~dp0spine_convert.mjs
if not exist "%SCRIPT%" (
  echo Не найден %SCRIPT%
  exit /b 1
)

for /r "%~dp0" %%F in (*.json) do (
  echo JSON: %%~fF
  node "%SCRIPT%" "%%~fF"
  if errorlevel 1 echo Ошибка: %%~fF
)

for /r "%~dp0" %%F in (*.atlas) do (
  echo ATLAS: %%~fF
  node "%SCRIPT%" "%%~fF"
  if errorlevel 1 echo Ошибка: %%~fF
)

echo Готово
exit /b 0
