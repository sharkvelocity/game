@echo off
echo Starting local server for Phasma-Phoney...

REM Change directory to where this script is located
cd /d %~dp0

REM Launch Python HTTP server on port 8000
python -m http.server 8000

REM Optional: Automatically open browser (uncomment one line below if desired)
start chrome http://localhost:8000
REM start microsoft-edge:http://localhost:8000
REM start http://localhost:8000
