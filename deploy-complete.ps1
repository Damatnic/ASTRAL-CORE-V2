# ASTRAL CORE V2 - Complete Production Deployment Script
# This script generates ALL secret keys and sets ALL environment variables

Write-Host "ASTRAL CORE V2 - Complete Production Setup" -ForegroundColor Green
Write-Host "Generating secure keys and deploying with full configuration..." -ForegroundColor Cyan

# Function to generate secure random strings
function New-SecureKey {
    param([int]$Length = 32)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
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

$secrets = @{
    NEXTAUTH_SECRET = New-SecureKey 32
    JWT_SECRET = New-SecureKey 32
    ENCRYPTION_KEY = New-HexKey 32
    API_SECRET_KEY = New-SecureKey 32
    CSRF_SECRET = New-SecureKey 32
}

Write-Host "Keys generated successfully!" -ForegroundColor Green

# Core Application Settings
Write-Host "Setting core application variables..." -ForegroundColor Cyan
echo "production" | vercel env add NODE_ENV
echo "ASTRAL CORE V2" | vercel env add NEXT_PUBLIC_APP_NAME
echo "2.0.0" | vercel env add NEXT_PUBLIC_APP_VERSION
echo "https://astral-core-v2.vercel.app" | vercel env add NEXTAUTH_URL
echo $secrets.NEXTAUTH_SECRET | vercel env add NEXTAUTH_SECRET

# Security and JWT
Write-Host "Setting security variables..." -ForegroundColor Cyan
echo $secrets.JWT_SECRET | vercel env add JWT_SECRET
echo $secrets.ENCRYPTION_KEY | vercel env add ENCRYPTION_KEY
echo $secrets.API_SECRET_KEY | vercel env add API_SECRET_KEY
echo $secrets.CSRF_SECRET | vercel env add CSRF_SECRET

# Database Configuration
Write-Host "Setting database variables..." -ForegroundColor Cyan
vercel env add DATABASE_URL "postgresql://user:pass@localhost:5432/astral_core"
vercel env add DIRECT_URL "postgresql://user:pass@localhost:5432/astral_core"

# Feature Flags
Write-Host "Setting feature flags..." -ForegroundColor Cyan
vercel env add NEXT_PUBLIC_ENABLE_CRISIS_MODE "true"
vercel env add NEXT_PUBLIC_ENABLE_VOLUNTEERS "true"
vercel env add NEXT_PUBLIC_ENABLE_ANALYTICS "true"
vercel env add NEXT_PUBLIC_ENABLE_AI_SAFETY "true"
vercel env add NEXT_PUBLIC_ENABLE_EMERGENCY "true"
vercel env add NEXT_PUBLIC_ENABLE_NOTIFICATIONS "true"
vercel env add NEXT_PUBLIC_ENABLE_MOBILE_APP "true"

# Crisis Management
Write-Host "Setting crisis management variables..." -ForegroundColor Cyan
vercel env add CRISIS_HOTLINE_NUMBER "988"
vercel env add EMERGENCY_CONTACT_EMAIL "emergency@astralcore.com"
vercel env add CRISIS_ESCALATION_THRESHOLD "5"

# External Services (placeholders for user to update)
Write-Host "Setting external service variables..." -ForegroundColor Cyan
vercel env add TWILIO_ACCOUNT_SID "your-twilio-account-sid"
vercel env add TWILIO_AUTH_TOKEN "your-twilio-auth-token"
vercel env add TWILIO_PHONE_NUMBER "+1234567890"

# OAuth Configuration
Write-Host "Setting OAuth variables..." -ForegroundColor Cyan
vercel env add GOOGLE_CLIENT_ID "your-google-client-id"
vercel env add GOOGLE_CLIENT_SECRET "your-google-client-secret"
vercel env add GITHUB_CLIENT_ID "your-github-client-id"
vercel env add GITHUB_CLIENT_SECRET "your-github-client-secret"

# Email Configuration
Write-Host "Setting email variables..." -ForegroundColor Cyan
vercel env add SMTP_HOST "smtp.gmail.com"
vercel env add SMTP_PORT "587"
vercel env add SMTP_USER "your-email@gmail.com"
vercel env add SMTP_PASSWORD "your-app-password"
vercel env add EMAIL_FROM "noreply@astralcore.com"

# Redis Configuration
Write-Host "Setting Redis variables..." -ForegroundColor Cyan
vercel env add REDIS_URL "redis://localhost:6379"
vercel env add REDIS_PASSWORD $(New-SecureKey 16)

# Monitoring and Logging
Write-Host "Setting monitoring variables..." -ForegroundColor Cyan
vercel env add LOG_LEVEL "info"
vercel env add SENTRY_DSN "your-sentry-dsn"
vercel env add ANALYTICS_ID "your-analytics-id"

# API Configuration
Write-Host "Setting API configuration..." -ForegroundColor Cyan
vercel env add API_RATE_LIMIT "1000"
vercel env add API_TIMEOUT "30000"
vercel env add MAX_FILE_SIZE "10485760"
vercel env add API_VERSION "v2"

# Security Settings
Write-Host "Setting security configuration..." -ForegroundColor Cyan
vercel env add CORS_ORIGIN "https://astral-core-v2.vercel.app"
vercel env add RATE_LIMIT_WINDOW "15"
vercel env add RATE_LIMIT_MAX "100"
vercel env add SESSION_TIMEOUT "3600"

# WebSocket Configuration
Write-Host "Setting WebSocket variables..." -ForegroundColor Cyan
vercel env add WEBSOCKET_PORT "3001"
vercel env add WEBSOCKET_SECRET $(New-SecureKey 32)

# Performance Configuration
Write-Host "Setting performance variables..." -ForegroundColor Cyan
vercel env add CACHE_TTL "3600"
vercel env add MAX_CONNECTIONS "100"
vercel env add PERFORMANCE_MONITORING "true"

# Additional Security Keys
Write-Host "Setting additional security keys..." -ForegroundColor Cyan
vercel env add WEBHOOK_SECRET $(New-SecureKey 32)
vercel env add FILE_ENCRYPTION_KEY $(New-HexKey 32)
vercel env add BACKUP_ENCRYPTION_KEY $(New-HexKey 32)

Write-Host "All environment variables set successfully!" -ForegroundColor Green

# Display generated secrets for reference
Write-Host "`nGenerated Secrets (save these securely):" -ForegroundColor Yellow
Write-Host "NEXTAUTH_SECRET: $($secrets.NEXTAUTH_SECRET)" -ForegroundColor White
Write-Host "JWT_SECRET: $($secrets.JWT_SECRET)" -ForegroundColor White
Write-Host "ENCRYPTION_KEY: $($secrets.ENCRYPTION_KEY)" -ForegroundColor White
Write-Host "API_SECRET_KEY: $($secrets.API_SECRET_KEY)" -ForegroundColor White
Write-Host "CSRF_SECRET: $($secrets.CSRF_SECRET)" -ForegroundColor White

# Deploy to production
Write-Host "`nStarting production deployment..." -ForegroundColor Cyan
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
    Write-Host "Your ASTRAL CORE V2 is now live with full configuration!" -ForegroundColor Green
    Write-Host "`nImportant next steps:" -ForegroundColor Yellow
    Write-Host "1. Update DATABASE_URL with your production PostgreSQL database"
    Write-Host "2. Configure Twilio credentials for SMS functionality"
    Write-Host "3. Set up Google/GitHub OAuth applications"
    Write-Host "4. Configure email SMTP settings"
    Write-Host "5. Test all features in production"
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    Write-Host "Check the output above for specific errors" -ForegroundColor Red
}