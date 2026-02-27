# AMR Steward (Prototype)

AMR Steward is a responsive stewardship decision-support web app prototype to reduce inappropriate antibiotic use using WHO AWaRe-aligned guidance.

## Architecture (short)
- **Frontend**: Next.js App Router + TypeScript + TailwindCSS with simple, responsive cards and forms.
- **Backend**: Next.js API routes implement deterministic recommendation rules from seeded InfectionGuide + Antibiotic tables.
- **Data layer**: Prisma ORM over SQLite (demo), schema designed to be Postgres-compatible.
- **Safety model**: Disclaimer on every screen, human confirmation language, source badges/links with every recommendation.
- **Analytics**: Daily AWaRe metrics, overdue review list, Watch/Reserve visibility.

## Setup
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```
Open http://localhost:3000/new-case

## Vercel production setup

Run these commands **once** after connecting your Vercel project to Postgres.

### 1) Pull Vercel env vars locally
```bash
vercel env pull .env.production
```

This copies the deployed `DATABASE_URL` into `.env.production` so Prisma CLI targets the same database used in production checks.

### 2) DATABASE_URL requirements
Use a managed Postgres URL in Vercel project environment variables.

Expected format:
```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

- Do **not** use SQLite file URLs (`file:./dev.db`) in production on Vercel.
- Set `DATABASE_URL` in Vercel for **Production**, **Preview**, and optionally **Development** environments.
- The API performs runtime validation and returns a clear JSON error if `DATABASE_URL` is missing or not a `postgres://` / `postgresql://` URL.

### 3) Build / Prisma client generation
This project includes:
- `postinstall`: `prisma generate`
- `vercel-build`: `prisma generate && next build`

These ensure Prisma Client is generated in Vercel builds and stays fresh per deployment.

### 4) Run schema migrations in production
Do **not** run `prisma migrate dev` in production.

Apply checked-in migrations against the connected Vercel database:
```bash
npx prisma migrate deploy
```

### 5) Seed initial recommendation data
The recommender requires `InfectionGuide` and `Antibiotic` seed data.

Run:
```bash
npx prisma db seed
```

### 6) Verify backend health + recommendation endpoint
Health check:
```bash
curl -s http://localhost:3000/api/health
```
Expected response: `{"ok":true,"message":"Database connection is healthy."}`

Recommendation check (should return 200 with JSON containing an `id`):
```bash
curl -i -X POST http://localhost:3000/api/cases \
  -H 'content-type: application/json' \
  -d '{
    "setting":"primary_care",
    "suspectedInfectionKey":"uti_uncomplicated",
    "severity":"uncomplicated",
    "age":42,
    "sex":"female",
    "pregnancy":false,
    "allergiesText":"none",
    "creatinineOrEgfr":"eGFR 90",
    "symptomsText":"dysuria",
    "chosenAntibiotic":"",
    "chosenDose":"",
    "chosenDurationDays":5,
    "justificationText":""
  }'
```
## Demo script
1. Go to `/new-case` and submit a UTI uncomplicated case with no selected antibiotic.
2. Create another case selecting **Ceftriaxone** or **Ciprofloxacin** to trigger Watch warning.
3. Enter a long duration (e.g., 14 days for mild SSTI) to trigger duration flag.
4. Visit `/dashboard` to view **review overdue list** and top Watch antibiotics.
5. Observe metric trend card showing improved Access % over time toward WHO 70% target.

## Included synthetic demo cases
- Access-first recommendation example.
- Watch antibiotic flagged example.
- Duration too long flagged example.
- Review overdue examples.
- Time-series showing Access % improvement.

## Source references used
- WHO AWaRe Antibiotic Book: https://www.who.int/publications/i/item/9789240062382
- WHO AWaRe Portal: https://aware.essentialmeds.org/
- WHO AWaRe Classification update: https://www.who.int/publications/i/item/B09489
- WHO 70% Access indicator: https://www.who.int/data/gho/indicator-metadata-registry/imr-details/5767
- CDC Core Elements Hospital ASP: https://www.cdc.gov/antibiotic-use/hcp/core-elements/hospital.html

## Screenshot instructions
Run app with `npm run dev`, then capture key screens:
- `/new-case`
- `/case/[id]`
- `/dashboard`
Use browser tooling (Playwright) to save screenshots in an `artifacts/` directory.
