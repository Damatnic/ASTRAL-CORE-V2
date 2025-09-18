#!/bin/bash
# ASTRAL CORE V2 - Vercel Deployment Setup Script
# This script creates a new Vercel project and sets all required environment variables

echo "🚀 Starting ASTRAL CORE V2 Vercel Deployment Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to add environment variable
add_env_var() {
    local name=$1
    local value=$2
    local environment=${3:-"production"}
    
    echo -e "${BLUE}📝 Adding $name to $environment environment...${NC}"
    echo "$value" | vercel env add "$name" "$environment" --yes 2>/dev/null || echo -e "${YELLOW}⚠️  $name may already exist${NC}"
}

# Step 1: Remove existing project link (if any)
echo -e "${BLUE}🔗 Unlinking existing project...${NC}"
vercel unlink --yes 2>/dev/null || echo -e "${YELLOW}⚠️  No existing project to unlink${NC}"

# Step 2: Create new project
echo -e "${BLUE}🆕 Creating new Vercel project...${NC}"
echo -e "astral-core-crisis-platform\ny\nAstralProductions\nn" | vercel link 2>/dev/null || echo -e "${YELLOW}⚠️  Project may already exist${NC}"

# Step 3: Set up all environment variables
echo -e "${GREEN}🔧 Setting up environment variables...${NC}"

# Core application settings
add_env_var "NODE_ENV" "production"
add_env_var "SKIP_ENV_VALIDATION" "true"
add_env_var "NEXT_TELEMETRY_DISABLED" "1"
add_env_var "VERCEL" "1"

# Authentication & Security
add_env_var "JWT_SECRET" "crisis-platform-secure-jwt-secret-production-2025"
add_env_var "CRISIS_ENCRYPTION_KEY" "crisis-secure-encryption-key-64-chars-production-2025-ultra-secure"

# API Endpoints (will be updated with actual domain after deployment)
add_env_var "NEXT_PUBLIC_API_URL" "https://astral-core-v2.vercel.app/api"
add_env_var "NEXT_PUBLIC_WS_URL" "wss://astral-core-v2.vercel.app"

# Feature flags - Core features enabled
add_env_var "FEATURE_CRISIS_CHAT" "true"
add_env_var "FEATURE_EMERGENCY_ESCALATION" "true"
add_env_var "FEATURE_SAFETY_PLANNING" "true"
add_env_var "FEATURE_MOOD_TRACKING" "true"
add_env_var "FEATURE_SELF_HELP_RESOURCES" "true"

# Feature flags - Advanced features disabled initially
add_env_var "FEATURE_AI_RISK_ASSESSMENT" "false"
add_env_var "FEATURE_VOLUNTEER_MATCHING" "false"
add_env_var "FEATURE_OFFLINE_MODE" "false"

# Emergency settings
add_env_var "NEXT_PUBLIC_EMERGENCY_MODE" "false"
add_env_var "ENABLE_TEST_MODE" "false"

# Sentry (optional - empty for now)
add_env_var "SENTRY_DSN" ""
add_env_var "SENTRY_ENVIRONMENT" "production"

# OAuth providers (empty for now)
add_env_var "GOOGLE_CLIENT_ID" ""
add_env_var "GOOGLE_CLIENT_SECRET" ""
add_env_var "GITHUB_CLIENT_ID" ""
add_env_var "GITHUB_CLIENT_SECRET" ""

# Crisis services (empty for now)
add_env_var "CRISIS_988_API_KEY" ""
add_env_var "CRISIS_TEXT_API_KEY" ""
add_env_var "TWILIO_ACCOUNT_SID" ""
add_env_var "TWILIO_AUTH_TOKEN" ""
add_env_var "TWILIO_PHONE_NUMBER" ""

# Email (empty for now)
add_env_var "SMTP_HOST" ""
add_env_var "SMTP_PORT" "587"
add_env_var "SMTP_USER" ""
add_env_var "SMTP_PASSWORD" ""
add_env_var "FROM_EMAIL" "support@astralcore.org"

echo -e "${GREEN}✅ Environment variables setup complete!${NC}"

# Step 4: Deploy to production
echo -e "${BLUE}🚀 Deploying to production...${NC}"
vercel deploy --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${BLUE}🔍 Checking deployment status...${NC}"
    vercel ls
else
    echo -e "${RED}❌ Deployment failed. Check the logs above.${NC}"
    exit 1
fi

echo -e "${GREEN}🏆 ASTRAL CORE V2 deployment setup complete!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Update NEXTAUTH_URL with your actual domain"
echo -e "2. Set up a production database (PostgreSQL)"
echo -e "3. Configure external services (Twilio, OAuth, etc.) as needed"
echo -e "4. Test the deployment thoroughly"