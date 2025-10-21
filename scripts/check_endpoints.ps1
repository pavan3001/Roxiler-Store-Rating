# Quick PowerShell health check for the backend
# Usage: Open PowerShell in project folder and run: .\scripts\check_endpoints.ps1

$base = $env:VITE_API_BASE_URL
if (-not $base) { $base = 'http://localhost:5000/api' }
$urls = @(
    "$base/health",
    "$base/stores"
)

foreach ($u in $urls) {
    Write-Host "Checking $u"
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method GET -TimeoutSec 10
        Write-Host "Status:" $r.StatusCode
        $body = $r.Content
        if ($body.Length -gt 0) { Write-Host $body.Substring(0, [Math]::Min(400, $body.Length)) }
    } catch {
        Write-Host "Request failed:" $_.Exception.Message -ForegroundColor Red
    }
    Write-Host "---"
}
