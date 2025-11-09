# Quick setup script for Developer Mode (PowerShell)
# Usage: .\scripts\setup-dev-mode.ps1

Write-Host "🔧 Setting up Developer Mode for TokenGuard..." -ForegroundColor Yellow
Write-Host ""

# Check if .env.local exists
if (Test-Path .env.local) {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to append dev mode settings? (y/n)"
    if ($response -ne "y") {
        Write-Host "❌ Setup cancelled" -ForegroundColor Red
        exit 1
    }
    Add-Content -Path .env.local -Value "`n# Developer Mode (added by setup script)"
} else {
    Set-Content -Path .env.local -Value "# Developer Mode Configuration"
}

# Add dev mode settings
$devSettings = @"
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_DEV_DEFAULT_PLAN=PREMIUM
NEXT_PUBLIC_DEV_BYPASS_RATE_LIMIT=true
"@

Add-Content -Path .env.local -Value $devSettings

Write-Host "✅ Developer Mode enabled in .env.local" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Current settings:"
Write-Host "   - Dev Mode: ENABLED"
Write-Host "   - Default Plan: PREMIUM"
Write-Host "   - Rate Limit Bypass: ENABLED"
Write-Host ""
Write-Host "🎯 Next steps:"
Write-Host "   1. Restart your dev server: npm run dev"
Write-Host "   2. Look for the yellow dev panel in bottom-right"
Write-Host "   3. Test the API: node scripts/test-api.js"
Write-Host ""
Write-Host "📖 For more info, see DEV_MODE.md"
Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
