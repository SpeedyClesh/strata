# Strata

Strata is a modern digital banking web app built with Next.js 14, Prisma, and PostgreSQL.

## Features

**Customer**

- Landing page + secure login
- Dashboard: current balance, 30-day balance trend chart, recent transactions
- Transfers: instant between Strata accounts, or external
- Virtual cards: issue Visa/Mastercard, reveal details, freeze/unfreeze
- Notifications: bell + unread badge on every page, mark-read, mark-all-read
- Support chat: open tickets, chat-style conversation with the support team

**Administrator**

- Overview dashboard: customer count, deposits under management, transaction count,
  open support tickets, live activity feed
- Users: list all customers, drill into one to see balance, transaction history,
  cards, and support threads
- Balance adjustments: credit / debit any account with an audit-trail Transaction row
  plus in-app notification + email to the customer
- Send message: create an in-app notification, optionally trigger an email
- Support inbox: reply to customer conversations, mark resolved / reopen

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + shadcn/ui-style components
- [Prisma](https://www.prisma.io/) ORM with **PostgreSQL**
- [NextAuth.js](https://next-auth.js.org/) (Credentials provider)
- [Recharts](https://recharts.org/) for the balance chart
- [next-themes](https://github.com/pacocoursey/next-themes) for dark mode
- [Resend](https://resend.com/) for optional real email delivery (falls back to
  server-console logging when no API key is configured)

## Running locally

You need a running PostgreSQL instance. Easiest is Docker:

```bash
docker run --name strata-pg -e POSTGRES_USER=strata -e POSTGRES_PASSWORD=strata \
  -e POSTGRES_DB=strata -p 5432:5432 -d postgres:16
```

Then, from the project folder:

```bash
cp .env.example .env
# Edit .env if your Postgres connection differs
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test accounts

The seed script creates three customer accounts and one administrator:

| Email             | Password    | Role         | Starting balance |
| ----------------- | ----------- | ------------ | ----------------- |
| `alice@demo.test` | `demo1234`  | Customer     | $12,450.75         |
| `bob@demo.test`   | `demo1234`  | Customer     | $3,208.10          |
| `carol@demo.test` | `demo1234`  | Customer     | $47,900.00         |
| `admin@demo.test` | `admin1234` | Administrator | —                 |

The login page has one-click auto-fill buttons for a customer and an administrator.
Admins are redirected to `/admin` after signing in; customers land on `/dashboard`.

Each customer account is seeded with 15–20 past transactions, one active Visa
(Alice also has a frozen Mastercard), three notifications, and one open support
thread.

## Enabling real email (optional)

Admin messages and support replies send email via [Resend](https://resend.com).
If `RESEND_API_KEY` is unset, they are written to the server console instead —
convenient for local development and for a fresh Vercel deploy. To enable real
delivery:

1. Sign up at <https://resend.com> (free tier), grab an API key.
2. Add `RESEND_API_KEY` (and optionally `EMAIL_FROM`) to your `.env` locally, or as
   Vercel env vars in production.
3. Redeploy / restart.

## Deploying to Vercel

### 1. Push this repo to GitHub

```bash
git init
git add -A
git commit -m "Initial commit: Strata"
# create an empty repo at https://github.com/new, then:
git remote add origin https://github.com/<your-username>/strata.git
git branch -M main
git push -u origin main
```

### 2. Import the repo into Vercel

1. Go to <https://vercel.com/new>.
2. Sign in with GitHub, authorize Vercel to access your repos.
3. Pick the `strata` repo → **Import**.
4. The framework is auto-detected as **Next.js** — leave build/output settings default.
5. **Don't click Deploy yet** — add env vars first.

### 3. Provision a Postgres database

Two options:

**A. Neon (fastest)** — sign up at <https://console.neon.tech>, create a project,
copy the connection string, and paste it as `DATABASE_URL` in Vercel env vars.

**B. Vercel's marketplace** — after import, go to the project's **Storage** tab
→ **Create Database** → **Postgres** (or Neon). Vercel auto-injects `DATABASE_URL`.

### 4. Add environment variables

Under **Settings → Environment Variables**, add these to **Production and Preview**:

| Name              | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| `NEXTAUTH_SECRET` | A long random string. Generate one with `openssl rand -base64 32`.       |
| `NEXTAUTH_URL`    | Leave blank for now — you'll set it after the first deploy.              |
| `RESEND_API_KEY`  | Optional. Enables real email delivery.                                   |
| `EMAIL_FROM`      | Optional. Overrides the sender.                                          |

`DATABASE_URL` should already be there from step 3.

### 5. Deploy

Click **Deploy**. The build script runs `prisma generate && prisma migrate deploy`
before `next build`, so the schema is created automatically on the fresh Postgres.

### 6. Set NEXTAUTH_URL and redeploy

Once the deploy finishes you'll get a URL like `strata-xxx.vercel.app`.

1. **Settings → Environment Variables** → set `NEXTAUTH_URL` to
   `https://strata-xxx.vercel.app` (no trailing slash).
2. **Deployments → …** on the latest deploy → **Redeploy**. Login redirects will
   not work until this is set.

### 7. Seed the production database

```bash
vercel env pull .env.production.local
DATABASE_URL="$(grep '^DATABASE_URL=' .env.production.local | cut -d= -f2-)" \
  npx prisma db seed
```

### 8. Sign in

Open your Vercel URL → *Open your dashboard → Fill customer credentials → Sign in*.

### Continuous deploys

Every push to `main` triggers a production redeploy. Pushes to other branches or
open PRs get preview URLs. The build script runs `prisma migrate deploy` on every
deploy, so new migrations are applied automatically.

## Project structure

```
app/                  Routes: /, /login, /dashboard, /transfer, /cards,
                       /notifications, /support, /admin/*, API routes
components/           UI components (primitives + feature components)
lib/                  Prisma client, auth, data helpers, email
prisma/               schema.prisma, migrations/, seed.ts
```
