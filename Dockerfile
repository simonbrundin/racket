# Build stage
FROM oven/bun:1-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build

# Intermediate stage: Install production dependencies
FROM oven/bun:1-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN bun install --production

# Production stage
FROM oven/bun:1-distroless AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./app/.next/static
COPY --from=builder /app/public ./app/public
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["bun", "app/server.js"]
