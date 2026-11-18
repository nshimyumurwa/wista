# WISTA – Women in Sports Talent Access

A web platform that helps women and girls in Rwanda discover sports training, competitions,
mentorship, scholarships, internships and careers, and lets verified providers publish them.

- **Live app:** _add Vercel URL_
- **Demo video:** _add link_
- **SRS:** _add link_

## Tech stack
Next.js 14 (React), Supabase (PostgreSQL + Auth), deployed on Vercel.

## Prerequisites
- Node.js 18.17 or newer (check with `node -v`)
- Git
- A free Supabase account (https://supabase.com)

## Setup (every step)
1. Clone and install:
   ```bash
   git clone https://github.com/YOUR-USERNAME/wista.git
   cd wista
   npm install
   ```
2. In Supabase, create a new project and wait for it to finish starting.
3. Open **SQL Editor > New query**, paste the whole of `supabase/schema.sql`, and click **Run**.
4. Open **Project Settings > API** and copy the Project URL and the `anon` public key.
5. Copy the environment file and fill in both values:
   ```bash
   cp .env.example .env.local
   ```
6. Start the app:
   ```bash
   npm run dev
   ```
7. Open http://localhost:3000.

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
