@echo off
REM Usage: start-watcher.bat "C:\path\to\dir" http://localhost:8000
if "%~1"=="" (
  echo Please provide directory path as first argument
  echo Example: start-watcher.bat "C:\Projects\mydir" http://localhost:8000
  goto :eof
)
if "%~2"=="" (
  echo Please provide server URL as second argument (e.g. http://localhost:8000)
  goto :eof
)
node "%~dp0sync-watcher.js" "%~1" %2
pause
