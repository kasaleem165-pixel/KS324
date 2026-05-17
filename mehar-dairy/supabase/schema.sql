-- ============================================================
-- Mehar Dairy & Fattening Farm — Supabase Schema
-- Run this in the Supabase SQL Editor after creating a project
-- ============================================================

-- ── Roles ──────────────────────────────────────────────────
create type app_role as enum ('admin', 'user');

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- Security-definer helper to avoid privilege escalation
create or replace function has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ── Animals ────────────────────────────────────────────────
create table animals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text not null,          -- cow | bull | goat | sheep
  breed text,
  weight_kg numeric,
  age_months int,
  teeth int,
  color text,
  price numeric not null,
  description text,
  image_urls text[] default '{}',
  status text default 'available', -- available | reserved | sold
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger animals_updated_at
before update on animals
for each row execute function set_updated_at();

-- ── Bookings ───────────────────────────────────────────────
create table bookings (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references animals(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  message text,
  status text default 'pending',   -- pending | contacted | confirmed | cancelled
  created_at timestamptz default now()
);

-- ── Storage ────────────────────────────────────────────────
-- Run via Supabase Dashboard > Storage > New Bucket
-- Name: animals, Public: true

-- ── Row Level Security ─────────────────────────────────────
alter table animals enable row level security;
alter table bookings enable row level security;
alter table user_roles enable row level security;

-- Animals: public read, admin write
create policy "animals_public_select" on animals
  for select using (true);

create policy "animals_admin_insert" on animals
  for insert with check (has_role(auth.uid(), 'admin'));

create policy "animals_admin_update" on animals
  for update using (has_role(auth.uid(), 'admin'));

create policy "animals_admin_delete" on animals
  for delete using (has_role(auth.uid(), 'admin'));

-- Bookings: anyone insert, admin read/update
create policy "bookings_public_insert" on bookings
  for insert with check (true);

create policy "bookings_admin_select" on bookings
  for select using (has_role(auth.uid(), 'admin'));

create policy "bookings_admin_update" on bookings
  for update using (has_role(auth.uid(), 'admin'));

-- User roles: admin only
create policy "user_roles_admin_select" on user_roles
  for select using (has_role(auth.uid(), 'admin'));

create policy "user_roles_admin_insert" on user_roles
  for insert with check (has_role(auth.uid(), 'admin'));

create policy "user_roles_admin_update" on user_roles
  for update using (has_role(auth.uid(), 'admin'));

create policy "user_roles_admin_delete" on user_roles
  for delete using (has_role(auth.uid(), 'admin'));

-- Storage: public read, admin write
-- Run in SQL editor after creating 'animals' bucket:
create policy "storage_animals_public_read" on storage.objects
  for select using (bucket_id = 'animals');

create policy "storage_animals_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'animals' and has_role(auth.uid(), 'admin')
  );

create policy "storage_animals_admin_update" on storage.objects
  for update using (
    bucket_id = 'animals' and has_role(auth.uid(), 'admin')
  );

create policy "storage_animals_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'animals' and has_role(auth.uid(), 'admin')
  );

-- ── Sample seed data ───────────────────────────────────────
-- After seeding admin (see README), run:
-- insert into animals (name, species, breed, weight_kg, age_months, teeth, color, price, description, featured) values
--   ('Raja Sahib', 'bull', 'Sahiwal', 420, 36, 4, 'Reddish Brown', 280000, 'Magnificent Sahiwal bull, hand-raised for 3 years. Excellent health, vet-verified.', true),
--   ('Noor Bibi', 'cow', 'Nagri', 280, 24, 2, 'Black & White', 150000, 'Young healthy Nagri cow, first season Qurbani. Calm temperament.', true),
--   ('Bahadur', 'goat', 'Beetal', 45, 18, 4, 'Brown', 35000, 'Premium Beetal goat, vet-checked and vaccinated.', false);
