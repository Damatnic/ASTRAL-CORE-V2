# ASTRAL CORE V2 - Vercel Deployment Setup Script (PowerShell)
# This script creates a new Vercel project and sets all required environment variables

Write-Host "🚀 Starting ASTRAL CORE V2 Vercel Deployment Setup..." -ForegroundColor Green

# Function to add environment variable
function Add-EnvVar {
    param(
        [string]$Name,
        [string]$Value,
        [string]$Environment = "production"
    )
    
    Write-Host "📝 Adding $Name to $Environment environment..." -ForegroundColor Blue
    
    # Use echo to pipe the value to vercel env add
    try {
        $Value | vercel env add $Name $Environment --yes 2>$null
        Write-Host "✅ Added $Name" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  $Name may already exist or failed to add" -ForegroundColor Yellow
    }
}

# Step 1: Remove existing project link (if any)
Write-Host "🔗 Unlinking existing project..." -ForegroundColor Blue
try {
    vercel unlink --yes 2>$null
}
catch {
    Write-Host "⚠️  No existing project to unlink" -ForegroundColor Yellow
}

# Step 2: Create new project link
Write-Host "🆕 Linking to Vercel project..." -ForegroundColor Blue

# Step 3: Set up all environment variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Green

# Core application settings
Add-EnvVar "NODE_ENV" "production"
Add-EnvVar "SKIP_ENV_VALIDATION" "true"
Add-EnvVar "NEXT_TELEMETRY_DISABLED" "1"
Add-EnvVar "VERCEL" "1"

# Authentication & Security
Add-EnvVar "JWT_SECRET" "crisis-platform-secure-jwt-secret-production-2025"
Add-EnvVar "CRISIS_ENCRYPTION_KEY" "crisis-secure-encryption-key-64-chars-production-2025-ultra-secure"

# API Endpoints
Add-EnvVar "NEXT_PUBLIC_API_URL" "https://astral-core-v2.vercel.app/api"
Add-EnvVar "NEXT_PUBLIC_WS_URL" "wss://astral-core-v2.vercel.app"

# Feature flags - Core features enabled
Add-EnvVar "FEATURE_CRISIS_CHAT" "true"
Add-EnvVar "FEATURE_EMERGENCY_ESCALATION" "true"
Add-EnvVar "FEATURE_SAFETY_PLANNING" "true"
Add-EnvVar "FEATURE_MOOD_TRACKING" "true"
Add-EnvVar "FEATURE_SELF_HELP_RESOURCES" "true"

# Feature flags - Advanced features disabled initially
Add-EnvVar "FEATURE_AI_RISK_ASSESSMENT" "false"
Add-EnvVar "FEATURE_VOLUNTEER_MATCHING" "false"
Add-EnvVar "FEATURE_OFFLINE_MODE" "false"

# Emergency settings
Add-EnvVar "NEXT_PUBLIC_EMERGENCY_MODE" "false"
Add-EnvVar "ENABLE_TEST_MODE" "false"

# Sentry (optional - empty for now)
Add-EnvVar "SENTRY_DSN" ""
Add-EnvVar "SENTRY_ENVIRONMENT" "production"

# OAuth providers (empty for now)
Add-EnvVar "GOOGLE_CLIENT_ID" ""
Add-EnvVar "GOOGLE_CLIENT_SECRET" ""
Add-EnvVar "GITHUB_CLIENT_ID" ""
Add-EnvVar "GITHUB_CLIENT_SECRET" ""

# Crisis services (empty for now)
Add-EnvVar "CRISIS_988_API_KEY" ""
Add-EnvVar "CRISIS_TEXT_API_KEY" ""
Add-EnvVar "TWILIO_ACCOUNT_SID" ""
Add-EnvVar "TWILIO_AUTH_TOKEN" ""
Add-EnvVar "TWILIO_PHONE_NUMBER" ""

# Email (empty for now)
Add-EnvVar "SMTP_HOST" ""
Add-EnvVar "SMTP_PORT" "587"
Add-EnvVar "SMTP_USER" ""
Add-EnvVar "SMTP_PASSWORD" ""
Add-EnvVar "FROM_EMAIL" "support@astralcore.org"

Write-Host "✅ Environment variables setup complete!" -ForegroundColor Green

# Step 4: Deploy to production
Write-Host "🚀 Deploying to production..." -ForegroundColor Blue
vercel deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host "🔍 Checking deployment status..." -ForegroundColor Blue
    vercel ls
} else {
    Write-Host "❌ Deployment failed. Check the logs above." -ForegroundColor Red
    exit 1
}

Write-Host "🏆 ASTRAL CORE V2 deployment setup complete!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host "1. Update NEXTAUTH_URL with your actual domain"
Write-Host "2. Set up a production database (PostgreSQL)"
Write-Host "3. Configure external services (Twilio, OAuth, etc.) as needed"
Write-Host "4. Test the deployment thoroughly"