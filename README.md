# Strata

> ⚠ **Simulation for coursework — not a real bank.** Strata is a university
> coursework prototype that models the UI and interaction flows of an online banking
> dashboard. It does **not** connect to any real bank, payment processor, or financial
> network. All accounts, balances, and transactions are seeded demo data. No real money
> or personal data is involved anywhere in this project.

## What this is

A self-contained Next.js app that demonstrates:

**Customer side**

- Landing page + simulated login flow
- Dashboard with an account balance, a 30-day balance trend chart, and recent
  transaction history
- "Transfer money" flow that debits/credits seeded demo accounts (or simulates an
  external transfer) — all backed by PostgreSQL
- Virtual cards page: issue Visa/Mastercard, reveal card details, freeze/unfreeze
- In-app notifications (bell + unread badge on every page, mark-read, mark-all-read)
- Support chat: open tickets, chat-style conversation with the (simulated) support team

**Admin side** (separate role, gated by middleware)

- Overview dashboard: customer count, deposits under management, transaction count,
  open ticket count, live activity feed
- Users: list all customers, drill into one to see balance, transaction history, cards,
  and support threads
- Balance adjustments: credit/debit any account with an audit-trail Transaction row and
  a notification + email to the customer
- Send message: create an in-app notification, optionally trigger an email
- Support inbox: reply to customer conversations, mark resolved / reopen

This project was built as a coursework exercise in full-stack web development
(authentication, relational data modeling, server actions/API routes, and UI design).

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + shadcn/ui-style components
- [Prisma](https://www.prisma.io/) ORM with **PostgreSQL**
- [NextAuth.js](https://next-auth.js.org/) (Credentials provider) for simulated login
- [Recharts](https://recharts.org/) for the balance chart
- [next-themes](https://github.com/pacocoursey/next-themes) for dark mode
- [Resend](https://resend.com/) for optional real email delivery (falls back to
  server-console logging when no API key is configured)

## Running it locally

You need a running PostgreSQL instance. The easiest way is Docker:

```bash
docker run --name strata-pg -e POSTGRES_USER=strata -e POSTGRES_PASSWORD=strata \
  -e POSTGRES_DB=strata -p 5432:5432 -d postgres:16
```

Then, from the project folder:

```bash
cp .env.example .env
# Edit .env if your Postgres connection differs from the default
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with any demo credential
(see below).

## Demo credentials

The seed script creates three demo customer users plus one administrator:

| Email               | Password    | Role     | Starting balance |
| ------------------- | ----------- | -------- | ----------------- |
| `alice@demo.test`   | `demo1234`  | Customer | $12,450.75         |
| `bob@demo.test`     | `demo1234`  | Customer | $3,208.10          |
| `carol@demo.test`   | `demo1234`  | Customer | $47,900.00         |
| `admin@demo.test`   | `admin1234` | Admin    | —                  |

The login page shows both a customer and an admin credential in a "Demo credentials"
panel, with one-click auto-fill buttons for each, so a grader can try either flow
without leaving the page. Admins are redirected to `/admin` after signing in;
customers land on `/dashboard`.

Each customer account is seeded with 15–20 past transactions (salary, rent, groceries,
coffee, bills, etc.), one active Visa (Alice also has a frozen Mastercard), three
notifications, and one open support thread — enough seeded state to explore every
feature without additional setup.

## Enabling real email (optional)

Admin-sent messages and support replies send email via [Resend](https://resend.com).
If `RESEND_API_KEY` is unset, they are written to the server console instead —
convenient for local development and for a fresh Vercel deploy. To enable real
delivery:

1. Sign up at <https://resend.com> (free tier), grab an API key.
2. Add `RESEND_API_KEY` (and optionally `EMAIL_FROM`) to your `.env` locally, or as
   Vercel env vars in production.
3. Redeploy / restart. That's it — no code change needed.

## Deploying to Vercel

Vercel + a hosted Postgres is the recommended production-ish setup. Step by step:

### 1. Push this repo to GitHub

If you haven't already:

```bash
git init
git add -A
git commit -m "Initial commit: Strata"
# create an empty repo at https://github.com/new (e.g. named "strata"),
# then wire it up:
git remote add origin https://github.com/<your-username>/strata.git
git branch -M main
git push -u origin main
```

### 2. Import the repo into Vercel

1. Go to <https://vercel.com/new>.
2. Sign in with GitHub, authorize Vercel to access your repos.
3. Pick the `strata` repo → **Import**.
4. The framework is auto-detected as **Next.js** — leave build/output settings default.
5. **Don't click Deploy yet** — add env vars first (next step).

### 3. Provision a Postgres database

Easiest path is Vercel's first-party integration:

1. In the project's **Storage** tab (or the "Add Database" prompt during import),
   choose **Postgres** (or Neon / Supabase — any Postgres URL works).
2. Vercel will create it and automatically inject a `DATABASE_URL` env var into
   your project. Confirm it appears under **Settings → Environment Variables**.

### 4. Add the remaining environment variables

Under **Settings → Environment Variables**, add:

| Name              | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| `NEXTAUTH_SECRET` | A long random string. Generate one with `openssl rand -base64 32`.       |
| `NEXTAUTH_URL`    | Leave blank for now — you'll set it after the first deploy in step 6.    |
| `RESEND_API_KEY`  | Optional. If set, admin messages and support replies are sent as email. |
| `EMAIL_FROM`      | Optional. Overrides the sender. Defaults to Resend's onboarding sender. |

`DATABASE_URL` should already be there from step 3.

### 5. Deploy

Click **Deploy**. The build script runs `prisma generate && prisma migrate deploy`
before `next build`, so the schema will be created automatically on the fresh
Postgres instance.

### 6. Set NEXTAUTH_URL and redeploy

Once the deploy finishes you'll get a URL like `strata-xxx.vercel.app`.

1. **Settings → Environment Variables** → set `NEXTAUTH_URL` to
   `https://strata-xxx.vercel.app` (no trailing slash).
2. **Deployments → …** on the latest deploy → **Redeploy** so the new env var takes
   effect. Login redirects will not work until this is set.

### 7. Seed the production database

The database is empty at this point — you need to run the seed script against the
production Postgres once. From your local machine:

```bash
# Pull the prod env vars (specifically DATABASE_URL) down locally:
vercel env pull .env.production.local
# Then run the seed against them:
DATABASE_URL="$(grep '^DATABASE_URL=' .env.production.local | cut -d= -f2-)" \
  npx prisma db seed
```

You can also use Vercel's built-in database console (**Storage → your DB → Query**)
and paste the SQL manually — but running `prisma db seed` is far easier.

### 8. Log in

Open your Vercel URL, click **Try the demo → Fill demo credentials → Sign in**, and
you're in.

### Continuous deploys

Every push to `main` triggers a production redeploy. Pushes to other branches or open
PRs get automatic preview URLs — perfect for testing changes before merging. The build
script runs `prisma migrate deploy` on every deploy, so any new migration you commit
will be applied automatically.

## Project structure

```
app/                  Routes: /, /login, /dashboard, /transfer, API routes
components/           UI components (shadcn-style primitives + feature components)
lib/                  Prisma client, auth config, data-access helpers
prisma/               schema.prisma, migrations/, seed.ts
```

## Screenshots

_(Placeholders — replace with actual screenshots before submission.)_

- Landing page: `docs/screenshots/landing.png`
- Login page: `docs/screenshots/login.png`
- Dashboard: `docs/screenshots/dashboard.png`
- Transfer flow: `docs/screenshots/transfer.png`

## Ethics & Scope

This project is a **UI/UX and full-stack demonstration**, not a financial product. It is
built for a coursework assignment and should never be mistaken for, or extended into, a
production banking system. Specifically:

- **No real money movement.** There is no integration with any payment processor, card
  network, or banking API (no Stripe, Plaid, ACH, SWIFT, etc.). All "transfers" are
  simple row updates in a Postgres database.
- **No real personal data.** All users, balances, and transactions are fabricated demo
  data generated by the seed script. Nothing here should ever be populated with a real
  person's financial or identity information.
- **Simulated authentication only.** Login uses NextAuth's Credentials provider against
  a database with bcrypt-hashed passwords. This is adequate for a coursework demo but
  is not equivalent to production-grade identity verification.

### What a real production build would additionally need

If this were ever adapted toward an actual banking product, at minimum it would require:

- **Regulatory compliance**: KYC/AML identity verification, licensing as a money
  transmitter or partnership with a chartered bank, and compliance with regulations such
  as GLBA, PSD2, or local equivalents.
- **PCI DSS compliance** if handling card data, and integration with a licensed payment
  processor or core banking provider rather than direct ledger manipulation.
- **Real authentication & authorization**: multi-factor authentication, device/session
  risk scoring, rate limiting, and account recovery flows that don't rely on a single
  password.
- **Encryption at rest and in transit** for all sensitive data, with proper key
  management (not a shared `NEXTAUTH_SECRET` in an env var).
- **Fraud detection and transaction monitoring**, audit logging, and reconciliation
  against a real ledger/core banking system.
- **A real, ACID-compliant financial ledger** with double-entry bookkeeping, idempotent
  transaction processing, and reconciliation — not optimistic balance updates on a
  single row.
- **Independent security review and penetration testing** before handling any real
  financial data.

None of the above is implemented here, by design — this repository exists purely to
demonstrate application architecture and UI for a coursework assignment.
