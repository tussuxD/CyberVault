# CyberVault — Cybersecurity Monitoring Dashboard

An enterprise-grade security operations dashboard inspired by Microsoft Defender and CrowdStrike Falcon. Monitors endpoints, alerts, threat analytics, and system logs in real time.

## Run & Operate

- `pnpm --filter @workspace/cyber-dashboard run dev` — run the frontend (port from `$PORT`, defaults to 5173 locally)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, tsx watch)
- `python src/app.py` (inside `ml-backend/`) — run the Python ML service on port 5000
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: none for local use — `.env` supplies `JWT_SECRET`; Postgres is optional (see below)
- Local env: copy `.env.example` to `.env` in the repo root; the API server loads it automatically

## Local architecture

```
Browser → Vite dev server (:5173)
        └─ /api/*  →  Express API (:8080)  →  Postgres
                                    └─ /api/ml/*  →  Flask ML service (:5000)  →  SQLite + Random Forest models
```

The browser only ever talks to one origin. `vite.config.ts` proxies `/api` to the
Express server (override with `VITE_API_PROXY_TARGET`), and `artifacts/api-server/src/routes/ml.ts`
forwards `/api/ml/*` to Flask (`ML_SERVICE_URL`, default `http://127.0.0.1:5000`).

The API server uses `DATABASE_URL` when set. Otherwise it starts an embedded
Postgres (PGlite) at `.data/pglite`, creates the schema from
`lib/db/src/embedded-schema.ts`, and seeds demo data automatically.

Trained model files live in `ml-backend/models/` and `ml-backend/dataset/processed/`
(see `ml-backend/README.md`). The service boots even when artifacts are missing
and reports exactly which ones are absent via `/api/ml/health`.

## Demo Credentials

- **Email:** `admin@cybershield.io`
- **Password:** `password`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend:** React 19 + Vite + Wouter (routing) + TanStack Query + Tailwind CSS v4 + Recharts + Framer Motion + lucide-react
- **Backend:** Express 5 + Drizzle ORM + PostgreSQL + Socket.io (live metrics every 10s) + JWT + bcryptjs
- **Codegen:** Orval from `lib/api-spec/openapi.yaml` → React Query hooks (`lib/api-client-react`) + Zod schemas (`lib/api-zod`)
- Build: esbuild (CJS bundle for API)

## Where things live

| Package | Path | Purpose |
|---|---|---|
| Frontend | `artifacts/cyber-dashboard/` | React + Vite app, all pages |
| API Server | `artifacts/api-server/` | Express 5 REST API + Socket.io |
| DB Schema | `lib/db/src/schema/` | 7 Drizzle table files |
| OpenAPI Spec | `lib/api-spec/openapi.yaml` | Source of truth for API contract |
| Generated Hooks | `lib/api-client-react/` | Orval-generated TanStack Query hooks |
| Generated Zod | `lib/api-zod/` | Orval-generated Zod schemas |
| Seed Script | `lib/db/src/seed.ts` | Demo data seeder |

## Pages

| Route | Page |
|---|---|
| `/` | Landing (cinematic hero) |
| `/login` | Secure Access Portal |
| `/register` | Register |
| `/forgot-password` | Password reset |
| `/dashboard` | Overview — stats, charts |
| `/devices` | Endpoint Fleet — DataTable with sorting/pagination |
| `/alerts` | Alerts — severity counts, resolve inline |
| `/analytics` | Threat heatmap + cross-referenced charts |
| `/logs` | Terminal-aesthetic system log viewer |
| `/detection` | Live ML detection — model status, flow analysis, ML alerts |
| `/settings` | App settings |
| `/profile` | User profile |

## Architecture decisions

- **React + Vite instead of Angular** — Replit's artifact system only supports React/Vite for web artifacts; Angular cannot bind to `$PORT`.
- **Orval codegen** — All API calls go through generated hooks in `lib/api-client-react`; never call `fetch` directly in pages.
- **Tailwind v4 `@apply` limitations** — v4 does not support opacity modifier syntax (`border-primary/10`) inside `@apply`; use plain CSS or inline styles instead.
- **`sortKey` on DataTable columns** — `Column<T>.accessor` is overloaded as either a string key or a render function. When a column needs both a custom renderer and a server sort key, set `sortKey` (string) separately and `accessor` as the function; `DataTable` uses `sortKey` for sort click dispatch.
- **Socket.io live metrics** — API server emits `metrics` events every 10 seconds; dashboard subscribes for real-time updates without polling.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `lucide-react` v0.545.0 does **not** export `BellAlert` — use `BellRing` instead.
- Tailwind v4: `@custom-variant dark` is not supported; add `class="dark"` to `<html>` and target it with standard selectors.
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` before touching frontend pages.
- `req.params.id` in Express 5 with TypeScript is typed as `string | string[]` — cast with `String()`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
