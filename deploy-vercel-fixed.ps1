# ASTRAL CORE V2 - Automated Vercel Deployment Script
# This script sets up all environment variables and deploys to Vercel

param(
    [switch]$SkipEnvVars,
    [switch]$ProductionDeploy
)

function Write-StepHeader {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Set-VercelEnvVar {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Target = "production,preview,development"
    )
    
    Write-Host "Setting $Name..." -ForegroundColor Yellow
    $cmd = "vercel env add `"$Name`" `"$Value`" --scope `"$Target`""
    Invoke-Expression $cmd
}

Write-Host "🚀 ASTRAL CORE V2 - Vercel Deployment Setup" -ForegroundColor Green

if (-not $SkipEnvVars) {
    Write-StepHeader "Setting up environment variables"
    
    # Core Application Settings
    Set-VercelEnvVar "NODE_ENV" "production"
    Set-VercelEnvVar "NEXT_PUBLIC_APP_NAME" "ASTRAL CORE V2"
    Set-VercelEnvVar "NEXT_PUBLIC_APP_VERSION" "2.0.0"
    Set-VercelEnvVar "NEXTAUTH_URL" "https://your-domain.vercel.app"
    Set-VercelEnvVar "NEXTAUTH_SECRET" "your-nextauth-secret-key-here"
    
    # Database Configuration
    Set-VercelEnvVar "DATABASE_URL" "postgresql://username:password@host:port/database"
    Set-VercelEnvVar "DIRECT_URL" "postgresql://username:password@host:port/database"
    
    # JWT and Security
    Set-VercelEnvVar "JWT_SECRET" "your-jwt-secret-key-here"
    Set-VercelEnvVar "ENCRYPTION_KEY" "your-32-char-encryption-key-here"
    Set-VercelEnvVar "API_SECRET_KEY" "your-api-secret-key-here"
    
    # External Services
    Set-VercelEnvVar "TWILIO_ACCOUNT_SID" "your-twilio-account-sid"
    Set-VercelEnvVar "TWILIO_AUTH_TOKEN" "your-twilio-auth-token"
    Set-VercelEnvVar "TWILIO_PHONE_NUMBER" "your-twilio-phone-number"
    
    # OAuth Configuration
    Set-VercelEnvVar "GOOGLE_CLIENT_ID" "your-google-client-id"
    Set-VercelEnvVar "GOOGLE_CLIENT_SECRET" "your-google-client-secret"
    Set-VercelEnvVar "GITHUB_CLIENT_ID" "your-github-client-id"
    Set-VercelEnvVar "GITHUB_CLIENT_SECRET" "your-github-client-secret"
    
    # Email Configuration
    Set-VercelEnvVar "SMTP_HOST" "smtp.gmail.com"
    Set-VercelEnvVar "SMTP_PORT" "587"
    Set-VercelEnvVar "SMTP_USER" "your-email@gmail.com"
    Set-VercelEnvVar "SMTP_PASSWORD" "your-app-password"
    Set-VercelEnvVar "EMAIL_FROM" "noreply@astralcore.com"
    
    # Feature Flags
    Set-VercelEnvVar "NEXT_PUBLIC_ENABLE_CRISIS_MODE" "true"
    Set-VercelEnvVar "NEXT_PUBLIC_ENABLE_VOLUNTEERS" "true"
    Set-VercelEnvVar "NEXT_PUBLIC_ENABLE_ANALYTICS" "true"
    Set-VercelEnvVar "NEXT_PUBLIC_ENABLE_AI_SAFETY" "true"
    Set-VercelEnvVar "NEXT_PUBLIC_ENABLE_EMERGENCY" "true"
    
    # Crisis Management
    Set-VercelEnvVar "CRISIS_HOTLINE_NUMBER" "988"
    Set-VercelEnvVar "EMERGENCY_CONTACT_EMAIL" "emergency@astralcore.com"
    
    # Redis Configuration
    Set-VercelEnvVar "REDIS_URL" "redis://localhost:6379"
    Set-VercelEnvVar "REDIS_PASSWORD" "your-redis-password"
    
    # Monitoring and Logging
    Set-VercelEnvVar "LOG_LEVEL" "info"
    Set-VercelEnvVar "SENTRY_DSN" "your-sentry-dsn"
    Set-VercelEnvVar "ANALYTICS_ID" "your-analytics-id"
    
    # API Configuration
    Set-VercelEnvVar "API_RATE_LIMIT" "1000"
    Set-VercelEnvVar "API_TIMEOUT" "30000"
    Set-VercelEnvVar "MAX_FILE_SIZE" "10485760"
    
    # Security Settings
    Set-VercelEnvVar "CORS_ORIGIN" "https://your-domain.vercel.app"
    Set-VercelEnvVar "CSRF_SECRET" "your-csrf-secret-key"
    Set-VercelEnvVar "RATE_LIMIT_WINDOW" "15"
    Set-VercelEnvVar "RATE_LIMIT_MAX" "100"
    
    Write-Host "`n✅ Environment variables setup complete!" -ForegroundColor Green
}

Write-StepHeader "Deploying to Vercel"

if ($ProductionDeploy) {
    Write-Host "🚀 Starting production deployment..." -ForegroundColor Yellow
    vercel --prod --yes
} else {
    Write-Host "🚀 Starting preview deployment..." -ForegroundColor Yellow
    vercel --yes
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🏆 ASTRAL CORE V2 deployment setup complete!" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Blue
    Write-Host "1. Update NEXTAUTH_URL with your actual domain"
    Write-Host "2. Set up a production database (PostgreSQL)"
    Write-Host "3. Configure external services (Twilio, OAuth, etc.) as needed"
    Write-Host "4. Test the deployment thoroughly"
} else {
    Write-Host "`n❌ Deployment failed. Please check the output above." -ForegroundColor Red
}