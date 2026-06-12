Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $repoRoot "store-assets"
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

function New-RoundedRectanglePath {
  param(
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Radius
  )

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  if ($Radius -le 0) {
    $path.AddRectangle([System.Drawing.RectangleF]::new($X, $Y, $Width, $Height))
    return $path
  }

  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Text {
  param(
    [System.Drawing.Graphics] $Graphics,
    [string] $Text,
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Size,
    [System.Drawing.Color] $Color,
    [System.Drawing.FontStyle] $Style = [System.Drawing.FontStyle]::Regular
  )

  $font = [System.Drawing.Font]::new("Segoe UI", $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.SolidBrush]::new($Color)
  $format = [System.Drawing.StringFormat]::new()
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  $Graphics.DrawString($Text, $font, $brush, [System.Drawing.RectangleF]::new($X, $Y, $Width, $Height), $format)
  $format.Dispose()
  $brush.Dispose()
  $font.Dispose()
}

function Draw-Icon {
  param(
    [System.Drawing.Graphics] $Graphics,
    [float] $X,
    [float] $Y,
    [float] $Size
  )

  $path = New-RoundedRectanglePath $X $Y $Size $Size ([Math]::Max(4, $Size / 8))
  $background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 31, 111, 120))
  $bar = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 231, 251, 252))
  $text = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $Graphics.FillPath($background, $path)
  $Graphics.FillRectangle($bar, $X, $Y, $Size, [Math]::Max(4, $Size * 0.18))

  $font = [System.Drawing.Font]::new("Segoe UI", [Math]::Max(16, $Size * 0.58), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $Graphics.DrawString("V", $font, $text, [System.Drawing.RectangleF]::new($X, $Y + ($Size * 0.08), $Size, $Size * 0.92), $format)

  $format.Dispose()
  $font.Dispose()
  $text.Dispose()
  $bar.Dispose()
  $background.Dispose()
  $path.Dispose()
}

function Draw-Action {
  param(
    [System.Drawing.Graphics] $Graphics,
    [string] $Text,
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $FontSize
  )

  $path = New-RoundedRectanglePath $X $Y $Width $Height 6
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
  $border = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 157, 190, 196), 1)
  $Graphics.FillPath($brush, $path)
  $Graphics.DrawPath($border, $path)
  Draw-Text $Graphics $Text ($X + 8) ($Y + (($Height - $FontSize - 4) / 2)) ($Width - 16) ($FontSize + 8) $FontSize ([System.Drawing.Color]::FromArgb(255, 31, 111, 120)) ([System.Drawing.FontStyle]::Bold)

  $border.Dispose()
  $brush.Dispose()
  $path.Dispose()
}

function Draw-Promo {
  $bitmap = [System.Drawing.Bitmap]::new(440, 280)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 247, 250, 250))

  Draw-Icon $graphics 28 36 82
  Draw-Text $graphics "Vivaldi Drag Search" 128 40 292 40 25 ([System.Drawing.Color]::FromArgb(255, 21, 34, 36)) ([System.Drawing.FontStyle]::Bold)
  Draw-Text $graphics "Choose this tab, new tab, or hold Cancel." 130 86 260 54 18 ([System.Drawing.Color]::FromArgb(255, 77, 89, 92))

  $drop = New-RoundedRectanglePath 28 162 384 74 10
  $dropBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 231, 251, 252))
  $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 31, 111, 120), 2)
  $graphics.FillPath($dropBrush, $drop)
  $graphics.DrawPath($borderPen, $drop)
  Draw-Text $graphics "Choose where to open" 62 174 320 28 20 ([System.Drawing.Color]::FromArgb(255, 31, 111, 120)) ([System.Drawing.FontStyle]::Bold)
  Draw-Action $graphics "This tab" 62 204 96 24 13
  Draw-Action $graphics "New tab" 172 204 96 24 13
  Draw-Action $graphics "Hold Cancel" 282 204 96 24 13

  $output = Join-Path $assetDir "promo-small-440x280.png"
  $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

  $borderPen.Dispose()
  $dropBrush.Dispose()
  $drop.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

function Draw-Screenshot {
  $bitmap = [System.Drawing.Bitmap]::new(1280, 800)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 244, 247, 247))

  $page = New-RoundedRectanglePath 72 86 1136 628 14
  $pageBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $pageBorder = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 214, 222, 224), 2)
  $graphics.FillPath($pageBrush, $page)
  $graphics.DrawPath($pageBorder, $page)

  Draw-Text $graphics "Example web page" 124 156 360 42 30 ([System.Drawing.Color]::FromArgb(255, 28, 40, 42)) ([System.Drawing.FontStyle]::Bold)
  Draw-Text $graphics "Select text, drag it toward the edge, and drop when the target appears." 124 210 590 72 24 ([System.Drawing.Color]::FromArgb(255, 92, 104, 107))

  $selection = New-RoundedRectanglePath 124 334 438 54 8
  $selectionBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 214, 239, 242))
  $graphics.FillPath($selectionBrush, $selection)
  Draw-Text $graphics "vivaldi auto hide search" 146 345 392 34 24 ([System.Drawing.Color]::FromArgb(255, 31, 111, 120)) ([System.Drawing.FontStyle]::Bold)

  $drop = New-RoundedRectanglePath 96 0 1088 142 0
  $dropBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 231, 251, 252))
  $dropBorder = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 31, 111, 120), 2)
  $graphics.FillPath($dropBrush, $drop)
  $graphics.DrawPath($dropBorder, $drop)
  Draw-Icon $graphics 244 30 56
  Draw-Text $graphics "Choose where to open" 320 24 340 34 26 ([System.Drawing.Color]::FromArgb(255, 31, 111, 120)) ([System.Drawing.FontStyle]::Bold)
  Draw-Text $graphics "Works when the browser toolbar is hidden." 322 60 420 30 18 ([System.Drawing.Color]::FromArgb(255, 72, 92, 96))
  Draw-Action $graphics "This tab" 766 40 126 52 18
  Draw-Action $graphics "New tab" 906 40 126 52 18
  Draw-Action $graphics "Hold Cancel" 1040 40 140 52 18

  $output = Join-Path $assetDir "screenshot-en-1280x800.png"
  $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

  $dropBorder.Dispose()
  $dropBrush.Dispose()
  $drop.Dispose()
  $selectionBrush.Dispose()
  $selection.Dispose()
  $pageBorder.Dispose()
  $pageBrush.Dispose()
  $page.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Draw-Promo
Draw-Screenshot
Write-Output "Generated store assets in $assetDir"
