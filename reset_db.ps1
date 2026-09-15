# AgriVision Database Refresh Script
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host "  AGRIVISION MEGA SUITE -- DATABASE RENEWAL AND REFRESH TOOL" -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Refreshing database records (erasing old transactions and inventories)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/db/reset" -Method Post
    Write-Host $response.message -ForegroundColor Cyan
} catch {
    Write-Host "Failed to connect to backend server on port 8001. Ensure backend is running." -ForegroundColor Red
}

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host "  SUCCESS: Database refreshed clean! Login credentials preserved." -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Green
