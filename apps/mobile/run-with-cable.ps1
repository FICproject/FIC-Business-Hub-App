$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;" + $env:Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       FIC BUSINESS HUB - CABLE USB RUNNER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Java Home:    $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host "Android Home: $env:ANDROID_HOME" -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking connected USB devices..." -ForegroundColor Green
adb devices
Write-Host ""
Write-Host "If your phone shows 'unauthorized', unlock your phone and tap 'Allow'." -ForegroundColor Yellow
Write-Host ""

Set-Location "$PSScriptRoot"
npx react-native run-android

