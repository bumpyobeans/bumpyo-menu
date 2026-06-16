@echo off
echo 메뉴 편집기를 시작합니다...
start /min cmd /c "node %~dp0server.js"
timeout /t 2 /nobreak >nul
start http://localhost:3001
