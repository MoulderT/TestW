# syntax=docker/dockerfile:1
# Build from repository root: docker compose uses context: .
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps ./apps

# ECONNRESET / flaky registry: retries + longer timeouts; npm cache survives rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

RUN npm run prisma:generate -w api
RUN npm run build -w api

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Prisma engines + migrate need OpenSSL; slim image ships without a full match otherwise
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
# Prisma CLI + client live under the workspace package (not hoisted to root in this repo)
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3001
WORKDIR /app/apps/api
# Local prisma@6 from apps/api/node_modules — never bare `npx prisma` (can fetch Prisma 7)
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main.js"]
