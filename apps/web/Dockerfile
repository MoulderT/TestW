# syntax=docker/dockerfile:1
# Build from repository root: docker compose uses context: .
FROM node:20-bookworm-slim AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ARG NEXT_PUBLIC_LOKI_URL=http://localhost:3100
ARG NEXT_PUBLIC_PROMETHEUS_URL=http://localhost:9090
ARG NEXT_PUBLIC_METRICS_URL=http://localhost:3001/metrics
ARG GRAFANA_INTERNAL_URL=http://grafana:3000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_LOKI_URL=$NEXT_PUBLIC_LOKI_URL
ENV NEXT_PUBLIC_PROMETHEUS_URL=$NEXT_PUBLIC_PROMETHEUS_URL
ENV NEXT_PUBLIC_METRICS_URL=$NEXT_PUBLIC_METRICS_URL
ENV GRAFANA_INTERNAL_URL=$GRAFANA_INTERNAL_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY apps ./apps

RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci
RUN npm run build -w web

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
