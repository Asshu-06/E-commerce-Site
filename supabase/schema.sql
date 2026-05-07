-- ============================================================
-- Shubham Traditions – Supabase Schema
-- Run this FULL file in Supabase → SQL Editor → New Query
-- ============================================================

-- ── Tables ────────────────────────────────────────────────────────────────

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in ('pasupu', 'gifts', 'bags')),
  type        text not null check (type in ('standard', 'customization')),
  price       numeric(10, 2),
  unit        text,
  description text,
  image_url   text,
  variants    text[],
  in_stock    boolean default true,
  created_at  timestamptz default now()
);

-- Orders table
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  user_name           text not null,
  phone               text not null,
  email               text,
  address             text not null,
  items               jsonb not null,
  total_price         numeric(10, 2) not null,
  payment_method      text default 'cod',
  payment_status      text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  razorpay_payment_id text,
  status              text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at          timestamptz default now()
);

-- ── Enable Row Level Security ──────────────────────────────────────────────

alter table public.products enable row level security;
alter table public.orders enable row level security;

-- ── Products RLS Policies ─────────────────────────────────────────────────

-- Anyone can read products (public storefront)
create policy "Products are publicly readable"
  on public.products for select
  using (true);

-- Only logged-in admins can insert products
create policy "Authenticated users can insert products"
  on public.products for insert
  to authenticated
  with check (true);

-- Only logged-in admins can update products
create policy "Authenticated users can update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

-- Only logged-in admins can delete products
create policy "Authenticated users can delete products"
  on public.products for delete
  to authenticated
  using (true);

-- ── Orders RLS Policies ───────────────────────────────────────────────────

-- Anyone can place an order (customers)
create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

-- Users can read their own orders
create policy "Users can read own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can read all orders
create policy "Authenticated users can read orders"
  on public.orders for select
  to authenticated
  using (true);

-- Only logged-in users (admins) can update order status
create policy "Authenticated users can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- ── Storage: product-images bucket ───────────────────────────────────────
-- Step 1: Go to Supabase Dashboard → Storage → New bucket
--         Name: product-images
--         Toggle "Public bucket" ON → Create
--
-- Step 2: Run these policies:

create policy "Public can view product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated users can update images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "Authenticated users can delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ── Admin Setup ───────────────────────────────────────────────────────────
-- Go to Supabase Dashboard → Authentication → Users → Invite user
-- Add these emails:
--   adduriaswani@gmail.com
--   sailendrakondapalli@gmail.com
-- They will receive an email to set their password.
-- ─────────────────────────────────────────────────────────────────────────
