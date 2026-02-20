# Claude Code GLM-4.7 Setup Script for Windows PowerShell
# This script configures Claude Code to use GLM-4.7 API

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Claude Code GLM-4.7 Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# API Key
$API_KEY = "glm-----api---------------df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH"

# Configuration
$BASE_URL = "https://api.z.ai/api/anthropic"
$TIMEOUT = "3000000"

Write-Host "Setting up environment variables..." -ForegroundColor Yellow

# Set environment variables for current session
$env:ANTHROPIC_AUTH_TOKEN = $API_KEY
$env:ANTHROPIC_BASE_URL = $BASE_URL
$env:API_TIMEOUT_MS = $TIMEOUT

Write-Host "✓ Environment variables set for current session" -ForegroundColor Green
Write-Host ""
Write-Host "Environment Variables:" -ForegroundColor Yellow
Write-Host "  ANTHROPIC_AUTH_TOKEN = $API_KEY" -ForegroundColor Gray
Write-Host "  ANTHROPIC_BASE_URL = $BASE_URL" -ForegroundColor Gray
Write-Host "  API_TIMEOUT_MS = $TIMEOUT" -ForegroundColor Gray
Write-Host ""

# Create/update Claude Code settings file
$settingsPath = "$env:USERPROFILE\.claude\settings.json"
$settingsDir = Split-Path -Parent $settingsPath

Write-Host "Configuring Claude Code settings file..." -ForegroundColor Yellow

# Create directory if it doesn't exist
if (!(Test-Path -Path $settingsDir)) {
    New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null
    Write-Host "✓ Created .claude directory" -ForegroundColor Green
}

# Create settings JSON
$settings = @{
    env = @{
        ANTHROPIC_AUTH_TOKEN = $API_KEY
        ANTHROPIC_BASE_URL = $BASE_URL
        API_TIMEOUT_MS = $TIMEOUT
    }
}

# Save settings file
$settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding utf8

Write-Host "✓ Settings file created: $settingsPath" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open a NEW terminal window (required for changes to take effect)" -ForegroundColor White
Write-Host "2. Navigate to your project directory" -ForegroundColor White
Write-Host "3. Run: claude" -ForegroundColor White
Write-Host "4. When prompted, select 'Yes' to use the API key" -ForegroundColor White
Write-Host ""
Write-Host "To verify the setup, run:" -ForegroundColor Yellow
Write-Host "  claude" -ForegroundColor Cyan
Write-Host "  /status" -ForegroundColor Cyan
Write-Host ""
Write-Host "To set environment variables permanently (system-wide):" -ForegroundColor Yellow
Write-Host "  setx ANTHROPIC_AUTH_TOKEN `"$API_KEY`"" -ForegroundColor Gray
Write-Host "  setx ANTHROPIC_BASE_URL `"$BASE_URL`"" -ForegroundColor Gray
Write-Host "  setx API_TIMEOUT_MS `"$TIMEOUT`"" -ForegroundColor Gray
Write-Host ""
