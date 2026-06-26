# Staging environment

A fully isolated staging stack for the x402-xrpl backend, used to validate the XRPL AI hub
relaunch before any production rollout. **Production stays gated until all parties are ready** —
nothing here deploys to or mutates production.

## What's isolated

The staging stack (`docker-compose.staging.yml`, compose project `x402xrpl-staging`) runs its own:

| Resource | Default stack | Staging stack |
|---|---|---|
| Compose project | `x402-xrpl` | `x402xrpl-staging` |
| Postgres database | `x402_xrpl` | `x402_xrpl_staging` |
| Postgres volume | `postgres_data` | `postgres_staging_data` |
| DB host port | 5432 | **5433** |
| API host port | 4001 | **4101** |
| Indexer health port | 4000 | **4100** |
| Web host port (optional) | 3000 | **3100** |

Because the database and volume are separate, staging never reads or writes production data.

## Backend: bring staging up

Prerequisites: Docker, pnpm.

```bash
# 1. Configure staging (secrets stay local — .env.staging is gitignored)
cp .env.staging.example .env.staging
#    edit .env.staging: set POSTGRES_PASSWORD, ADMIN_PASSWORD, ADMIN_SESSION_SECRET

# 2. Build + start postgres + api + indexer
pnpm staging:up

# 3. Apply the Prisma schema to the staging database (host port 5433)
DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5433/x402_xrpl_staging" pnpm staging:db:push

# 4. Tail logs / check health
pnpm staging:logs
curl http://localhost:4101/stats        # api
curl http://localhost:4100/             # indexer health

# Stop (keeps the volume/data)
pnpm staging:down
```

The indexer defaults to **XRPL mainnet** (`wss://s1.ripple.com:51233`) so the Index shows realistic
data. Switch to testnet by setting `STAGING_XRPL_WSS=wss://s.altnet.rippletest.net:51233` in
`.env.staging`. The schema iterates fast during the relaunch, so `prisma db push` (not migrations)
is the staging workflow; re-run `pnpm staging:db:push` whenever the schema changes.

### Optional: run the frontend in staging too

The frontend normally lives on a Vercel preview (below). To run a self-contained web container as well:

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml --profile with-web up -d --build
# web at http://localhost:3100
```

## Frontend: Vercel preview

The frontend is **not** deployed to a `staging` git branch. All relaunch work lives on a single dev
branch (`feat/xrpl-ai-hub-relaunch`); Vercel auto-creates a temporary preview URL for that branch.

To make the preview talk to the staging backend, set the preview-scoped env var in Vercel:

- **`API_URL`** → the public URL of the staging API (e.g. `https://staging-api.xrpl-ai.org`).
  `apps/web` reads `API_URL` server-side ([apps/web/src/app/lib/api.ts](apps/web/src/app/lib/api.ts)).
- **`NEXT_PUBLIC_XRPL_NETWORK`** → `mainnet` (or `testnet`), to match the indexer's network.

Set these in Vercel → Project → Settings → Environment Variables, scoped to **Preview** (and/or this
branch), so production env stays untouched.

## Deploying the staging backend to a host

`docker-compose.staging.yml` is host-agnostic. To give the Vercel preview a reachable API:

1. Run the stack on a server/VM (`pnpm staging:up`) and expose the api port (4101) behind TLS at a
   stable hostname (e.g. `staging-api.xrpl-ai.org`).
2. Or adapt it to the private k8s setup as a separate `staging` namespace/overlay (the prod manifests
   are intentionally kept out of this public repo).

Point Vercel's preview `API_URL` at that hostname.

## Production

Production rollout is **deliberately gated** on all parties being ready and is **not** automated from
this branch. Promote only after staging sign-off.
