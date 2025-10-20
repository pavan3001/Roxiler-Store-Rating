# Test login and fetch stores (PowerShell)
# Usage: Open PowerShell in project folder and run: .\scripts\test-login.ps1

$base = 'https://roxiler-store-rating-raiq.onrender.com'
$creds = @{ email = 'admin@roxiler.com'; password = 'Admin@123' } | ConvertTo-Json

try {
    Write-Host "Logging in..."
    $login = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Body $creds -ContentType 'application/json'
    if (-not $login.token) { throw "No token in response: $($login | Out-String)" }
    Write-Host "Login OK. Token length:" ($login.token.Length)

    $token = $login.token
    Write-Host "Calling protected /api/stores..."
    $stores = Invoke-RestMethod -Uri "$base/api/stores" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Stores returned:" ($stores.Count)
    $stores | Format-Table id, name, address, overall_rating, total_ratings -AutoSize
}
catch {
    Write-Error "Error: $_"
}
