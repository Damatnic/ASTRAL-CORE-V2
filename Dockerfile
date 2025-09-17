# ASTRAL CORE V2 - Production Dockerfile
# Multi-stage build for optimized, secure production deployment
# Features: Alpine Linux, non-root user, health checks, minimal attack surface

# =============================================================================
# Base stage - Common dependencies and user setup
# =============================================================================
FROM node:22-alpine AS base

# Create non-root user and group for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install production dependencies only
RUN apk add --no-cache \
    libc6-compat \
    dumb-init && \
    rm -rf /var/cache/apk/*

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# =============================================================================
# Dependencies stage - Install and cache dependencies
# =============================================================================
FROM base AS deps
WORKDIR /app

# Install pnpm for monorepo support
RUN npm install -g pnpm@10.13.1

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json tsconfig.json tsconfig.base.json ./

# Copy all package.json files for workspace
COPY apps/web/package.json ./apps/web/
COPY apps/admin/package.json ./apps/admin/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile --production=false

# Copy source code with proper ownership
COPY --chown=nextjs:nodejs . .

# Build applications with optimizations
RUN --mount=type=cache,target=/app/.pnpm-store,uid=1001,gid=1001 \
    pnpm run build && \
    pnpm prune --prod

# =============================================================================
# Builder stage - Separate build environment
# =============================================================================
FROM deps AS builder

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build is already done in deps stage, just copy the results
COPY --from=deps /app ./

# ============================================================================
# PRODUCTION STAGE - Minimal runtime environment
# ============================================================================
FROM node:22-alpine AS production

# Security hardening - use consistent naming with base stage
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install minimal required packages and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# Install pnpm for monorepo support
RUN npm install -g pnpm@10.13.1

# Set working directory
WORKDIR /app

# Create directory structure with proper ownership
RUN mkdir -p /app/apps/web /app/packages && \
    chown -R nextjs:nodejs /app

# Copy production dependencies and built application
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/server.js ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages/

# Copy configuration files  
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js ./apps/web/

# Ensure proper ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user for security
USER nextjs

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Enhanced health check for production monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init for proper signal handling in containers
ENTRYPOINT ["dumb-init", "--"]

# Start the application with production optimizations
CMD ["node", "apps/web/server.js"]