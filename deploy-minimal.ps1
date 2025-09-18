# ASTRAL CORE V2 - Minimal Deployment Script

Write-Host "ASTRAL CORE V2 - Starting Deployment" -ForegroundColor Green

# Set essential environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow

vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_APP_NAME "ASTRAL CORE V2"
vercel env add NEXTAUTH_SECRET "change-this-to-a-secure-secret-key-32-chars-long"
vercel env add JWT_SECRET "change-this-to-a-secure-jwt-secret-key"
vercel env add DATABASE_URL "postgresql://username:password@host:port/database"
vercel env add NEXT_PUBLIC_ENABLE_CRISIS_MODE "true"
vercel env add NEXT_PUBLIC_ENABLE_VOLUNTEERS "true"
vercel env add NEXT_PUBLIC_ENABLE_AI_SAFETY "true"
vercel env add NEXT_PUBLIC_ENABLE_EMERGENCY "true"

Write-Host "Environment variables set!" -ForegroundColor Green

# Deploy to production
Write-Host "Starting deployment..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host "Deployment complete!" -ForegroundColor Green