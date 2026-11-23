# WISTA – Women in Sports Talent Access

A web platform that helps women and girls in Rwanda discover sports training, competitions,
mentorship, scholarships, internships and careers, and lets verified providers publish them.

- **Live app:** _add Vercel URL_
- **Demo video:** _add link_
- **SRS:** _add link_

## Tech stack
- Next.js 14.2.35 (React), App Router
- PostgreSQL 17, hosted on Supabase (database, authentication and row-level security)
- Deployed on Vercel

## Prerequisites
- Node.js 18.17 or newer (check with `node -v`)
- Git (check with `git --version`)
- A free Supabase account (https://supabase.com)

## Setup (every step)
1. Clone and install:
   ```bash
   git clone https://github.com/nshimyumurwa/wista.git
   cd wista
   npm install
   ```
2. In Supabase, create a new project and wait for it to finish starting.
3. Open **SQL Editor > New query**, paste the whole of `supabase/schema.sql`, and click **Run**.
4. Open a new query, paste the whole of `supabase/grants.sql`, and click **Run**. This gives the API roles access to the tables. Row-level security policies from step 3 still control which rows each user can see or change.
5. Open **Project Settings > API Keys** and copy the Project URL and the publishable (anon) key.
6. Copy the environment file and fill in both values:
   ```bash
   cp .env.example .env.local
   ```
   On Windows PowerShell use `Copy-Item .env.example .env.local`.
7. Start the app:
   ```bash
   npm run dev
   ```
8. Open http://localhost:3000.

## Environment variables
Set these in `.env.local` locally and in the Vercel project settings when deploying. Never commit `.env.local`.

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable (anon) key |

Never use the `service_role` key in this app.

## Database
- `supabase/schema.sql`: tables, enums, row-level security policies and the notification trigger
- `supabase/grants.sql`: API access for the `anon` and `authenticated` roles

Tables: `profiles`, `opportunities`, `applications`, `saved_opportunities`, `notifications`, `reports`.

## Demo accounts
_Add admin, verified provider, pending provider and participant logins here once seeded._

## Features and SRS coverage
_Updated as each pull request is merged._

| Feature | SRS | Status |
|---|---|---|
| Landing page and opportunity list (no login) | FR 4.1 | Done |
| Database schema and role-based security | NFR 1, NFR 4 | Done |
| Signup / login | FR 1 | Next |
| Profiles | FR 2, FR 12 | Planned |
| Publishing | FR 3 | Planned |
| Search, filters, details | FR 4, FR 5 | Planned |
| Save, apply / register | FR 6, FR 7 | Planned |
| Notifications | FR 8 | Planned |
| Admin and reports | FR 9, 10, 11 | Planned |

## Troubleshooting
- **"running scripts is disabled" on Windows:** run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` in PowerShell.
- **"We could not load opportunities":** check the two environment variables, and make sure you ran both `schema.sql` and `grants.sql`.