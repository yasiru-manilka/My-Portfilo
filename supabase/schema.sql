create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'yasirumanilkaidw@gmail.com',
    'yasirumanilkasd@gmail.com'
  );
$$;

create table if not exists public.profile (
  id          int primary key default 1 check (id = 1),
  name        text not null default '',
  role_line   text default '',
  university  text default '',
  university_url text default '',
  university_logo_url text default '',
  intro       text default '',
  about       text default '',
  location    text default '',
  email       text default '',
  phone       text default '',
  linkedin    text default '',
  github      text default '',
  cv_url      text default '',
  photo_url   text default '',
  status      text default '',
  show_status boolean default true,
  avatar_url  text default '',
  contact_heading text default '',
  sections    jsonb default '{}'::jsonb,
  updated_at  timestamptz default now()
);

create table if not exists public.experience (
  id          uuid primary key default gen_random_uuid(),
  role        text not null,
  org         text default '',
  logo_url    text default '',
  start_label text default '',
  end_label   text default '',
  current     boolean default false,
  summary     text default '',
  tags        text[] default '{}',
  sort        int default 0,
  created_at  timestamptz default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  tagline     text default '',
  role        text default '',
  year        text default '',
  status      text default '',
  summary     text default '',
  highlights  text[] default '{}',
  stack       text[] default '{}',
  images      text[] default '{}',
  link        text default '',
  repo        text default '',
  other_links text[] default '{}',
  sort        int default 0,
  created_at  timestamptz default now()
);

create table if not exists public.certificates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  issuer        text default '',
  issued        text default '',
  credential_id text default '',
  verify_url    text default '',
  image_url     text default '',
  sort          int default 0,
  created_at    timestamptz default now()
);

create table if not exists public.recognition (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  org         text default '',
  date_label  text default '',
  note        text default '',
  image_url   text default '',
  sort        int default 0,
  created_at  timestamptz default now()
);

create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text default 'Other',
  sort        int default 0,
  created_at  timestamptz default now()
);

create table if not exists public.education (
  id          uuid primary key default gen_random_uuid(),
  school      text not null,
  degree      text default '',
  logo_url    text default '',
  start_label text default '',
  end_label   text default '',
  note        text default '',
  courses     text[] default '{}',
  sort        int default 0,
  created_at  timestamptz default now()
);

alter table public.profile  add column if not exists university text default '';
alter table public.profile  add column if not exists university_url text default '';
alter table public.profile  add column if not exists university_logo_url text default '';
alter table public.projects add column if not exists tagline text default '';
alter table public.projects add column if not exists images text[] default '{}';
alter table public.projects add column if not exists other_links text[] default '{}';
alter table public.recognition add column if not exists image_url text default '';
alter table public.profile  add column if not exists avatar_url text default '';
alter table public.profile  add column if not exists contact_heading text default '';
alter table public.profile  add column if not exists sections jsonb default '{}'::jsonb;
alter table public.experience add column if not exists logo_url text default '';
alter table public.education  add column if not exists logo_url text default '';

do $$
declare t text;
begin
  foreach t in array array['profile','experience','projects','certificates','recognition','skills','education']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "Public can read" on public.%I', t);
    execute format('create policy "Public can read" on public.%I for select using (true)', t);

    execute format('drop policy if exists "Admin can insert" on public.%I', t);
    execute format('create policy "Admin can insert" on public.%I for insert to authenticated with check (public.is_admin())', t);

    execute format('drop policy if exists "Admin can update" on public.%I', t);
    execute format('create policy "Admin can update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);

    execute format('drop policy if exists "Admin can delete" on public.%I', t);
    execute format('create policy "Admin can delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view media" on storage.objects;
create policy "Public can view media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "Admin can upload media" on storage.objects;
create policy "Admin can upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admin can update media" on storage.objects;
create policy "Admin can update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admin can delete media" on storage.objects;
create policy "Admin can delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
