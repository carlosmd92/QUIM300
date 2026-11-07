# Genera el PDF de cada resumen a partir de su página HTML.
# Uso (PowerShell, desde cualquier carpeta):   .\herramientas\generar_pdfs.ps1
# Requiere Microsoft Edge e internet (MathJax se descarga de un CDN al renderizar).
# El PDF es vectorial: usa la hoja de estilos de impresión de css/base.css
# (todas las secciones, sin autoevaluación ni controles, con encabezado y pie institucional).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$edge = @(
  'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'No se encontró Microsoft Edge.' }

$paginas = @('kinetica_velocidades', 'kinetica_integradas', 'superficies')
New-Item -ItemType Directory -Force "$root\pdf" | Out-Null

foreach ($p in $paginas) {
  $src = (Resolve-Path "$root\$p.html").Path -replace '\\', '/'
  $out = "$root\pdf\$p.pdf"
  if (Test-Path $out) { Remove-Item $out -Force }
  Start-Process -FilePath $edge -ArgumentList @(
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    '--virtual-time-budget=40000', "--print-to-pdf=$out", "file:///$src"
  ) -Wait -WindowStyle Hidden
  if (Test-Path $out) { '{0}: {1:N0} KB' -f $p, ((Get-Item $out).Length / 1KB) }
  else { Write-Warning "No se generó $p.pdf" }
}
