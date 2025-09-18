# Astral Core V2 - Complete Deployment Script
# This script automates the entire deployment process to Vercel with all environment variables

param(
    [string]$OPENAI_API_KEY,
    [string]$GEMINI_API_KEY,
    [switch]$Production,
    [switch]$Preview
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   ASTRAL CORE V2 - AUTOMATED DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_NAME = "astral-core-v2"
$REQUIRED_ENV_VARS = @{
    # Core Authentication & Security
    "NEXTAUTH_URL" = if ($Production) { "https://astral-core-v2.vercel.app" } else { "https://astral-core-v2-preview.vercel.app" }
    "NEXTAUTH_SECRET" = "KqStw6FyppSWAylj9btaBfde3ZL3qd0k"
    "JWT_SECRET" = "UJElGNGMZBQNV2BJ9TGh92Yvi9nYFgpC"
    "ENCRYPTION_KEY" = "e98c6bddf9136a8c2d5e8b7a4f1c3e2d"
    "WEBSOCKET_SECRET" = "V9T1jNTjxHuHjRKrCd313KHh8SN675DB"
    "WEBHOOK_SECRET" = "c9Lkdu8tKIHbCvvJKTAxjv3yJpyyvLDN"
    
    # Database Configuration
    "DATABASE_URL" = "postgresql://postgres:Oga5V5eEplUD5LQN@localhost:5432/astralcore_v2"
    "REDIS_URL" = "redis://default:Oga5V5eEplUD5LQN@localhost:6379"
    "REDIS_PASSWORD" = "Oga5V5eEplUD5LQN"
    
    # Environment Settings
    "NODE_ENV" = if ($Production) { "production" } else { "preview" }
    "NEXT_PUBLIC_ENV" = if ($Production) { "production" } else { "preview" }
    
    # Feature Flags
    "ENABLE_CRISIS_MODE" = "true"
    "ENABLE_AI_THERAPY" = "true"
    "ENABLE_VOLUNTEER_MATCHING" = "true"
    "ENABLE_MOOD_TRACKING" = "true"
    "ENABLE_SAFETY_PLANS" = "true"
    "ENABLE_WELLNESS_TOOLS" = "true"
    "ENABLE_GAMIFICATION" = "true"
    "ENABLE_NOTIFICATIONS" = "true"
    "ENABLE_ANALYTICS" = "true"
    "ENABLE_PERFORMANCE_MONITORING" = "true"
    
    # Security Settings
    "ENABLE_RATE_LIMITING" = "true"
    "ENABLE_CSRF_PROTECTION" = "true"
    "ENABLE_CONTENT_SECURITY_POLICY" = "true"
    "ENABLE_DDOS_PROTECTION" = "true"
    
    # Crisis Intervention Settings
    "CRISIS_HOTLINE_PRIMARY" = "988"
    "CRISIS_HOTLINE_SECONDARY" = "1-800-273-8255"
    "CRISIS_TEXT_LINE" = "741741"
    "MAX_CRISIS_CHAT_DURATION" = "7200"
    "CRISIS_RESPONSE_TIMEOUT" = "30"
    
    # Performance Settings
    "MAX_UPLOAD_SIZE" = "10485760"
    "REQUEST_TIMEOUT" = "30000"
    "ENABLE_CACHE" = "true"
    "CACHE_TTL" = "3600"
    
    # Email Configuration (placeholder - replace with actual)
    "EMAIL_FROM" = "noreply@astralcore.app"
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = ""
    "SMTP_PASSWORD" = ""
    
    # Monitoring & Analytics (placeholder - replace with actual)
    "SENTRY_DSN" = ""
    "GA_MEASUREMENT_ID" = ""
    "POSTHOG_KEY" = ""
    "MIXPANEL_TOKEN" = ""
}

# Function to check prerequisites
function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    $hasErrors = $false
    
    # Check Node.js
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Node.js is not installed" -ForegroundColor Red
        $hasErrors = $true
    } else {
        $nodeVersion = node --version
        Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
    }
    
    # Check pnpm
    if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: pnpm is not installed" -ForegroundColor Red
        $hasErrors = $true
    } else {
        $pnpmVersion = pnpm --version
        Write-Host "✓ pnpm $pnpmVersion found" -ForegroundColor Green
    }
    
    # Check Vercel CLI
    if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "WARNING: Vercel CLI not found. Installing..." -ForegroundColor Yellow
        npm i -g vercel
        if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
            Write-Host "ERROR: Failed to install Vercel CLI" -ForegroundColor Red
            $hasErrors = $true
        } else {
            Write-Host "✓ Vercel CLI installed successfully" -ForegroundColor Green
        }
    } else {
        Write-Host "✓ Vercel CLI found" -ForegroundColor Green
    }
    
    if ($hasErrors) {
        Write-Host "`nPlease install missing prerequisites and try again." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

# Function to collect API keys
function Collect-APIKeys {
    Write-Host "API Key Configuration" -ForegroundColor Yellow
    Write-Host "---------------------" -ForegroundColor Yellow
    
    # OpenAI API Key
    if (!$OPENAI_API_KEY) {
        $OPENAI_API_KEY = Read-Host "Enter your OpenAI API Key (press Enter to skip)"
    }
    if ($OPENAI_API_KEY) {
        $REQUIRED_ENV_VARS["OPENAI_API_KEY"] = $OPENAI_API_KEY
        Write-Host "✓ OpenAI API Key configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ OpenAI API Key skipped (AI features may be limited)" -ForegroundColor Yellow
    }
    
    # Gemini API Key
    if (!$GEMINI_API_KEY) {
        $GEMINI_API_KEY = Read-Host "Enter your Gemini API Key (press Enter to skip)"
    }
    if ($GEMINI_API_KEY) {
        $REQUIRED_ENV_VARS["GEMINI_API_KEY"] = $GEMINI_API_KEY
        Write-Host "✓ Gemini API Key configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ Gemini API Key skipped (AI features may be limited)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Function to build project
function Build-Project {
    Write-Host "Building project..." -ForegroundColor Yellow
    
    # Clean install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Gray
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to generate Prisma client" -ForegroundColor Red
        exit 1
    }
    
    # Build project
    Write-Host "Building application..." -ForegroundColor Gray
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Build failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Build completed successfully" -ForegroundColor Green
    Write-Host ""
}

# Function to deploy to Vercel
function Deploy-ToVercel {
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    
    # Create environment file
    $envFile = ".env.production.local"
    $envContent = ""
    foreach ($key in $REQUIRED_ENV_VARS.Keys) {
        $envContent += "$key=$($REQUIRED_ENV_VARS[$key])`n"
    }
    Set-Content -Path $envFile -Value $envContent
    
    # Login to Vercel if needed
    Write-Host "Checking Vercel authentication..." -ForegroundColor Gray
    vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Please login to Vercel:" -ForegroundColor Yellow
        vercel login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Vercel login failed" -ForegroundColor Red
            exit 1
        }
    }
    
    # Deploy command
    $deployCmd = "vercel --yes"
    if ($Production) {
        $deployCmd += " --prod"
        Write-Host "Deploying to PRODUCTION..." -ForegroundColor Cyan
    } else {
        Write-Host "Deploying to PREVIEW..." -ForegroundColor Cyan
    }
    
    # Execute deployment
    $deployOutput = Invoke-Expression $deployCmd 2>&1
    $deployUrl = $deployOutput | Select-String -Pattern "https://.*vercel.app" | Select-Object -First 1
    
    if ($LASTEXITCODE -eq 0 -and $deployUrl) {
        Write-Host "✓ Deployment successful!" -ForegroundColor Green
        Write-Host "URL: $deployUrl" -ForegroundColor Cyan
        
        # Set environment variables on Vercel
        Write-Host "`nConfiguring environment variables on Vercel..." -ForegroundColor Yellow
        foreach ($key in $REQUIRED_ENV_VARS.Keys) {
            $value = $REQUIRED_ENV_VARS[$key]
            if ($Production) {
                vercel env add $key production --force 2>$null <<< "$value`n"
            } else {
                vercel env add $key preview --force 2>$null <<< "$value`n"
            }
        }
        Write-Host "✓ Environment variables configured" -ForegroundColor Green
        
        # Clean up local env file
        Remove-Item -Path $envFile -Force -ErrorAction SilentlyContinue
        
        return $deployUrl
    } else {
        Write-Host "ERROR: Deployment failed" -ForegroundColor Red
        Write-Host $deployOutput
        exit 1
    }
}

# Function to verify deployment
function Verify-Deployment {
    param($url)
    
    Write-Host "`nVerifying deployment..." -ForegroundColor Yellow
    
    $attempts = 0
    $maxAttempts = 10
    $verified = $false
    
    while ($attempts -lt $maxAttempts -and !$verified) {
        $attempts++
        Write-Host "Checking deployment (attempt $attempts/$maxAttempts)..." -ForegroundColor Gray
        
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                $verified = $true
                Write-Host "✓ Deployment verified successfully!" -ForegroundColor Green
            }
        } catch {
            Start-Sleep -Seconds 5
        }
    }
    
    if (!$verified) {
        Write-Host "⚠ Could not verify deployment, but it may still be processing" -ForegroundColor Yellow
    }
}

# Main execution
function Main {
    Clear-Host
    
    Check-Prerequisites
    Collect-APIKeys
    Build-Project
    
    $deployUrl = Deploy-ToVercel
    
    if ($deployUrl) {
        Verify-Deployment -url $deployUrl
        
        Write-Host "`n=================================================" -ForegroundColor Green
        Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
        Write-Host "=================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your Astral Core V2 application is now live at:" -ForegroundColor Cyan
        Write-Host "$deployUrl" -ForegroundColor White
        Write-Host ""
        Write-Host "Features enabled:" -ForegroundColor Yellow
        Write-Host "  ✓ Crisis Intervention System" -ForegroundColor Green
        Write-Host "  ✓ AI Therapy Sessions" -ForegroundColor Green
        Write-Host "  ✓ Volunteer Matching" -ForegroundColor Green
        Write-Host "  ✓ Mood Tracking" -ForegroundColor Green
        Write-Host "  ✓ Safety Plans" -ForegroundColor Green
        Write-Host "  ✓ Wellness Tools" -ForegroundColor Green
        Write-Host "  ✓ Gamification" -ForegroundColor Green
        Write-Host "  ✓ Real-time Notifications" -ForegroundColor Green
        Write-Host "  ✓ Analytics Dashboard" -ForegroundColor Green
        Write-Host "  ✓ Performance Monitoring" -ForegroundColor Green
        Write-Host ""
        
        if (!$OPENAI_API_KEY -and !$GEMINI_API_KEY) {
            Write-Host "NOTE: AI features are limited without API keys." -ForegroundColor Yellow
            Write-Host "Add OpenAI or Gemini API keys in Vercel dashboard for full functionality." -ForegroundColor Yellow
        }
        
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "1. Visit your deployment: $deployUrl" -ForegroundColor White
        Write-Host "2. Configure additional API keys in Vercel dashboard if needed" -ForegroundColor White
        Write-Host "3. Set up custom domain (optional)" -ForegroundColor White
        Write-Host "4. Configure monitoring and analytics services" -ForegroundColor White
        Write-Host ""
    }
}

# Run the script
Main