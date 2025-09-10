# Steg 1: Byggstadium med full Bun image
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
RUN bun run build

# Steg 2: Minimal runtime image baserad på Alpine
FROM alpine:latest AS runtime
RUN apk add --no-cache libstdc++ libgcc

WORKDIR /app

# Kopiera Bun binären från build image
COPY --from=build /usr/local/bin/bun /usr/local/bin/bun

# Kopiera byggresultatet
COPY --from=build /app/.output /app

# Sätt rättigheter (om nödvändigt)
RUN chmod +x /usr/local/bin/bun

EXPOSE 3000

CMD ["bun", "run", "/app/server/index.mjs"]
