#!/bin/bash

# Automated Netlify deployment script
echo "Starting automated Netlify deployment..."

# Generate a unique site name
SITE_NAME="astral-core-v2-$(date +%s)"
echo "Creating site: $SITE_NAME"

# Create the site via API (this requires authentication)
netlify sites:create --name "$SITE_NAME" --manual

# Link the site to this directory
netlify link --name "$SITE_NAME"

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set environment variables
echo "Setting environment variables..."
netlify env:set DATABASE_URL "postgresql://localhost:5432/astralcore"
netlify env:set NEXTAUTH_URL "https://$SITE_NAME.netlify.app"  
netlify env:set NEXTAUTH_SECRET "$NEXTAUTH_SECRET"
netlify env:set NODE_ENV "production"
netlify env:set ENABLE_AI_THERAPY "true"
netlify env:set ENABLE_CRISIS_CHAT "true"
netlify env:set ENABLE_PEER_SUPPORT "true"
netlify env:set NEXT_PUBLIC_APP_URL "https://$SITE_NAME.netlify.app"

# Deploy to production
echo "Deploying to production..."
netlify deploy --prod --dir=.next --message="Production deployment of Astral Core V2"

echo "Deployment complete!"
echo "Your site is live at: https://$SITE_NAME.netlify.app"