# x402scan - XRPL

An x402 ecosystem explorer for the XRP Ledger. Tracks HTTP 402 machine-to-machine payments, provides a block explorer interface, and maintains a Bazaar of pay-per-use APIs.

Built as part of the [x402 protocol](https://github.com/coinbase/x402) ecosystem.

## Architecture

```
x402-xrpl/
├── apps/
│   ├── indexer/       # XRPL transaction indexer (WebSocket + backfill)
│   └── web/           # Next.js explorer frontend + REST API
├── packages/
│   └── database/      # Shared Prisma schema & client
└── docker-compose.yml # PostgreSQL (+ optional full stack)
```

**Indexer** connects to the XRPL WebSocket, monitors all validated `Payment` transactions, detects x402 memos (`MemoType: "x402"`), and records them to PostgreSQL.

**Web** is a Next.js app serving the explorer UI and public REST API. Pages include dashboard, transaction history, merchant profiles, Bazaar catalog, search, and resource registration.

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
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env

# Run and track database migrations
pnpm db:migrate

# Generate Prisma client
pnpm --filter @x402-xrpl/database generate

# Start development
pnpm dev
```

The web app runs at `http://localhost:3000`. The indexer connects to XRPL Testnet by default.

### Seeding Test Data

```bash
pnpm --filter @x402-xrpl/indexer exec ts-node src/test-tx.ts
```

This creates a mock merchant, registers a resource, and submits a real x402 payment on XRPL Testnet.

## REST API

| Endpoint | Description |
|---|---|
| `GET /api/stats` | Network stats (volume, counts, indexer state) |
| `GET /api/transactions?page=1&limit=25` | Paginated transactions, filterable by `merchant` or `buyer` |
| `GET /api/merchants?page=1&limit=25` | Paginated merchant list with counts |
| `GET /api/discovery/resources?limit=20&offset=0` | x402 Bazaar discovery endpoint (spec-compatible) |
| `POST /api/verify` | Verify & register an x402-enabled endpoint |

## x402 on XRPL

The x402 standard is adapted for XRPL using the Memos field on `Payment` transactions:

- **MemoType**: Hex of `"x402"` (`78343032`)
- **MemoData**: Hex-encoded JSON with `res` (resource URL) and optional `req` (request hash)

See `packages/xrpl-x402-standard.md` for the full specification.

## Docker (Full Stack)

```bash
# Database only (default)
docker compose up -d

# Full stack (postgres + web + indexer)
docker compose --profile full up -d
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Database**: PostgreSQL 15 + Prisma ORM
- **Blockchain**: xrpl.js (XRPL WebSocket client)
- **Build**: Turborepo + pnpm workspaces
