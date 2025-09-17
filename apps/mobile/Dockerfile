# Multi-stage build for ASTRAL_CORE Mobile Application
# React Native with Expo - Build server for mobile app deployment

FROM node:18-alpine AS base
LABEL maintainer="Astral Productions <ops@astralcore.crisis>"
LABEL description="ASTRAL_CORE 2.0 Mobile Application Build Server"
LABEL version="2.0.0"

# Install required packages for React Native and Expo
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    ca-certificates \
    tzdata \
    git \
    bash \
    curl \
    openjdk11-jre \
    android-tools && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1003 -S mobile && \
    adduser -S mobileapp -u 1003

# Set timezone
ENV TZ=UTC

# Enable pnpm and install Expo CLI
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && \
    npm install -g @expo/cli@latest eas-cli@latest

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/*/package.json ./packages/*/

# Install dependencies stage
FROM base AS deps
COPY pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Build stage for mobile assets
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for mobile build
ENV EXPO_USE_LOCAL_CLI=1
ENV EAS_NO_VCS=1

# Pre-build for mobile platforms
RUN cd apps/mobile && \
    expo install && \
    npx expo export --platform web --output-dir dist

# Production stage - serves built mobile web version and build tools
FROM base AS runner
ENV NODE_ENV=production

# Copy built application and tools
COPY --from=builder --chown=mobileapp:mobile /app/apps/mobile/dist ./public
COPY --from=builder --chown=mobileapp:mobile /app/apps/mobile/package.json ./
COPY --from=builder --chown=mobileapp:mobile /app/node_modules ./node_modules

# Create a simple server for mobile web version
RUN echo '#!/usr/bin/env node' > server.js && \
    echo 'const express = require("express");' >> server.js && \
    echo 'const path = require("path");' >> server.js && \
    echo 'const app = express();' >> server.js && \
    echo 'const PORT = process.env.PORT || 3003;' >> server.js && \
    echo 'app.use(express.static("public"));' >> server.js && \
    echo 'app.get("*", (req, res) => {' >> server.js && \
    echo '  res.sendFile(path.join(__dirname, "public", "index.html"));' >> server.js && \
    echo '});' >> server.js && \
    echo 'app.listen(PORT, () => {' >> server.js && \
    echo '  console.log(`Mobile web server running on port ${PORT}`);' >> server.js && \
    echo '});' >> server.js

# Install express for serving
RUN npm install express

# Health check script
RUN echo '#!/usr/bin/env node' > healthcheck.js && \
    echo 'const http = require("http");' >> healthcheck.js && \
    echo 'const PORT = process.env.PORT || 3003;' >> healthcheck.js && \
    echo 'const req = http.request({' >> healthcheck.js && \
    echo '  hostname: "localhost",' >> healthcheck.js && \
    echo '  port: PORT,' >> healthcheck.js && \
    echo '  path: "/",' >> healthcheck.js && \
    echo '  method: "GET",' >> healthcheck.js && \
    echo '  timeout: 5000' >> healthcheck.js && \
    echo '}, (res) => {' >> healthcheck.js && \
    echo '  process.exit(res.statusCode === 200 ? 0 : 1);' >> healthcheck.js && \
    echo '});' >> healthcheck.js && \
    echo 'req.on("error", () => process.exit(1));' >> healthcheck.js && \
    echo 'req.end();' >> healthcheck.js

# Security hardening
RUN chown -R mobileapp:mobile /app && \
    chmod -R 755 /app && \
    find /app -type f -exec chmod 644 {} \; && \
    chmod +x /app/server.js /app/healthcheck.js

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Security: Run as non-root user
USER mobileapp

# Expose mobile web port
EXPOSE 3003

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]