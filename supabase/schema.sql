-- WISTA schema (from SRS class diagram). Run in Supabase: SQL Editor > New query.

create type user_role as enum ('participant', 'provider', 'admin');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type opportunity_type as enum ('training', 'competition', 'mentorship', 'scholarship', 'internship', 'career');
create type listing_status as enum ('published', 'removed');
create type request_kind as enum ('apply', 'register');
create type request_status as enum ('pending', 'accepted', 'rejected');
create type report_status as enum ('open', 'resolved', 'dismissed');

-- User + Participant + OpportunityProvider + Administrator (role-based)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null,
  role user_role not null default 'participant',
  sport text, location text, experience_level text, interests text, goals text,      -- participant
  org_name text, bio text,                                                           -- provider
  verification_status verification_status,                                           -- provider only
  created_at timestamptz default now()
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references profiles on delete cascade,
  title text not null,
  type opportunity_type not null,
  sport text not null,
  location text not null,
  experience_level text,
  description text not null,
  eligibility text,
  start_date date, end_date date, deadline date,
  allows_registration boolean default false,   -- true = "Register", false = "Apply"
  status listing_status not null default 'published',
  created_at timestamptz default now()
);

create table saved_opportunities (
  user_id uuid references profiles on delete cascade,
  opportunity_id uuid references opportunities on delete cascade,
  saved_at timestamptz default now(),
  primary key (user_id, opportunity_id)
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references profiles on delete cascade,
  opportunity_id uuid not null references opportunities on delete cascade,
  kind request_kind not null,
  status request_status not null default 'pending',
  submitted_at timestamptz default now(),
  unique (participant_id, opportunity_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities on delete cascade,
  reporter_id uuid not null references profiles on delete cascade,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz default now()
);

-- Helpers
create function is_admin() returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create function is_verified_provider() returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'provider' and verification_status = 'verified');
$$;

-- Create a profile automatically on signup. Admin role can never be chosen at signup.
create function handle_new_user() returns trigger language plpgsql security definer as $$
declare r user_role := case when new.raw_user_meta_data->>'role' = 'provider' then 'provider' else 'participant' end;
begin
  insert into profiles (id, name, email, role, verification_status, org_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'New user'), new.email, r,
          case when r = 'provider' then 'pending'::verification_status end,
          new.raw_user_meta_data->>'org_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Block non-admins from changing their own role or verification status
create function protect_profile_fields() returns trigger language plpgsql security definer as $$
begin
  if not is_admin() and (new.role <> old.role or new.verification_status is distinct from old.verification_status) then
    raise exception 'Not allowed to change role or verification status';
  end if;
  return new;
end $$;
create trigger protect_profile before update on profiles for each row execute function protect_profile_fields();

-- Notify the participant when an application status changes (FR 8.3)
create function notify_application_update() returns trigger language plpgsql security definer as $$
begin
  if new.status <> old.status then
    insert into notifications (user_id, message)
    values (new.participant_id, 'Your ' || new.kind || ' was ' || new.status || '.');
  end if;
  return new;
end $$;
create trigger on_application_update after update on applications for each row execute function notify_application_update();

-- Row Level Security (role-based access, NFR 1 and NFR 4)
alter table profiles enable row level security;
alter table opportunities enable row level security;
alter table saved_opportunities enable row level security;
alter table applications enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;

create policy "profiles: own, admin, or provider info" on profiles for select
  using (id = auth.uid() or is_admin() or role = 'provider');
create policy "profiles: update own or admin" on profiles for update
  using (id = auth.uid() or is_admin());

create policy "opportunities: public read published" on opportunities for select
  using (status = 'published' or provider_id = auth.uid() or is_admin());
create policy "opportunities: verified providers create" on opportunities for insert
  with check (provider_id = auth.uid() and is_verified_provider());
create policy "opportunities: owner or admin edit" on opportunities for update
  using (provider_id = auth.uid() or is_admin());
create policy "opportunities: owner or admin delete" on opportunities for delete
  using (provider_id = auth.uid() or is_admin());

create policy "saved: own" on saved_opportunities for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "applications: participant reads own" on applications for select
  using (participant_id = auth.uid() or is_admin()
         or exists (select 1 from opportunities o where o.id = opportunity_id and o.provider_id = auth.uid()));
create policy "applications: participant creates" on applications for insert
  with check (participant_id = auth.uid());
create policy "applications: provider updates status" on applications for update
  using (exists (select 1 from opportunities o where o.id = opportunity_id and o.provider_id = auth.uid()));

create policy "notifications: own read" on notifications for select using (user_id = auth.uid());
create policy "notifications: own update" on notifications for update using (user_id = auth.uid());

create policy "reports: logged-in users create" on reports for insert with check (reporter_id = auth.uid());
create policy "reports: admin read" on reports for select using (is_admin());
create policy "reports: admin update" on reports for update using (is_admin());
