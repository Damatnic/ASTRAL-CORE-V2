# Multi-stage build for ASTRAL_CORE Admin Dashboard
# Production-ready with enhanced security for administrative interface

FROM node:18-alpine AS base
LABEL maintainer="Astral Productions <ops@astralcore.crisis>"
LABEL description="ASTRAL_CORE 2.0 Admin Dashboard - Crisis Management Interface"
LABEL version="1.0.0"

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    ca-certificates \
    tzdata && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1002 -S admin && \
    adduser -S adminnext -u 1002

# Set timezone
ENV TZ=UTC

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/*/package.json ./packages/*/

# Install dependencies stage
FROM base AS deps
COPY pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the admin application
RUN pnpm build --filter=@astral-core/admin

# Production stage
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder --chown=adminnext:admin /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=adminnext:admin /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=adminnext:admin /app/apps/admin/public ./apps/admin/public

# Copy health check script
COPY --from=builder --chown=adminnext:admin /app/apps/admin/healthcheck.js ./

# Security hardening
RUN chown -R adminnext:admin /app && \
    chmod -R 755 /app && \
    find /app -type f -exec chmod 644 {} \; && \
    chmod +x /app/server.js /app/healthcheck.js

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Security: Run as non-root user
USER adminnext

# Expose admin port
EXPOSE 3002

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]