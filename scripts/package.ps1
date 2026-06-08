Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repoRoot "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version

& (Join-Path $PSScriptRoot "generate-icons.ps1")

Get-ChildItem (Join-Path $repoRoot "_locales") -Recurse -Filter "messages.json" | ForEach-Object {
  Get-Content $_.FullName -Raw | ConvertFrom-Json | Out-Null
}

$distDir = Join-Path $repoRoot "dist"
$resolvedRepo = [System.IO.Path]::GetFullPath($repoRoot)
$resolvedDist = [System.IO.Path]::GetFullPath($distDir)
if (-not $resolvedDist.StartsWith($resolvedRepo, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to package outside the repository: $resolvedDist"
}

if (Test-Path $distDir) {
  Remove-Item -LiteralPath $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $distDir | Out-Null

$zipPath = Join-Path $distDir "vivaldi-drag-search-$version.zip"
$packagePaths = @(
  (Join-Path $repoRoot "_locales"),
  (Join-Path $repoRoot "icons"),
  (Join-Path $repoRoot "options"),
  (Join-Path $repoRoot "src"),
  $manifestPath
)

Compress-Archive -Path $packagePaths -DestinationPath $zipPath -Force
Write-Output "Created $zipPath"
