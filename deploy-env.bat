@echo off
echo ASTRAL CORE V2 - Environment Variables Setup
echo Setting all environment variables automatically...

echo Setting NODE_ENV...
echo production | vercel env add NODE_ENV production

echo Setting NEXT_PUBLIC_APP_NAME...
echo ASTRAL CORE V2 | vercel env add NEXT_PUBLIC_APP_NAME production

echo Setting NEXTAUTH_URL...
echo https://astral-core-v2.vercel.app | vercel env add NEXTAUTH_URL production

echo Setting NEXTAUTH_SECRET...
echo KqStw6FyppSWAylj9btaBfde3ZL3qd0k | vercel env add NEXTAUTH_SECRET production

echo Setting JWT_SECRET...
echo UJElGNGMZBQNV2BJ9TGh92Yvi9nYFgpC | vercel env add JWT_SECRET production

echo Setting ENCRYPTION_KEY...
echo e98c6bddf9136a8c2d5e8b7a4f1c3e2d | vercel env add ENCRYPTION_KEY production

echo Setting DATABASE_URL...
echo postgresql://user:pass@localhost:5432/astral_core | vercel env add DATABASE_URL production

echo Setting Feature Flags...
echo true | vercel env add NEXT_PUBLIC_ENABLE_CRISIS_MODE production
echo true | vercel env add NEXT_PUBLIC_ENABLE_VOLUNTEERS production
echo true | vercel env add NEXT_PUBLIC_ENABLE_AI_SAFETY production
echo true | vercel env add NEXT_PUBLIC_ENABLE_EMERGENCY production

echo Setting Crisis Management...
echo 988 | vercel env add CRISIS_HOTLINE_NUMBER production
echo emergency@astralcore.com | vercel env add EMERGENCY_CONTACT_EMAIL production

echo Setting API Configuration...
echo 1000 | vercel env add API_RATE_LIMIT production
echo 30000 | vercel env add API_TIMEOUT production
echo 10485760 | vercel env add MAX_FILE_SIZE production

echo Setting Security...
echo https://astral-core-v2.vercel.app | vercel env add CORS_ORIGIN production
echo 15 | vercel env add RATE_LIMIT_WINDOW production
echo 100 | vercel env add RATE_LIMIT_MAX production

echo Setting Additional Secrets...
echo V9T1jNTjxHuHjRKrCd313KHh8SN675DB | vercel env add WEBSOCKET_SECRET production
echo c9Lkdu8tKIHbCvvJKTAxjv3yJpyyvLDN | vercel env add WEBHOOK_SECRET production
echo Oga5V5eEplUD5LQN | vercel env add REDIS_PASSWORD production

echo All environment variables set!
echo Starting deployment...
vercel --prod --yes

echo Deployment complete!
pause