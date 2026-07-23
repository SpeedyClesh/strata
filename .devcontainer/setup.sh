#!/usr/bin/env bash
set -e
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER strata WITH PASSWORD 'strata' CREATEDB;" || true
sudo -u postgres psql -c "CREATE DATABASE strata OWNER strata;" || true
cat > .env <<'ENV'
DATABASE_URL="postgresql://strata:strata@localhost:5432/strata"
NEXTAUTH_SECRET="dev-only-secret-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"
ENV
npm install
npx prisma migrate deploy
npx prisma db seed
echo "READY — run: npm run dev"
