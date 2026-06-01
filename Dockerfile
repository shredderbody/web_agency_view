# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
#  Atelier Vitrine — multi-stage build producing a minimal Next.js standalone
#  runtime image. The app serves on port 3010 (project convention).
# ─────────────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS base
# libc6-compat: needed by some native deps (incl. sharp) on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Dependencies (cached layer) ──────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ── Build ────────────────────────────────────────────────────────────────────
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Runner (standalone) ──────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3010 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone server bundle + static assets + public folder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3010
CMD ["node", "server.js"]
