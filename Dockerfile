# Build stage
FROM node:20-slim AS builder
WORKDIR /app
# Installera Bun 
RUN apt-get update && apt-get install -y --no-install-recommends \
  curl ca-certificates unzip \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
# Bygg
COPY package*.json ./
RUN bun install 
COPY . .
RUN bun run build

# Production stage
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./app/.next/static
COPY --from=builder /app/public ./app/public
EXPOSE 3000
CMD ["server.js"]
