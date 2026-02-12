# ============================================
# Stage 1: Install dependencies
# ============================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN bun install --frozen-lockfile

# ============================================
# Stage 2: Generate Prisma client
# ============================================
FROM oven/bun:1-alpine AS prisma

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN bun --bun run prisma generate

# ============================================
# Stage 3: Build the application
# ============================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/lib/generated/prisma ./lib/generated/prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN bun --bun run build

# ============================================
# Stage 4: Production runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema (needed at runtime for migrations)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy generated Prisma client
COPY --from=prisma --chown=nextjs:nodejs /app/lib/generated/prisma ./lib/generated/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
