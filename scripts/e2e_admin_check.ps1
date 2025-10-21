# E2E test: login as default admin and call protected stores endpoint
# Usage: Run from project folder in PowerShell: .\scripts\e2e_admin_check.ps1

$base = 'http://localhost:5000/api'
$loginUrl = "$base/auth/login"
$storesUrl = "$base/stores"

$creds = @{ email = 'admin@roxiler.com'; password = 'Admin@123' }

Write-Host "Logging in as admin..."
try {
    $r = Invoke-RestMethod -Uri $loginUrl -Method Post -ContentType 'application/json' -Body (ConvertTo-Json $creds)
    Write-Host "Login status: Success"
    $token = $r.token
    if (-not $token) { Write-Host "No token returned" -ForegroundColor Red; exit 1 }
} catch {
    Write-Host "Login failed:" $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "Calling $storesUrl with token..."
try {
    $headers = @{ Authorization = "Bearer $token" }
    $resp = Invoke-RestMethod -Uri $storesUrl -Method Get -Headers $headers
    Write-Host "Stores response:" (ConvertTo-Json $resp -Depth 2)
} catch {
    Write-Host "Request failed:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $text = $_.Exception.Response.GetResponseStream() | % { new-object System.IO.StreamReader($_) } | % { $_.ReadToEnd() }
        Write-Host $text
    }
}
