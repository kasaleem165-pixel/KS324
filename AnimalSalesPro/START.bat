@echo off
title Animal Sales Pro - Starting...
color 0A

echo.
echo  ==========================================
echo   Animal Sales Pro - Starting App...
echo  ==========================================
echo.

:: Move to the folder where this bat file lives
cd /d "%~dp0"

:: Detect Python
set PYTHON_CMD=
py --version >nul 2>&1
if not errorlevel 1 (
    set PYTHON_CMD=py
) else (
    python --version >nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=python
    )
)

if "%PYTHON_CMD%"=="" (
    color 0C
    echo  ERROR: Python not found.
    echo  Download from: https://www.python.org/downloads/
    echo  During install - TICK "Add Python to PATH"
    echo.
    pause
    exit
)

echo  Python found. Installing Flask if needed...
%PYTHON_CMD% -m pip install flask --quiet --disable-pip-version-check

echo  Starting app...
echo.
echo  Opening browser at: http://localhost:5000
echo  To stop: close this window or press Ctrl+C
echo.

start "" http://localhost:5000
%PYTHON_CMD% run.py

pause
