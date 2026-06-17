# x402scan - XRPL

An x402 ecosystem explorer for the XRP Ledger. Tracks HTTP 402 machine-to-machine payments, provides a block explorer interface, and maintains a Agora of pay-per-use APIs.

Built as part of the [x402 protocol](https://github.com/coinbase/x402) ecosystem.

## Architecture

```
x402-xrpl/
├── apps/
│   ├── indexer/       # XRPL transaction indexer (WebSocket + backfill)
│   ├── api/           # Express REST API for explorer data, registration, admin
│   └── web/           # Next.js explorer frontend
├── packages/
│   └── database/      # Shared Prisma schema & client
└── docker-compose.yml # PostgreSQL (+ optional full stack)
```

**Indexer** connects to XRPL WebSocket nodes, monitors validated `Payment` transactions, detects x402 payments by known facilitator `SourceTag` values, and records them to PostgreSQL.

**API** is an Express service serving the public explorer API, resource verification and registration, and protected admin analytics.

**Web** is a Next.js app serving the explorer UI and same-origin API proxies where the browser should not call the API service directly. Pages include dashboard, transaction history, merchant profiles, Agora catalog, search, and resource registration.

**Database** is a shared Prisma package exporting the client and types for both apps.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for PostgreSQL)

### Setup

```bash
# Clone and install
git clone <repo-url> && cd x402-xrpl
pnpm install

# Start PostgreSQL
docker compose up -d

# Copy environment files
cp apps/indexer/.env.example apps/indexer/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env

# Run and track database migrations
pnpm db:migrate

# Generate Prisma client
pnpm --filter @x402-xrpl/database generate

# Start development
pnpm dev
```

The web app runs at `http://localhost:3000`, and the API runs at `http://localhost:4001`. The production defaults target XRPL Mainnet; set `XRPL_WSS` and `NEXT_PUBLIC_XRPL_NETWORK` explicitly for testnet/devnet work.

### Seeding Test Data

```bash
pnpm --filter @x402-xrpl/indexer exec ts-node src/test-tx.ts
```

This creates a mock merchant, registers a resource, and submits a real x402 payment on XRPL Testnet.

## REST API

| Endpoint | Description |
|---|---|
| `GET /stats` | Network stats (volume, counts, indexer state) |
| `GET /dashboard` | Dashboard snapshot with recent transactions/resources and top merchants |
| `GET /transactions?page=1&limit=25` | Paginated transactions, filterable by `merchant` or `buyer` |
| `GET /merchants?page=1&limit=25` | Paginated merchant list with counts |
| `GET /discovery/resources?limit=20&offset=0` | x402 Agora discovery endpoint (spec-compatible) |
| `POST /verify` | Verify & register an x402-enabled endpoint |
| `POST /admin/login` | Issue a short-lived admin session token when admin env vars are configured |
| `GET /admin/stats` | Protected admin analytics; requires `Authorization: Bearer <token>` |

## x402 on XRPL

The current XRPL x402 detection path uses facilitator SourceTags on `Payment` transactions:

- **SourceTag**: Facilitator identifier registered in the `FacilitatorTag` table.
- **InvoiceID**: Optional invoice hash used for replay protection.
- **MemoData**: Optional invoice binding/debug data, stored as `rawMemo` when present.

See `packages/xrpl-x402-standard.md` for the full specification.

## Docker (Full Stack)

```bash
# Database only (default)
docker compose up -d

# Full stack (postgres + api + web + indexer)
docker compose --profile full up -d
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Database**: PostgreSQL 15 + Prisma ORM
- **Blockchain**: xrpl.js (XRPL WebSocket client)
- **Build**: Turborepo + pnpm workspaces
