@echo off
title Animal Sales Records - Starting...
color 0A

echo.
echo  ==========================================
echo   Animal Sales Records - Starting App...
echo  ==========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  ERROR: Python is not installed on this computer.
    echo.
    echo  Please follow these steps:
    echo  1. Open your browser
    echo  2. Go to: https://www.python.org/downloads/
    echo  3. Click "Download Python" (big yellow button)
    echo  4. Run the installer - TICK the box "Add Python to PATH"
    echo  5. After install, double-click START.bat again
    echo.
    pause
    exit
)

echo  [1/3] Python found. Installing required packages...
pip install flask --quiet --disable-pip-version-check

echo  [2/3] Starting the Animal Sales app...
echo.
echo  The app will open in your browser automatically.
echo  If it does not open, go to: http://localhost:5000
echo.
echo  To STOP the app: close this window (or press Ctrl+C)
echo.
echo  ==========================================
echo.

:: Open browser after 2 seconds
start "" timeout /t 2 >nul
start "" http://localhost:5000

:: Run the app
python run.py

pause
