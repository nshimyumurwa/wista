# WISTA - Women in Sports Talent Access

A web platform that helps women and girls in Rwanda discover sports training, competitions,
mentorship, scholarships, internships and careers, and lets verified providers publish them.

- **Live app:** https://wista-eta.vercel.app
- **Demo video:** _add link_
- **SRS:** _add link_

## Tech stack
- Next.js 14 (React), App Router
- PostgreSQL, hosted on Supabase (database, authentication and row-level security)
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
5. Open **Authentication > Sign In / Providers**, switch **Confirm email** off, and click **Save changes**. Otherwise new accounts cannot log in until they confirm an email.
6. Open **Authentication > URL Configuration**. Set **Site URL** to your app address (`http://localhost:3000` for local use, or your Vercel URL), add `http://localhost:3000/**` under **Redirect URLs**, and save.
7. Open **Project Settings > API Keys** and copy the Project URL and the publishable (anon) key.
8. Copy the environment file and fill in both values:
   ```bash
   cp .env.example .env.local
   ```
   On Windows PowerShell use `Copy-Item .env.example .env.local`.
9. Start the app:
   ```bash
   npm run dev
   ```
10. Open http://localhost:3000.

## Create the first administrator
Administrator accounts cannot be created through signup, by design. To create one on a new database:
1. Sign up a normal account in the app (choose **Participant**).
2. In the Supabase **SQL Editor**, run this, replacing the email with the account you just created:
   ```sql
   alter table profiles disable trigger protect_profile;
   update profiles set role = 'admin', verification_status = null where email = 'YOUR-EMAIL-HERE';
   alter table profiles enable trigger protect_profile;
   ```
3. Log out and log in again. You will land on `/admin`.

Providers sign up through the app and start as **pending**. The administrator verifies them from the **Providers** tab, after which they can publish opportunities.

## Environment variables
Set these in `.env.local` locally and in the Vercel project settings when deploying. Never commit `.env.local`.

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable (anon) key |

Never use the `service_role` key in this app.

## Database
- `supabase/schema.sql`: tables, enums, row-level security policies and the signup and notification triggers
- `supabase/grants.sql`: API access for the `anon` and `authenticated` roles

Tables: `profiles`, `opportunities`, `applications`, `saved_opportunities`, `notifications`, `reports`.

## Demo accounts
These accounts exist on the live app. Passwords are given in the submission document.

| Role | Email |
|---|---|
| Participant | nonette@gmail.com |
| Verified provider | ferwafa@gmail.com |
| Administrator | teddy@gmail.com |

## Features and SRS coverage

| Feature | SRS | Status |
|---|---|---|
| Landing page and opportunity list (no login) | FR 4.1 | Done |
| Database schema and role-based security | NFR 1, NFR 4 | Done |
| Signup and login with validation messages, role-based redirects | FR 1 | Done |
| Participant and provider profiles (view, create, edit) | FR 2, FR 12 | Done |
| Publish, list and remove opportunities (verified providers only) | FR 3 | Done |
| Search and filters (type, location, level), details page | FR 4, FR 5 | Done |
| Save opportunities, apply or register, view status | FR 6, FR 7 | Done |
| Accept or reject applicants, notification to participant | FR 8 | Done |
| Administrator: verify or reject providers | FR 9 | Done |
| Administrator: view users, manage opportunity listings | FR 10 | Done |
| Report an opportunity, administrator reviews reports | FR 11 | Done |

## Known limitations
- The administrator can view users but cannot delete or suspend accounts.
- Notifications appear in the app only. No email is sent.

## Troubleshooting
- **"running scripts is disabled" on Windows:** run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` in PowerShell.
- **"We could not load opportunities":** check the two environment variables, and make sure you ran both `schema.sql` and `grants.sql`.
- **"Database error saving new user":** re-run the whole of `supabase/schema.sql`. It contains the fixed signup trigger.
- **Login fails on the deployed site:** set the Site URL and Redirect URLs in Supabase under Authentication > URL Configuration.