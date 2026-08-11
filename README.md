# Mini ERP + CRM Operations Portal

A small ERP/CRM system for a wholesale/distribution company — customers, products/inventory, and sales challans, with role-based access for Admin, Sales, Warehouse, and Accounts users.

## Architecture Summary

**Backend**: Node.js + TypeScript + Express, using Prisma as the ORM against PostgreSQL. Authentication is JWT-based — on login the server issues a signed token containing the user's ID and role, which the frontend attaches to every subsequent request. Two middleware layers guard routes: `requireAuth` checks the token is valid, `requireRole` checks the user's role is allowed to hit that specific endpoint.

**Business logic**: the sales challan flow is the core of the system. Confirming a challan (or creating one directly as Confirmed) runs inside a single Prisma `$transaction`: every line item's stock is checked *before* anything is written, and only if every item has enough stock does the transaction deduct stock and write audit-log entries (`StockMovement` rows). If any item is short, the entire transaction throws and rolls back — so a challan can never be "half confirmed" with some products deducted and others not, and stock can never go negative even under concurrent requests. Each `ChallanItem` also stores a **snapshot** of the product's name, SKU, and price at the time of sale, so historical challans stay accurate even if a product is later renamed or repriced.

**Frontend**: React + TypeScript + Vite, styled with Tailwind CSS. A React Context (`AuthContext`) holds the logged-in user and exposes `login`/`logout`; an Axios instance automatically attaches the JWT to every request and redirects to `/login` if the server ever responds with 401. Routes are grouped under a shared sidebar/topbar layout, with a `ProtectedRoute` wrapper that redirects unauthenticated users.

## Folder Structure

```
erp-crm/
├── backend/       — Express API server
└── frontend/      — React admin UI
```

## Local Setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database — easiest option is a free one at [neon.tech](https://neon.tech) (no local Postgres install needed)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — paste your Neon (or other Postgres) connection string
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -base64 32`)
- `PORT` — 4000 is fine for local dev
- `CORS_ORIGIN` — `http://localhost:5173` (the Vite dev server's default URL)

Then:

```bash
npx prisma generate        # generates the typed Prisma client from schema.prisma
npx prisma migrate dev --name init   # creates the actual tables in your database
npm run seed                # creates 4 test users, one per role — prints their credentials
npm run dev                 # starts the API on http://localhost:4000
```

> Note: `npx prisma generate` needs to download a small binary from Prisma's servers on first run. If it fails in a restricted network environment, it will work normally on a regular machine/laptop with internet access.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should have `VITE_API_URL="http://localhost:4000"` (matches the backend's local port).

```bash
npm run dev
```

Visit the URL Vite prints (typically `http://localhost:5173`) and log in with one of the seeded accounts.

## Test Credentials (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@erp.test | Admin@123 |
| Sales | sales@erp.test | Sales@123 |
| Warehouse | warehouse@erp.test | Warehouse@123 |
| Accounts | accounts@erp.test | Accounts@123 |

## Environment Variables

**Backend (`backend/.env`)**
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key used to sign/verify login tokens |
| `PORT` | Port the API listens on |
| `CORS_ORIGIN` | Which frontend origin is allowed to call this API |

**Frontend (`frontend/.env`)**
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Deployment

**Database — Neon**
1. Create a project at neon.tech, copy the pooled connection string.

**Backend — Render**
1. New Web Service → connect the GitHub repo → root directory `backend/`.
2. Build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
3. Start command: `npm start`
4. Environment variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (fill this in after the frontend is deployed, see below).
5. After first deploy, run `npm run seed` once via Render's shell to create the test users.

**Frontend — Vercel**
1. Import the repo → root directory `frontend/`.
2. Environment variable: `VITE_API_URL` = your Render backend's URL.
3. Deploy, then go back to Render and set `CORS_ORIGIN` to the resulting Vercel URL, and redeploy the backend so it accepts requests from it.

## API Overview

All routes except `/auth/login` require `Authorization: Bearer <token>`.

```
POST   /auth/login

POST   /customers                    (Admin, Sales)
GET    /customers                    ?search=&status=&type=&page=&limit=
GET    /customers/:id
PUT    /customers/:id                (Admin, Sales)
POST   /customers/:id/notes          (Admin, Sales)

POST   /products                     (Admin, Warehouse)
GET    /products                     ?search=&category=&page=&limit=
GET    /products/:id
PUT    /products/:id                 (Admin, Warehouse)
POST   /products/:id/stock           (Admin, Warehouse) — { quantity, type: IN|OUT, reason }
GET    /products/:id/movements

POST   /challans                     (Sales, Admin) — { customerId, items[], status: Draft|Confirmed }
GET    /challans                     ?status=&customerId=&page=&limit=
GET    /challans/:id
PATCH  /challans/:id/confirm         (Sales, Admin)
PATCH  /challans/:id/cancel          (Sales, Admin)
```

A Postman collection covering all of the above is at `docs/postman_collection.json` — import it into Postman and set the `baseUrl` and `token` collection variables.

## Assumptions Made

- Challan numbers follow the pattern `CH-YYYYMMDD-NNNN`, reset daily, generated inside the same database transaction as challan creation to avoid duplicates under concurrent requests.
- A challan can be created directly as `Confirmed` (stock deducted immediately) or as `Draft` (no stock impact until later confirmed).
- Stock movements are treated as an append-only audit log — they are never edited or deleted; `Product.currentStock` is the running total.
- `FollowUpNote` is a separate table (not a single field on `Customer`) so follow-up history accumulates instead of being overwritten.

## Known Limitations

- Cancelling an already-**Confirmed** challan does not currently reverse the stock deduction — the API returns a clear error explaining this rather than silently doing nothing. A production version would add a stock-reversal transaction here.
- No automated test suite (unit/integration tests) — given the time constraint, manual verification via the Postman collection and the UI was prioritized instead.
- No invoice PDF export, no AWS S3 image upload, no Docker/CI setup — these were listed as bonus items in the brief and were deprioritized in favor of getting the core modules fully correct.
- Customer/product dropdowns in the challan creation form are plain `<select>` elements, which will get unwieldy with very large datasets — a searchable async select would be the next improvement.
- No automated debounce on the customer/product search inputs — each keystroke triggers a new API call. Fine for a small dataset/demo; would add debouncing for production.
