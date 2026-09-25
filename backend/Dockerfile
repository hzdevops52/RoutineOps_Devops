# ──────────────────────────────────────────────
#  Stage 1 — deps
#  Install only production dependencies
# ──────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy manifests first (layer cache: only re-runs npm ci when these change)
COPY package.json package-lock.json ./

# Clean install — production deps only
RUN npm ci --omit=dev --ignore-scripts

# ──────────────────────────────────────────────
#  Stage 2 — production image
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dumb-init from deps stage
COPY --from=deps /usr/bin/dumb-init /usr/bin/dumb-init

# Copy node_modules (prod only) from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src/ ./src/
COPY package.json ./

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Document the port (actual binding controlled by docker-compose)
EXPOSE 5000

# Environment defaults (overridden by docker-compose / CI secrets)
ENV NODE_ENV=production \
    PORT=5000

# dumb-init ensures SIGTERM is forwarded correctly to node
# so docker stop / k8s pod eviction does a clean graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]