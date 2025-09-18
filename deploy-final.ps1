# ASTRAL CORE V2 - Complete Production Deployment Script
# Sets ALL environment variables with generated secure keys

Write-Host "ASTRAL CORE V2 - Complete Production Setup" -ForegroundColor Green

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

# Generate all required secret keys
Write-Host "Generating secure secret keys..." -ForegroundColor Yellow
$nextAuthSecret = New-SecureKey 32
$jwtSecret = New-SecureKey 32
$encryptionKey = New-HexKey 32
$apiSecret = New-SecureKey 32
$csrfSecret = New-SecureKey 32
$websocketSecret = New-SecureKey 32
$webhookSecret = New-SecureKey 32
$redisPassword = New-SecureKey 16

Write-Host "Keys generated successfully!" -ForegroundColor Green

# Function to set environment variable with proper input handling
function Set-VercelVar {
    param($Name, $Value)
    Write-Host "Setting $Name..." -ForegroundColor Yellow
    $process = Start-Process -FilePath "vercel" -ArgumentList "env", "add", $Name -PassThru -NoNewWindow -RedirectStandardInput
    $process.StandardInput.WriteLine($Value)
    $process.StandardInput.Close()
    $process.WaitForExit()
}

Write-Host "Setting all environment variables..." -ForegroundColor Cyan

# Use here-string approach for batch setting
$envScript = @"
echo "production" | vercel env add NODE_ENV
echo "ASTRAL CORE V2" | vercel env add NEXT_PUBLIC_APP_NAME  
echo "2.0.0" | vercel env add NEXT_PUBLIC_APP_VERSION
echo "https://astral-core-v2.vercel.app" | vercel env add NEXTAUTH_URL
echo "$nextAuthSecret" | vercel env add NEXTAUTH_SECRET
echo "$jwtSecret" | vercel env add JWT_SECRET
echo "$encryptionKey" | vercel env add ENCRYPTION_KEY
echo "$apiSecret" | vercel env add API_SECRET_KEY
echo "$csrfSecret" | vercel env add CSRF_SECRET
echo "postgresql://user:pass@localhost:5432/astral_core" | vercel env add DATABASE_URL
echo "postgresql://user:pass@localhost:5432/astral_core" | vercel env add DIRECT_URL
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_CRISIS_MODE
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_VOLUNTEERS
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_AI_SAFETY
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_EMERGENCY
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_NOTIFICATIONS
echo "988" | vercel env add CRISIS_HOTLINE_NUMBER
echo "emergency@astralcore.com" | vercel env add EMERGENCY_CONTACT_EMAIL
echo "your-twilio-account-sid" | vercel env add TWILIO_ACCOUNT_SID
echo "your-twilio-auth-token" | vercel env add TWILIO_AUTH_TOKEN
echo "+1234567890" | vercel env add TWILIO_PHONE_NUMBER
echo "your-google-client-id" | vercel env add GOOGLE_CLIENT_ID
echo "your-google-client-secret" | vercel env add GOOGLE_CLIENT_SECRET
echo "smtp.gmail.com" | vercel env add SMTP_HOST
echo "587" | vercel env add SMTP_PORT
echo "your-email@gmail.com" | vercel env add SMTP_USER
echo "your-app-password" | vercel env add SMTP_PASSWORD
echo "noreply@astralcore.com" | vercel env add EMAIL_FROM
echo "redis://localhost:6379" | vercel env add REDIS_URL
echo "$redisPassword" | vercel env add REDIS_PASSWORD
echo "info" | vercel env add LOG_LEVEL
echo "1000" | vercel env add API_RATE_LIMIT
echo "30000" | vercel env add API_TIMEOUT
echo "10485760" | vercel env add MAX_FILE_SIZE
echo "https://astral-core-v2.vercel.app" | vercel env add CORS_ORIGIN
echo "15" | vercel env add RATE_LIMIT_WINDOW
echo "100" | vercel env add RATE_LIMIT_MAX
echo "3001" | vercel env add WEBSOCKET_PORT
echo "$websocketSecret" | vercel env add WEBSOCKET_SECRET
echo "$webhookSecret" | vercel env add WEBHOOK_SECRET
"@

# Execute the batch commands
Invoke-Expression $envScript

Write-Host "All environment variables set!" -ForegroundColor Green

# Display generated secrets
Write-Host "`nGenerated Secrets (SAVE THESE SECURELY):" -ForegroundColor Yellow
Write-Host "NEXTAUTH_SECRET: $nextAuthSecret" -ForegroundColor White
Write-Host "JWT_SECRET: $jwtSecret" -ForegroundColor White  
Write-Host "ENCRYPTION_KEY: $encryptionKey" -ForegroundColor White
Write-Host "API_SECRET_KEY: $apiSecret" -ForegroundColor White
Write-Host "CSRF_SECRET: $csrfSecret" -ForegroundColor White
Write-Host "WEBSOCKET_SECRET: $websocketSecret" -ForegroundColor White
Write-Host "WEBHOOK_SECRET: $webhookSecret" -ForegroundColor White
Write-Host "REDIS_PASSWORD: $redisPassword" -ForegroundColor White

# Deploy to production
Write-Host "`nStarting production deployment..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host "`nDeployment process complete!" -ForegroundColor Green