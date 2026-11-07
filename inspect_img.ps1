Add-Type -AssemblyName System.Drawing

$p = 'C:\Users\balam\.gemini\antigravity\brain\17f108c5-24af-4818-b378-fb00144e1853\test_screen_splash_4200.png'
$bmp = [System.Drawing.Bitmap]::FromFile($p)
$centerX = 540

# Print colors from y=2000 to 2200 at centerX
for ($y = 2050; $y -lt 2180; $y += 5) {
    $c = $bmp.GetPixel($centerX, $y)
    Write-Host "Y=$($y): R=$($c.R), G=$($c.G), B=$($c.B)"
}
$bmp.Dispose()
