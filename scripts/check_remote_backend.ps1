# Check remote backend health, login, and protected /stores endpoint
$base = 'https://roxiler-store-rating-raiq.onrender.com/api'

Write-Host "Checking $base/health..."
try {
    $h = Invoke-RestMethod -Uri "$base/health" -UseBasicParsing -Method Get -TimeoutSec 15
    Write-Host "HEALTH RESPONSE:" -ForegroundColor Green
    $h | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "Health check failed:" $_.Exception.Message -ForegroundColor Red
}

Write-Host "\nAttempting login as seeded admin..."
$creds = @{ email = 'admin@roxiler.com'; password = 'Admin@123' }
try {
    $login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType 'application/json' -Body (ConvertTo-Json $creds) -TimeoutSec 15
    Write-Host "LOGIN RESPONSE:" -ForegroundColor Green
    $login | ConvertTo-Json -Depth 4 | Write-Host
    $token = $login.token
    if (-not $token) { Write-Host "No token returned" -ForegroundColor Red; exit 2 }
} catch {
    Write-Host "Login failed:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        try { $text = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd(); Write-Host $text } catch {}
    }
    exit 3
}

Write-Host "\nCalling protected endpoint /stores with token..."
try {
    $headers = @{ Authorization = "Bearer $token" }
    $stores = Invoke-RestMethod -Uri "$base/stores" -Method Get -Headers $headers -UseBasicParsing -TimeoutSec 15
    Write-Host "STORES RESPONSE:" -ForegroundColor Green
    $stores | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "Protected request failed:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        try { $text = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd(); Write-Host $text } catch {}
    }
    exit 4
}

Write-Host "\nRemote backend checks completed successfully." -ForegroundColor Cyan
