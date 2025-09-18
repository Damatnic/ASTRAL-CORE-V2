# ASTRAL CORE V2 - Simple Environment Setup Script
# This script will set the most essential environment variables

Write-Host "ASTRAL CORE V2 - Setting Essential Environment Variables" -ForegroundColor Green

# Function to generate secure random strings
function New-SecureKey {
    param([int]$Length = 32)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    $key = ''
    1..$Length | ForEach-Object { $key += $chars[(Get-Random -Maximum $chars.Length)] }
    return $key
}

# Generate the secrets we already have
$nextAuthSecret = "KqStw6FyppSWAylj9btaBfde3ZL3qd0k"
$jwtSecret = "UJElGNGMZBQNV2BJ9TGh92Yvi9nYFgpC"
$encryptionKey = "e98c6bddf9136a8c2d5e8b7a4f1c3e2d"
$websocketSecret = "V9T1jNTjxHuHjRKrCd313KHh8SN675DB"
$webhookSecret = "c9Lkdu8tKIHbCvvJKTAxjv3yJpyyvLDN"
$redisPassword = "Oga5V5eEplUD5LQN"

Write-Host "Using generated secrets from previous run..." -ForegroundColor Yellow

Write-Host "`nTo set environment variables, run these commands one by one:" -ForegroundColor Cyan
Write-Host "Copy and paste each command when prompted:" -ForegroundColor Yellow

Write-Host "`n# Core Settings" -ForegroundColor Green
Write-Host "vercel env add NODE_ENV"
Write-Host "# Enter: production"
Write-Host ""
Write-Host "vercel env add NEXT_PUBLIC_APP_NAME"
Write-Host "# Enter: ASTRAL CORE V2"
Write-Host ""
Write-Host "vercel env add NEXTAUTH_URL"
Write-Host "# Enter: https://astral-core-v2.vercel.app"
Write-Host ""
Write-Host "vercel env add NEXTAUTH_SECRET"
Write-Host "# Enter: $nextAuthSecret"
Write-Host ""
Write-Host "vercel env add JWT_SECRET"
Write-Host "# Enter: $jwtSecret"
Write-Host ""
Write-Host "vercel env add ENCRYPTION_KEY"
Write-Host "# Enter: $encryptionKey"
Write-Host ""
Write-Host "vercel env add DATABASE_URL"
Write-Host "# Enter: postgresql://user:pass@localhost:5432/astral_core"

Write-Host "`n# Feature Flags" -ForegroundColor Green
Write-Host "vercel env add NEXT_PUBLIC_ENABLE_CRISIS_MODE"
Write-Host "# Enter: true"
Write-Host ""
Write-Host "vercel env add NEXT_PUBLIC_ENABLE_VOLUNTEERS"
Write-Host "# Enter: true"
Write-Host ""
Write-Host "vercel env add NEXT_PUBLIC_ENABLE_AI_SAFETY"
Write-Host "# Enter: true"
Write-Host ""
Write-Host "vercel env add NEXT_PUBLIC_ENABLE_EMERGENCY"
Write-Host "# Enter: true"

Write-Host "`n# Crisis Management" -ForegroundColor Green
Write-Host "vercel env add CRISIS_HOTLINE_NUMBER"
Write-Host "# Enter: 988"
Write-Host ""
Write-Host "vercel env add EMERGENCY_CONTACT_EMAIL"
Write-Host "# Enter: emergency@astralcore.com"

Write-Host "`n# Additional Secrets" -ForegroundColor Green
Write-Host "vercel env add WEBSOCKET_SECRET"
Write-Host "# Enter: $websocketSecret"
Write-Host ""
Write-Host "vercel env add WEBHOOK_SECRET"
Write-Host "# Enter: $webhookSecret"
Write-Host ""
Write-Host "vercel env add REDIS_PASSWORD"
Write-Host "# Enter: $redisPassword"

Write-Host "`n# API Configuration" -ForegroundColor Green
Write-Host "vercel env add API_RATE_LIMIT"
Write-Host "# Enter: 1000"
Write-Host ""
Write-Host "vercel env add API_TIMEOUT"
Write-Host "# Enter: 30000"
Write-Host ""
Write-Host "vercel env add MAX_FILE_SIZE"
Write-Host "# Enter: 10485760"

Write-Host "`n# Security Settings" -ForegroundColor Green
Write-Host "vercel env add CORS_ORIGIN"
Write-Host "# Enter: https://astral-core-v2.vercel.app"
Write-Host ""
Write-Host "vercel env add RATE_LIMIT_WINDOW"
Write-Host "# Enter: 15"
Write-Host ""
Write-Host "vercel env add RATE_LIMIT_MAX"
Write-Host "# Enter: 100"

Write-Host "`nAfter setting all variables, deploy with:" -ForegroundColor Cyan
Write-Host "vercel --prod --yes" -ForegroundColor Yellow

Write-Host "`nGenerated Secrets Reference:" -ForegroundColor Yellow
Write-Host "NEXTAUTH_SECRET: $nextAuthSecret"
Write-Host "JWT_SECRET: $jwtSecret"
Write-Host "ENCRYPTION_KEY: $encryptionKey"
Write-Host "WEBSOCKET_SECRET: $websocketSecret"
Write-Host "WEBHOOK_SECRET: $webhookSecret"
Write-Host "REDIS_PASSWORD: $redisPassword"