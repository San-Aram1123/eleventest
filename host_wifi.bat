@echo off
title Kurdish TTS Studio - Wi-Fi Server (Standalone)
cd /d "%~dp0"
cls
echo ====================================================================
echo   KURDISH TTS DATASET STUDIO - STANDALONE WI-FI HOST
echo ====================================================================
echo.
echo   [*] Access URLs:
echo       Local (This PC) : http://localhost:5000
echo       Wi-Fi (Phone/LAN): http://10.10.0.179:5000
echo.
echo   [*] Independent Process:
echo       This window runs completely separately from VS Code / IDE.
echo       You can switch projects or close your IDE anytime.
echo       To stop hosting, simply close this window or press Ctrl+C.
echo.
echo ====================================================================
echo.
node --watch-path=server server/index.js
echo.
echo Server has stopped.
pause
