# DEPLOYMENT VERIFICATION SCRIPT
# Run after every deployment to ensure no rollback issues

Write-Host "🔍 VERIFYING DEPLOYMENT..." -ForegroundColor Yellow

# Test main site
$response = try { 
    Invoke-WebRequest -Uri "https://dbtech45.com/os" -Method HEAD -TimeoutSec 10
    "✅ dbtech45.com/os: " + $response.StatusCode
} catch { 
    "❌ dbtech45.com/os: " + $_.Exception.Message 
}
Write-Host $response

# Check for redirects to old domains
$badDomains = @("dbtech-os.vercel.app", "dbtech-os-public.vercel.app")
foreach ($domain in $badDomains) {
    try {
        $test = Invoke-WebRequest -Uri "https://$domain" -Method HEAD -TimeoutSec 5
        Write-Host "⚠️  OLD DOMAIN STILL ACTIVE: $domain" -ForegroundColor Red
    } catch {
        Write-Host "✅ OLD DOMAIN OFFLINE: $domain" -ForegroundColor Green
    }
}

# Verify critical routes exist  
$routes = @("/os", "/os/markets", "/os/polymarket", "/os/projects", "/os/model-counsel")
foreach ($route in $routes) {
    $test = try {
        $resp = Invoke-WebRequest -Uri "https://dbtech45.com$route" -Method HEAD -TimeoutSec 10
        "✅ $route"
    } catch {
        "❌ $route MISSING"
    }
    Write-Host $test
}

Write-Host "`n🎯 VERIFICATION COMPLETE" -ForegroundColor Green
Write-Host "If any ❌ appear above, investigate immediately!" -ForegroundColor Yellow