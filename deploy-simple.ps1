# ASTRAL CORE V2 - Simplified Vercel Deployment Script

Write-Host "🚀 ASTRAL CORE V2 - Vercel Deployment Setup" -ForegroundColor Green
Write-Host "Project linked to: astral-productions/astral-core-v2" -ForegroundColor Yellow

# Set essential environment variables first
Write-Host "`n=== Setting Core Environment Variables ===" -ForegroundColor Cyan

Write-Host "Setting NODE_ENV..." -ForegroundColor Yellow
vercel env add NODE_ENV production

Write-Host "Setting NEXT_PUBLIC_APP_NAME..." -ForegroundColor Yellow
vercel env add NEXT_PUBLIC_APP_NAME "ASTRAL CORE V2"

Write-Host "Setting NEXTAUTH_SECRET..." -ForegroundColor Yellow
vercel env add NEXTAUTH_SECRET "change-this-to-a-secure-secret-key-32-chars-long"

Write-Host "Setting JWT_SECRET..." -ForegroundColor Yellow
vercel env add JWT_SECRET "change-this-to-a-secure-jwt-secret-key"

Write-Host "Setting DATABASE_URL..." -ForegroundColor Yellow
vercel env add DATABASE_URL "postgresql://username:password@host:port/database"

# Feature flags
Write-Host "`n=== Setting Feature Flags ===" -ForegroundColor Cyan

Write-Host "Setting NEXT_PUBLIC_ENABLE_CRISIS_MODE..." -ForegroundColor Yellow
vercel env add NEXT_PUBLIC_ENABLE_CRISIS_MODE "true"

Write-Host "Setting NEXT_PUBLIC_ENABLE_VOLUNTEERS..." -ForegroundColor Yellow
vercel env add NEXT_PUBLIC_ENABLE_VOLUNTEERS "true"

Write-Host "Setting NEXT_PUBLIC_ENABLE_AI_SAFETY..." -ForegroundColor Yellow
vercel env add NEXT_PUBLIC_ENABLE_AI_SAFETY "true"

Write-Host "Setting NEXT_PUBLIC_ENABLE_EMERGENCY..." -ForegroundColor Yellow
vercel env add NEXT_PUBLIC_ENABLE_EMERGENCY "true"

Write-Host "`n✅ Essential environment variables set!" -ForegroundColor Green

# Deploy to production
Write-Host "`n=== Deploying to Production ===" -ForegroundColor Cyan
Write-Host "Starting production deployment..." -ForegroundColor Yellow

vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🏆 ASTRAL CORE V2 deployed successfully!" -ForegroundColor Green
    Write-Host "`n📋 Important Next Steps:" -ForegroundColor Blue
    Write-Host "1. Update NEXTAUTH_SECRET with a secure 32-character secret"
    Write-Host "2. Update DATABASE_URL with your production PostgreSQL database"
    Write-Host "3. Set up remaining environment variables as needed"
    Write-Host "4. Configure your domain in Vercel dashboard"
} else {
    Write-Host "`n❌ Deployment failed. Check the output above for errors." -ForegroundColor Red
}