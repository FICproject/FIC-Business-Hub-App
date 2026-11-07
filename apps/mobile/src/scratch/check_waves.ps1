Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('apps/mobile/src/assets/images/bottom_waves.png')
Write-Output ("Size: {0}x{1}, PixelFormat: {2}" -f $img.Width, $img.Height, $img.PixelFormat)
# Check top row
$c = $img.GetPixel(10, 0)
Write-Output ("Top pixel alpha: {0}, R: {1}, G: {2}, B: {3}" -f $c.A, $c.R, $c.G, $c.B)
$img.Dispose()

