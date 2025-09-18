# ASTRAL CORE V2 - Manual Environment Variable Setup
# This script generates secure keys and provides commands to set them manually

# Function to generate secure random strings
function New-SecureKey {
    param([int]$Length = 32)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    $key = ''
    1..$Length | ForEach-Object { $key += $chars[(Get-Random -Maximum $chars.Length)] }
    return $key
}

# Function to generate hex keys
function New-HexKey {
    param([int]$Length = 32)
    $chars = '0123456789abcdef'
    $key = ''
    1..$Length | ForEach-Object { $key += $chars[(Get-Random -Maximum $chars.Length)] }
    return $key
}

Write-Host "ASTRAL CORE V2 - Generating Secure Keys" -ForegroundColor Green

# Generate all secure keys
$nextAuthSecret = New-SecureKey 32
$jwtSecret = New-SecureKey 32
$encryptionKey = New-HexKey 32
$apiSecret = New-SecureKey 32
$csrfSecret = New-SecureKey 32
$websocketSecret = New-SecureKey 32
$webhookSecret = New-SecureKey 32
$redisPassword = New-SecureKey 16

Write-Host "Generated Keys (SAVE THESE!):" -ForegroundColor Yellow
Write-Host "NEXTAUTH_SECRET: $nextAuthSecret"
Write-Host "JWT_SECRET: $jwtSecret"
Write-Host "ENCRYPTION_KEY: $encryptionKey"
Write-Host "API_SECRET_KEY: $apiSecret"
Write-Host "CSRF_SECRET: $csrfSecret"
Write-Host "WEBSOCKET_SECRET: $websocketSecret"
Write-Host "WEBHOOK_SECRET: $webhookSecret"
Write-Host "REDIS_PASSWORD: $redisPassword"

Write-Host "`nNow setting environment variables manually..." -ForegroundColor Cyan

# Set variables one by one with proper error handling
Write-Host "Setting NODE_ENV..."
Start-Process vercel -ArgumentList "env", "add", "NODE_ENV", "production" -Wait -NoNewWindow

Write-Host "Setting NEXT_PUBLIC_APP_NAME..."
Start-Process vercel -ArgumentList "env", "add", "NEXT_PUBLIC_APP_NAME", "ASTRAL CORE V2" -Wait -NoNewWindow

Write-Host "Setting NEXTAUTH_SECRET..."
Start-Process vercel -ArgumentList "env", "add", "NEXTAUTH_SECRET", $nextAuthSecret -Wait -NoNewWindow

Write-Host "Setting JWT_SECRET..."
Start-Process vercel -ArgumentList "env", "add", "JWT_SECRET", $jwtSecret -Wait -NoNewWindow

Write-Host "Setting ENCRYPTION_KEY..."
Start-Process vercel -ArgumentList "env", "add", "ENCRYPTION_KEY", $encryptionKey -Wait -NoNewWindow

Write-Host "Setting DATABASE_URL..."
Start-Process vercel -ArgumentList "env", "add", "DATABASE_URL", "postgresql://user:pass@localhost:5432/astral_core" -Wait -NoNewWindow

Write-Host "Setting feature flags..."
Start-Process vercel -ArgumentList "env", "add", "NEXT_PUBLIC_ENABLE_CRISIS_MODE", "true" -Wait -NoNewWindow
Start-Process vercel -ArgumentList "env", "add", "NEXT_PUBLIC_ENABLE_VOLUNTEERS", "true" -Wait -NoNewWindow
Start-Process vercel -ArgumentList "env", "add", "NEXT_PUBLIC_ENABLE_AI_SAFETY", "true" -Wait -NoNewWindow
Start-Process vercel -ArgumentList "env", "add", "NEXT_PUBLIC_ENABLE_EMERGENCY", "true" -Wait -NoNewWindow

Write-Host "Setting crisis management..."
Start-Process vercel -ArgumentList "env", "add", "CRISIS_HOTLINE_NUMBER", "988" -Wait -NoNewWindow
Start-Process vercel -ArgumentList "env", "add", "EMERGENCY_CONTACT_EMAIL", "emergency@astralcore.com" -Wait -NoNewWindow

Write-Host "Setting API configuration..."
Start-Process vercel -ArgumentList "env", "add", "API_RATE_LIMIT", "1000" -Wait -NoNewWindow
Start-Process vercel -ArgumentList "env", "add", "API_TIMEOUT", "30000" -Wait -NoNewWindow

Write-Host "`nCore environment variables set! Starting deployment..." -ForegroundColor Green

# Deploy to production
vercel --prod --yes

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "`nIMPORTANT: Update these placeholder values in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "- DATABASE_URL (set to your actual PostgreSQL database)"
Write-Host "- TWILIO_* variables (for SMS functionality)"  
Write-Host "- SMTP_* variables (for email functionality)"
Write-Host "- OAuth client IDs and secrets"