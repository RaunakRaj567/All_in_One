Write-Host "===================================================" -ForegroundColor Green
Write-Host "  CROP SUGGESTER // Organic Soil Telemetry App" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""
Set-Location -Path $PSScriptRoot
Write-Host "Starting Flask Server on http://127.0.0.1:5000 ..." -ForegroundColor Yellow
Write-Host ""
python app.py
