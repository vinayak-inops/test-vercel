# Stage 1: Dependencies
FROM node:20.17.0-alpine3.19 AS deps

# Add metadata labels
LABEL maintainer="vinayak@inops.tech"
LABEL description="INops Main Application"
LABEL version="1.0"

# Set working directory
WORKDIR /app

# Add build arguments for resource control
ARG NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_OPTIONS=${NODE_OPTIONS}

# Install specific npm version and turbo
RUN npm install -g npm@11.1.0 turbo

# Copy root package files
COPY package.json package-lock.json ./
COPY turbo.json ./

# Copy all workspace package files
COPY apps/main/package.json ./apps/main/
COPY packages/ui/package.json ./packages/ui/
COPY packages/store/package.json ./packages/store/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN npm install --prefer-offline --no-audit

# Stage 2: Builder
FROM node:20.17.0-alpine3.19 AS builder

# Set working directory
WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    DOCKER_ENV=true

# Set build arguments for resource control
ARG NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_OPTIONS=${NODE_OPTIONS}

# Install specific npm version and turbo
RUN npm install -g npm@11.1.0 turbo

# Copy dependencies and workspace configuration
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/turbo.json ./

# Copy source code more efficiently
COPY apps/main ./apps/main
COPY packages ./packages

# Build the application using turbo with proper dependency order
RUN turbo run build --filter=main...

# Stage 3: Runner
FROM node:20.17.0-alpine3.19 AS runner

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    NEXT_PUBLIC_API_BASE_URL=http://173.65.7.58:8000 \
    APP_NAME="INops Main App" \
    APP_VERSION=1.0.0 \
    NEXTAUTH_URL=http://173.65.7.58:3000 \
    NEXTAUTH_SECRET="Mj1iWKga9CcSzq1M8Nm65Kl36NtYKyoGwU5jHb0NYzM="

# Create directory for env file
RUN mkdir -p /app/apps/main

# Copy .env file
COPY --chown=nextjs:nodejs apps/main/.env /app/apps/main/.env

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Copy only necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/turbo.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/main/.next ./apps/main/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/main/public ./apps/main/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/main/package.json ./apps/main/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# Create directory for secrets (Docker secrets are mounted here)
# RUN mkdir -p /run/secrets && chown nextjs:nodejs /run/secrets

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add healthcheck (matching docker-compose)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://173.65.7.58:3000/main/api/health || exit 1

# Start the application with environment variables from secrets
CMD sh -c '\
    npm run start --prefix apps/main'