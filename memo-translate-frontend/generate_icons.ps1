Add-Type -AssemblyName System.Drawing
$sizes = @(16, 48, 128)
$dir = "E:\github\koltin\ch1\memo-translate-extension\icons"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir }

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(255, 66, 133, 244)) # Google Blue
    
    # Draw 'M'
    $brush = [System.Drawing.Brushes]::White
    $fontSize = [int]($size * 0.6)
    $font = New-Object System.Drawing.Font "Arial", $fontSize, [System.Drawing.FontStyle]::Bold
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $g.DrawString("M", $font, $brush, ($size/2), ($size * 0.55), $format)
    
    $path = Join-Path $dir "icon$size.png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $path"
}
