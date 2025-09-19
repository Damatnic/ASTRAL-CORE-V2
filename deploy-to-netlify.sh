#!/bin/bash

# Astral Core V2 - Netlify Deployment Script
# This script will deploy the mental health platform to Netlify with all required environment variables

echo "🚀 ASTRAL CORE V2 - NETLIFY DEPLOYMENT SCRIPT"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -d "apps/web" ]; then
    echo "❌ Error: Must run from ASTRAL_CORE_V2 root directory"
    exit 1
fi

echo "📦 Installing Netlify CLI globally..."
npm install -g netlify-cli

echo ""
echo "🔧 Setting up Netlify deployment..."
echo ""

# Navigate to web app directory
cd apps/web

echo "🏗️ Building the application..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Create netlify.toml configuration
echo "📝 Creating Netlify configuration..."

cat > netlify.toml << 'EOF'
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
EOF

echo "✅ Netlify configuration created!"
echo ""

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "🔐 Generated NextAuth secret: $NEXTAUTH_SECRET"
echo ""

# Initialize Netlify site
echo "🌐 Initializing Netlify site..."
echo "Please follow the prompts to connect to your Netlify account:"
echo ""

netlify init

echo ""
echo "🔧 Setting environment variables in Netlify..."
echo ""

# Set required environment variables
netlify env:set DATABASE_URL "postgresql://user:password@localhost:5432/astralcore?schema=public"
netlify env:set NEXTAUTH_URL "https://your-site.netlify.app"
netlify env:set NEXTAUTH_SECRET "$NEXTAUTH_SECRET"
netlify env:set NODE_ENV "production"
netlify env:set ENABLE_AI_THERAPY "true"
netlify env:set ENABLE_CRISIS_CHAT "true"
netlify env:set ENABLE_PEER_SUPPORT "true"
netlify env:set NEXT_PUBLIC_APP_URL "https://your-site.netlify.app"

echo ""
echo "📦 Deploying to Netlify..."
echo ""

# Deploy to Netlify
netlify deploy --prod --build

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "✅ Your Astral Core V2 Mental Health Platform is now live!"
echo ""
echo "📌 Next Steps:"
echo "1. Go to your Netlify dashboard"
echo "2. Navigate to Site Settings > Environment Variables"
echo "3. Update the DATABASE_URL with your actual database"
echo "4. Update NEXTAUTH_URL with your actual site URL"
echo "5. Add any API keys for AI therapy (OPENAI_API_KEY)"
echo ""
echo "🔗 Important URLs:"
echo "- Netlify Dashboard: https://app.netlify.com"
echo "- Your site URL will be shown above"
echo ""
echo "🚨 For Production:"
echo "- Set up PostgreSQL database"
echo "- Configure OAuth providers if needed"
echo "- Add OpenAI API key for AI therapy"
echo "- Test crisis intervention features"
echo ""

# Return to root directory
cd ../..