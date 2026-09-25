# ──────────────────────────────────────────────
#  Stage 1 — deps
#  Install ALL dependencies (including devDeps needed for build)
# ──────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ──────────────────────────────────────────────
#  Stage 2 — builder
#  Run `next build` — produces .next/standalone
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Re-use installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Build-time env vars (non-secret, baked into the JS bundle)
# Secret values must NOT go here — use runtime env instead
ARG NEXT_PUBLIC_API_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ──────────────────────────────────────────────
#  Stage 3 — runner
#  Minimal image — only the standalone output
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Next.js standalone output bundles its own server.js + node_modules subset
# This keeps the final image lean (often 300 MB → ~100 MB)
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public

USER appuser

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
# standalone output provides its own minimal server
CMD ["node", "server.js"]