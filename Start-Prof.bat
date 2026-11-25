@echo off
rem Launches the "prof" Teacher's App.
rem With Python installed it runs a local server (enables offline mode and app install);
rem otherwise it opens index.html directly in the default browser.
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8080/index.html"
  echo prof is running at http://localhost:8080  -  close this window to stop it.
  python -m http.server 8080
) else (
  start "" "%~dp0index.html"
)
