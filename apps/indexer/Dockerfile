FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/indexer/package.json ./apps/indexer/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/indexer/node_modules ./apps/indexer/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY . .
RUN pnpm --filter @x402-xrpl/database generate
RUN pnpm --filter @x402-xrpl/indexer build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/packages/database ./packages/database
RUN sed -i 's/"main": "index.ts"/"main": "dist\/index.js"/' packages/database/package.json
COPY --from=builder /app/apps/indexer/dist ./apps/indexer/dist
COPY --from=builder /app/apps/indexer/node_modules ./apps/indexer/node_modules
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "apps/indexer/dist/index.js"]
