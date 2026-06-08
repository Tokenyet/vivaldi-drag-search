Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$iconDir = Join-Path $repoRoot "icons"
New-Item -ItemType Directory -Force -Path $iconDir | Out-Null

function New-RoundedRectanglePath {
  param(
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Radius
  )

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

foreach ($size in @(16, 32, 48, 128)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 31, 111, 120))
  $barBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 231, 251, 252))
  $textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $path = New-RoundedRectanglePath 0 0 $size $size ([Math]::Max(2, $size / 8))
  $graphics.FillPath($background, $path)

  $barHeight = [Math]::Max(2, [Math]::Round($size * 0.18))
  $graphics.FillRectangle($barBrush, 0, 0, $size, $barHeight)

  $fontSize = [Math]::Max(8, $size * 0.58)
  $font = [System.Drawing.Font]::new("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = [System.Drawing.RectangleF]::new(0, [Math]::Round($size * 0.08), $size, [Math]::Round($size * 0.92))
  $graphics.DrawString("V", $font, $textBrush, $rect, $format)

  $output = Join-Path $iconDir "icon$size.png"
  $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

  $format.Dispose()
  $font.Dispose()
  $path.Dispose()
  $textBrush.Dispose()
  $barBrush.Dispose()
  $background.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Output "Generated icons in $iconDir"
