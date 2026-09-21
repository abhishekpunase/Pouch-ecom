-- Apna Packaging Solution schema for Supabase
-- Run this in the SQL editor of your project.

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  headline text,
  description text,
  image text
);

create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  category text references public.categories(slug),
  featured boolean default false,
  rating numeric default 0,
  reviews int default 0,
  base_price numeric not null,
  in_stock boolean default true,
  is_sample boolean default false,
  short_description text,
  description text,
  images jsonb default '[]'::jsonb,
  sizes jsonb default '[]'::jsonb,
  colours jsonb default '[]'::jsonb,
  packs jsonb default '[]'::jsonb,
  features jsonb default '[]'::jsonb,
  badge text,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  coupon_code text,
  shipping numeric not null,
  total numeric not null,
  status text default 'confirmed',
  payment_method text,
  payment_status text,
  razorpay_order_id text,
  razorpay_payment_id text,
  courier_name text,
  courier_company_id text,
  awb text,
  shipment_id text,
  shiprocket_order_id text,
  tracking_url text,
  notes text,
  shipping_address jsonb,
  created_at timestamptz default now()
);

alter table public.orders add column if not exists discount numeric default 0;
alter table public.orders add column if not exists coupon_code text;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  message text,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);

drop policy if exists "anyone insert orders" on public.orders;
create policy "anyone insert orders" on public.orders for insert with check (true);

drop policy if exists "read own orders" on public.orders;
create policy "read own orders" on public.orders for select using (
  auth.uid() = user_id or user_id is null
);

drop policy if exists "anyone insert contact" on public.contact_messages;
create policy "anyone insert contact" on public.contact_messages for insert with check (true);

insert into public.categories (slug, name, headline, description, image) values
  ('pouches', 'Pouches', 'Standup zipper pouches', 'Food-grade standup pouches with zipper, tear notch and strong barrier layers.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80'),
  ('boxes', 'Boxes', 'Shipping & gift boxes', 'Corrugated mailers, folding cartons and rigid gift boxes.', 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=80'),
  ('labels', 'Labels', 'Product labels & stickers', 'Waterproof vinyl, kraft, clear and thermal labels.', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------
-- Profile pictures (Account page). Public bucket; each user can only
-- write inside their own folder:  avatars/<user-id>/avatar.jpg
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars own insert" on storage.objects;
create policy "avatars own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars own update" on storage.objects;
create policy "avatars own update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars own delete" on storage.objects;
create policy "avatars own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
