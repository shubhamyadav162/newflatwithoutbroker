# GLM-4.7 Configuration Script for Claude Code
# This script configures Claude Code to use Z.AI's GLM-4.7 model

$claudeDir = "$env:USERPROFILE\.claude"
$settingsPath = "$claudeDir\settings.json"

# Create .claude directory if it doesn't exist
if (!(Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
    Write-Host "Created .claude directory at: $claudeDir" -ForegroundColor Green
}

# Configuration for GLM-4.7
$settings = @{
    env = @{
        ANTHROPIC_AUTH_TOKEN = "df9009f7b2444b7f8ffff4c85576ca26.8AB5dWYA9Q5MEDbH"
        ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"
        API_TIMEOUT_MS = "3000000"
    }
}

# Convert to JSON and save
$settingsJson = $settings | ConvertTo-Json -Depth 10
$settingsJson | Out-File -FilePath $settingsPath -Encoding UTF8 -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   GLM-4.7 Configuration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Settings file created at: $settingsPath" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration applied:" -ForegroundColor Yellow
Write-Host "  - ANTHROPIC_AUTH_TOKEN: [Your API Key]" -ForegroundColor White
Write-Host "  - ANTHROPIC_BASE_URL: https://api.z.ai/api/anthropic" -ForegroundColor White
Write-Host "  - API_TIMEOUT_MS: 3000000" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Magenta
Write-Host "  1. Close all VS Code windows" -ForegroundColor White
Write-Host "  2. Open a new terminal/PowerShell" -ForegroundColor White
Write-Host "  3. Navigate to your project: cd your-project-directory" -ForegroundColor White
Write-Host "  4. Run: claude" -ForegroundColor White
Write-Host "  5. If prompted 'Do you want to use this API key?' select 'Yes'" -ForegroundColor White
Write-Host ""
Write-Host "Your settings.json content:" -ForegroundColor Cyan
Get-Content $settingsPath
