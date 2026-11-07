@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ========================================================
echo [FIC Business Hub Mobile] Starting Android Build & Run
echo Java Location: %JAVA_HOME%
echo ========================================================

cd /d "%~dp0"
call npx react-native run-android
pause

