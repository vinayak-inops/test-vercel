# Stage 1: Dependencies
FROM node:20.17.0-alpine3.19 AS deps

# Add metadata labels
LABEL mustertainer="vinayak@inops.tech"
LABEL description="INops muster Application"
LABEL version="1.0"

# Set working directory
WORKDIR /app

# Add build arguments for resource control
ARG NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_OPTIONS=${NODE_OPTIONS}

# Copy package files
COPY package.json package-lock.json ./
COPY apps/muster/package.json ./apps/muster/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/store/package.json ./packages/store/package.json

# Install dependencies
RUN npm install -g npm@11.4.2
RUN npm ci --frozen-lockfile --prefer-offline --no-audit

# Stage 2: Builder
FROM node:20.17.0-alpine3.19 AS builder

# Set working directory
WORKDIR /app

# Set build arguments for resource control
ARG NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_OPTIONS=${NODE_OPTIONS}
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy necessary files for build
COPY turbo.json ./
COPY apps/muster ./apps/muster
COPY packages ./packages

# Build the muster application
RUN cd apps/muster && npm run build

# Stage 3: Runner
FROM node:20.17.0-alpine3.19 AS runner

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3006

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Copy only necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/muster ./apps/muster
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3006

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider --no-check-certificate http://173.65.7.58:3006/muster/api/health || exit 1

# Start the application
CMD ["npm", "run", "start", "--prefix", "apps/muster"] 