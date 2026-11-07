@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo ========================================================
echo        FIC BUSINESS HUB - CABLE USB RUNNER
echo ========================================================
echo Java Home:    %JAVA_HOME%
echo Android Home: %ANDROID_HOME%
echo.

echo Checking connected USB devices...
adb devices
echo.
echo If your phone says "unauthorized", check your phone screen and tap "Allow".
echo.

echo --------------------------------------------------------
echo Launching React Native on connected Android device...
echo --------------------------------------------------------
cd /d "%~dp0"
call npx react-native run-android
pause

