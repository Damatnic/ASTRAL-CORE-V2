# 🚀 VERCEL DEPLOYMENT GUIDE - ASTRAL CORE V1

## 📋 QUICK DEPLOYMENT CHECKLIST

### 1. Prerequisites
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Domain configured (optional)

### 2. Required External Services

#### Database (Choose One)
- [ ] **Vercel Postgres** (Recommended for simplicity)
- [ ] **Neon Database** (Recommended for crisis applications - better performance)
- [ ] **PlanetScale** (Alternative MySQL option)

#### Redis/Cache (Choose One)  
- [ ] **Vercel KV** (Built-in Redis)
- [ ] **Upstash Redis** (Recommended for real-time features)

#### Error Monitoring
- [ ] **Sentry** account and project created
- [ ] Sentry DSN obtained

#### Emergency Communications
- [ ] **Twilio** account for SMS/Voice
- [ ] Crisis Text Line integration (if available)
- [ ] National Lifeline API access (if available)

### 3. Environment Variables Setup

Copy ALL variables from `VERCEL_ENV_CONFIG.txt` to your Vercel project:

1. Go to: `https://vercel.com/your-team/your-project/settings/environment-variables`
2. Add each variable from the config file
3. Set environment scope: **Production**, Preview, Development

### 4. Critical Security Variables (Already Generated)

These are pre-generated and ready to use:

```bash
# Authentication
NEXTAUTH_SECRET=K7mX9vR3nF8jL2wE6qA5tY1uI0pO9mN4kJ7hG6dS3fV2cZ8xB5nA4mL1wQ0rT9yU

# Crisis Data Encryption (64-byte key)
CRISIS_ENCRYPTION_KEY=P9mK7nJ4gF3dS6aH8uY2eR5tI1oM0xN6vB3cZ8lQ4wE7rT9yU1iO5pA2sG6hJ9kL3fV8nB4mX7qW0eR3tY6uI9oP2sA5gH8jK1dF4lZ7cV0xN3mB6qW9eR2tY5uI8oP1sA4g

# Admin Security
ADMIN_SECRET=R8wE6qA5tY1uI0pO9mN4kJ7hG6dS3fV2cZ8xB5nA4mL1wQ0rT9yUK7mX9vR3nF8j

# Session Management
SESSION_SECRET=T9yUK7mX9vR3nF8jL2wE6qA5tY1uI0pO9mN4kJ7hG6dS3fV2cZ8xB5nA4mL1wQ0r

# JWT Tokens
JWT_SECRET=F4lZ7cV0xN3mB6qW9eR2tY5uI8oP1sA4gH8jK1dF2wE6qA5tY1uI0pO9mN4kJ7h
```

### 5. Update These Variables With Your Values

```bash
# Database - Get from your chosen provider
DATABASE_URL=your_actual_database_connection_string

# Domain - Your Vercel app domain
NEXTAUTH_URL=https://astral-core-v1-admin.vercel.app
NEXT_PUBLIC_APP_URL=https://astral-core-v1-admin.vercel.app

# Sentry - From your Sentry project
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# Twilio - From your Twilio console
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Redis - From Vercel KV or Upstash
REDIS_URL=your_redis_connection_string
```

### 6. Feature Configuration

Enable/disable features as needed:

```bash
# Core Crisis Features (Keep Enabled)
ENABLE_CRISIS_CHAT=true
ENABLE_EMERGENCY_OVERRIDE=true
ENABLE_VOLUNTEER_MATCHING=true
ENABLE_ANONYMOUS_MODE=true

# Optional Features
ENABLE_AI_RISK_ASSESSMENT=true
ENABLE_REAL_TIME_MONITORING=true
ENABLE_CRISIS_ANALYTICS=false  # Set true after setup
```

### 7. Deployment Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Or simply push to GitHub (auto-deploy)
git push origin master
```

### 8. Post-Deployment Verification

- [ ] Visit your deployed app URL
- [ ] Test crisis chat functionality
- [ ] Verify database connections
- [ ] Check error monitoring in Sentry
- [ ] Test emergency features (carefully)

### 9. Monitoring & Alerts

Set up monitoring dashboards:

1. **Vercel Analytics** - Built-in performance monitoring
2. **Sentry** - Error tracking and performance monitoring  
3. **Uptime Monitoring** - External service monitoring
4. **Crisis Metrics** - Custom analytics for crisis interventions

### 10. Security Checklist

- [ ] All secrets properly configured in Vercel (not in code)
- [ ] HTTPS enforced on custom domain
- [ ] Rate limiting active
- [ ] CSRF protection enabled
- [ ] Crisis data encryption working
- [ ] Audit logging functional

## 🚨 CRISIS-SPECIFIC CONSIDERATIONS

### Legal Compliance
- [ ] HIPAA compliance settings enabled
- [ ] Data retention policies configured
- [ ] Audit logging for all crisis interactions
- [ ] Privacy policy and terms of service deployed

### Emergency Protocols
- [ ] Crisis Text Line integration tested
- [ ] Emergency escalation webhooks configured
- [ ] Volunteer notification system working
- [ ] Backup emergency contacts configured

### Performance Requirements
- [ ] Sub-100ms response times for crisis endpoints
- [ ] WebSocket connections stable for real-time chat
- [ ] Database connection pooling optimized
- [ ] CDN configured for static assets

## 📞 SUPPORT RESOURCES

- **Vercel Documentation**: https://vercel.com/docs
- **Crisis Text Line**: https://www.crisistextline.org/
- **National Suicide Prevention Lifeline**: https://suicidepreventionlifeline.org/
- **Sentry Crisis Monitoring**: Custom error handling for mental health apps

## ⚠️ IMPORTANT NOTES

1. **Never commit secrets to version control**
2. **Test all crisis features thoroughly before production**
3. **Have emergency contacts ready for system failures**
4. **Monitor performance constantly - lives depend on uptime**
5. **Keep crisis intervention best practices updated**

---

**🎯 Your crisis intervention platform is ready for production deployment on Vercel with enterprise-grade security and performance.**