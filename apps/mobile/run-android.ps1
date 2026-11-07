$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "[FIC Business Hub Mobile] Starting Android Build & Run" -ForegroundColor Cyan
Write-Host "Java Location: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot"
npx react-native run-android

