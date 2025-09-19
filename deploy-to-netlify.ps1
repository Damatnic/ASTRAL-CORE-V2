# Astral Core V2 - Netlify Deployment Script
# This script will deploy the mental health platform to Netlify with all required environment variables

Write-Host "🚀 ASTRAL CORE V2 - NETLIFY DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "apps/web")) {
    Write-Host "❌ Error: Must run from ASTRAL_CORE_V2 root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing Netlify CLI globally..." -ForegroundColor Yellow
npm install -g netlify-cli

Write-Host ""
Write-Host "🔧 Setting up Netlify deployment..." -ForegroundColor Yellow
Write-Host ""

# Navigate to web app directory
Set-Location apps/web

Write-Host "🏗️ Building the application..." -ForegroundColor Yellow
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Create netlify.toml configuration
Write-Host "📝 Creating Netlify configuration..." -ForegroundColor Yellow

$netlifyConfig = @"
[build]
  command = "pnpm build"
  publish = ".next"
  base = "apps/web"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), interest-cohort=()"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
"@

$netlifyConfig | Out-File -FilePath "netlify.toml" -Encoding UTF8
Write-Host "✅ Netlify configuration created!" -ForegroundColor Green
Write-Host ""

# Environment variables setup
Write-Host "🔐 Setting up environment variables..." -ForegroundColor Yellow
Write-Host "Please provide the following values when prompted:" -ForegroundColor Cyan
Write-Host ""

# Create .env file for Netlify
$envContent = @"
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/astralcore?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/astralcore?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="https://your-app.netlify.app"
NEXTAUTH_SECRET="your-nextauth-secret-generate-with-openssl-rand-base64-32"

# Auth0 Configuration (Optional)
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_ISSUER="https://your-domain.auth0.com"

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Crisis Hotline API (Optional)
CRISIS_API_KEY="your-crisis-api-key"
CRISIS_WEBHOOK_URL="your-crisis-webhook-url"

# OpenAI API (For AI Therapy)
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4"

# Sentry Error Monitoring (Optional)
SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Redis Configuration (Optional)
REDIS_URL="redis://localhost:6379"

# Email Service (Optional)
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@astralcore.com"

# Twilio (For SMS alerts - Optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Analytics (Optional)
GA_MEASUREMENT_ID="G-XXXXXXXXXX"
POSTHOG_API_KEY="your-posthog-key"

# Feature Flags
ENABLE_AI_THERAPY="true"
ENABLE_CRISIS_CHAT="true"
ENABLE_PEER_SUPPORT="true"
ENABLE_TELEMETRY="false"

# Security
ENCRYPTION_KEY="your-encryption-key-32-chars"
JWT_SECRET="your-jwt-secret"

# Development/Production
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-app.netlify.app"
"@

# Save template env file
$envContent | Out-File -FilePath ".env.production.template" -Encoding UTF8

Write-Host "📋 Environment variables template created at .env.production.template" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: You'll need to set these in Netlify's dashboard!" -ForegroundColor Yellow
Write-Host ""

# Initialize Netlify site
Write-Host "🌐 Initializing Netlify site..." -ForegroundColor Yellow
Write-Host "Please follow the prompts to connect to your Netlify account:" -ForegroundColor Cyan
Write-Host ""

# This will prompt for login and site creation
netlify init

Write-Host ""
Write-Host "🔧 Setting environment variables in Netlify..." -ForegroundColor Yellow
Write-Host ""

# Core required environment variables
$requiredEnvVars = @{
    "DATABASE_URL" = "postgresql://user:password@localhost:5432/astralcore?schema=public"
    "NEXTAUTH_URL" = "https://your-site.netlify.app"
    "NEXTAUTH_SECRET" = [System.Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
    "NODE_ENV" = "production"
    "ENABLE_AI_THERAPY" = "true"
    "ENABLE_CRISIS_CHAT" = "true"
}

Write-Host "Setting required environment variables..." -ForegroundColor Yellow
foreach ($key in $requiredEnvVars.Keys) {
    Write-Host "Setting $key..." -ForegroundColor Gray
    netlify env:set $key $requiredEnvVars[$key]
}

Write-Host ""
Write-Host "📦 Deploying to Netlify..." -ForegroundColor Yellow
Write-Host ""

# Deploy to Netlify
netlify deploy --prod --build

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Your Astral Core V2 Mental Health Platform is now live!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to your Netlify dashboard" -ForegroundColor White
Write-Host "2. Navigate to Site Settings > Environment Variables" -ForegroundColor White
Write-Host "3. Update the environment variables with your actual values" -ForegroundColor White
Write-Host "4. Redeploy if you made changes to environment variables" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Important URLs:" -ForegroundColor Cyan
Write-Host "- Netlify Dashboard: https://app.netlify.com" -ForegroundColor White
Write-Host "- Your Site URL will be shown above" -ForegroundColor White
Write-Host ""
Write-Host "🚨 Crisis Features:" -ForegroundColor Red
Write-Host "- Ensure crisis hotline integration is configured" -ForegroundColor White
Write-Host "- Test AI therapy functionality" -ForegroundColor White
Write-Host "- Verify emergency escalation works" -ForegroundColor White
Write-Host ""
Write-Host "💡 For production use:" -ForegroundColor Yellow
Write-Host "- Set up a proper database (PostgreSQL)" -ForegroundColor White
Write-Host "- Configure authentication providers" -ForegroundColor White
Write-Host "- Enable error monitoring (Sentry)" -ForegroundColor White
Write-Host "- Set up analytics tracking" -ForegroundColor White
Write-Host ""

# Return to root directory
Set-Location ../..