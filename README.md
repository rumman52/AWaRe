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

### 1) DATABASE_URL requirements
Use a managed Postgres URL in Vercel project environment variables.

Expected format:
```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

- Do **not** use SQLite file URLs (`file:./dev.db`) in production on Vercel.
- Set `DATABASE_URL` in Vercel for **Production**, **Preview**, and optionally **Development** environments.

### 2) Build / Prisma client generation
This project includes:
- `postinstall`: `prisma generate`
- `vercel-build`: `prisma generate && next build`

These ensure Prisma Client is generated in Vercel builds.

### 3) Run schema migrations in production
Do **not** run `prisma migrate dev` in production.

After deploying and setting `DATABASE_URL`, run once against production:
```bash
npx prisma migrate deploy
```

Expected result: all checked-in migrations are applied and API routes can query/create records.

### 4) Seed initial recommendation data
The recommender requires `InfectionGuide` and `Antibiotic` seed data.

Run (against the intended database):
```bash
npx prisma db seed
```

Expected result: baseline antibiotics + infection guides are inserted so `/api/cases` can generate recommendations.

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
