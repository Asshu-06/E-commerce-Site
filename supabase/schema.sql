-- ============================================================
-- Lakshmi Ram Collections – Supabase Full Schema
-- Run this FULL file in Supabase → SQL Editor → New Query
-- ============================================================

-- ── 1. TABLES ─────────────────────────────────────────────────────────────

-- Products
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

-- Orders
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  user_name           text not null,
  phone               text not null,
  email               text,
  address             text not null,
  items               jsonb not null,
  total_price         numeric(10, 2) not null,
  shipping_charge     numeric(10, 2) default 0,
  payment_method      text default 'cod',
  payment_status      text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'rejected')),
  razorpay_payment_id text,
  rejection_reason    text,
  status              text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at          timestamptz default now()
);

-- Wishlists
create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  text not null,
  product     jsonb,
  created_at  timestamptz default now(),
  unique (user_id, product_id)
);

-- Reviews
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,
  user_id     uuid references auth.users(id) on delete set null,
  user_name   text not null,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- Feedback / Contact messages
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  rating     int check (rating between 1 and 5),
  message    text not null,
  created_at timestamptz default now()
);


-- ── 2. ROW LEVEL SECURITY ─────────────────────────────────────────────────

alter table public.products  enable row level security;
alter table public.orders    enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews   enable row level security;
alter table public.feedback  enable row level security;


-- ── 3. PRODUCTS POLICIES ──────────────────────────────────────────────────

create policy "Products are publicly readable"
  on public.products for select
  using (true);

create policy "Authenticated users can insert products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete products"
  on public.products for delete
  to authenticated
  using (true);


-- ── 4. ORDERS POLICIES ────────────────────────────────────────────────────

create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

create policy "Users can read own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Authenticated users can read all orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated users can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);


-- ── 5. WISHLISTS POLICIES ─────────────────────────────────────────────────

create policy "Users can read own wishlist"
  on public.wishlists for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can add to wishlist"
  on public.wishlists for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove from wishlist"
  on public.wishlists for delete
  to authenticated
  using (auth.uid() = user_id);


-- ── 6. REVIEWS POLICIES ───────────────────────────────────────────────────

create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Authenticated users can post reviews"
  on public.reviews for insert
  to authenticated
  with check (true);

create policy "Users can update own reviews"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);


-- ── 7. FEEDBACK POLICIES ──────────────────────────────────────────────────

create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

create policy "Authenticated users can read feedback"
  on public.feedback for select
  to authenticated
  using (true);


-- ── 8. STORAGE: product-images bucket ────────────────────────────────────
-- Step 1: Supabase Dashboard → Storage → New bucket
--         Name: product-images  |  Toggle "Public bucket" ON → Create
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


-- ── 9. SEED DATA (optional — only if DB is empty) ─────────────────────────
-- Uncomment and run to pre-populate products

/*
insert into public.products (name, category, type, price, unit, description, image_url, variants) values

-- Pasupu-Kumkuma Standard
('Pasupu Kumkuma Couple Set',    'pasupu', 'standard', 120, 'set',   'Traditional pasupu kumkuma set for couples — perfect for weddings.',         '/images/pasupukumkuma-couple.jpeg',       array['Without Magnet','With Magnet (+₹3)']),
('Pasupu Kumkuma Bag Set',       'pasupu', 'standard', 180, 'set',   'Elegant pasupu kumkuma set packed in a decorative bag.',                     '/images/pasupukumkuma-bag.jpeg',          array['Without Magnet','With Magnet (+₹3)']),
('Krishna Theme Pasupu Set',     'pasupu', 'standard', 250, 'set',   'Devotional Krishna-themed pasupu kumkuma set for pooja occasions.',          '/images/pasupukumkuma-krishna.jpeg',      array['Without Magnet','With Magnet (+₹3)']),
('House Opening Pasupu Set',     'pasupu', 'standard', 150, 'set',   'Auspicious pasupu kumkuma set for housewarming (griha pravesham).',          '/images/pasupukumkuma-houseopening.jpeg', array['Without Magnet','With Magnet (+₹3)']),

-- Pasupu-Kumkuma Customization
('Custom Design Set',            'pasupu', 'customization', null, null, 'Fully customized pasupu kumkuma set — choose your theme, colors, design.', '/images/pasupukkumkuma-design.jpeg',      null),
('Wedding Theme',                'pasupu', 'customization', null, null, 'Elegant wedding-themed customized pasupu kumkuma set.',                    '/images/pasupukumkuma-couple.jpeg',       null),
('Krishna / Devotional Theme',   'pasupu', 'customization', null, null, 'Devotional Krishna-themed customized set for religious functions.',        '/images/pasupukumkuma-krishna.jpeg',      null),
('Housewarming Theme',           'pasupu', 'customization', null, null, 'Auspicious housewarming themed customized pasupu kumkuma set.',            '/images/pasupukumkuma-houseopening.jpeg', null),
('Bag & Pouch Theme',            'pasupu', 'customization', null, null, 'Customized pasupu kumkuma set in a beautifully designed bag or pouch.',    '/images/pasupukumkuma-bag.jpeg',          null),
('Fully Custom Design',          'pasupu', 'customization', null, null, 'Send us your idea and we will create a completely unique design.',         '/images/pasupukkumkuma-design.jpeg',      null),

-- Return Gifts
('Brass Diya Set',               'gifts',  'standard', 199, 'piece', 'Handcrafted brass diya set, ideal as return gift for pooja and festivals.',  'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Coconut Shell Bowl',           'gifts',  'standard', 149, 'piece', 'Eco-friendly coconut shell bowl, a unique and sustainable return gift.',     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Terracotta Planter',           'gifts',  'standard', 129, 'piece', 'Traditional terracotta planter with seeds, a thoughtful return gift.',       'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Wooden Keychain Set',          'gifts',  'standard',  89, 'piece', 'Handcrafted wooden keychain with traditional motifs.',                       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Agarbatti Gift Set',           'gifts',  'standard', 175, 'set',   'Premium agarbatti set with holder, perfect for gifting.',                   'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Copper Tumbler',               'gifts',  'standard', 299, 'piece', 'Pure copper tumbler, a healthy and traditional return gift.',                'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),

-- Return Bags
('Jute Return Bag',              'bags',   'standard',  79, 'piece', 'Eco-friendly jute bag with traditional print, perfect for return gifts.',    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Silk Potli Bag',               'bags',   'standard', 149, 'piece', 'Beautiful silk potli bag with golden embroidery for weddings and festivals.','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Cotton Tote Bag',              'bags',   'standard',  99, 'piece', 'Reusable cotton tote bag with traditional block print design.',              'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Velvet Gift Pouch',            'bags',   'standard', 119, 'piece', 'Luxurious velvet pouch with drawstring, ideal for premium return gifts.',    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Paper Gift Bag',               'bags',   'standard',  49, 'piece', 'Elegant paper gift bag with traditional motif print.',                       'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']),
('Embroidered Cloth Bag',        'bags',   'standard', 189, 'piece', 'Hand-embroidered cloth bag with intricate traditional patterns.',            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', array['Without Magnet','With Magnet (+₹3)']);
*/


-- ── 10. ADMIN SETUP ───────────────────────────────────────────────────────
-- Supabase Dashboard → Authentication → Users → Invite user
-- Add admin emails:
--   adduriaswani@gmail.com
--   sailendrakondapalli@gmail.com
-- They will receive an email to set their password.
-- Also add them to src/lib/adminEmails.js
-- ─────────────────────────────────────────────────────────────────────────
