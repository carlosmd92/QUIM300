# Compila los resúmenes en PDF (LaTeX) de la carpeta pdf/.
# Uso (PowerShell):   .\herramientas\compilar_pdfs.ps1
# Requiere MiKTeX con pdflatex. Cada .tex usa la plantilla pdf\resumen.sty y se compila dos veces
# para resolver el número total de páginas del pie.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$pdf = Join-Path $root 'pdf'
$bin = @(
  "$env:LOCALAPPDATA\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe",
  'C:\Program Files\MiKTeX\miktex\bin\x64\pdflatex.exe'
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $bin) { $g = Get-Command pdflatex -ErrorAction SilentlyContinue; if ($g) { $bin = $g.Source } }
if (-not $bin) { throw 'No se encontró pdflatex.' }

Push-Location $pdf
try {
  foreach ($t in Get-ChildItem -Filter '*.tex') {
    1..2 | ForEach-Object { & $bin -interaction=nonstopmode -halt-on-error $t.Name | Out-Null }
    $out = [IO.Path]::ChangeExtension($t.Name, 'pdf')
    if (Test-Path $out) { '{0}: {1:N0} KB' -f $out, ((Get-Item $out).Length / 1KB) } else { Write-Warning "Falló $($t.Name)" }
    foreach ($e in 'aux', 'log', 'out') { Remove-Item ([IO.Path]::ChangeExtension($t.Name, $e)) -ErrorAction SilentlyContinue }
  }
} finally { Pop-Location }
