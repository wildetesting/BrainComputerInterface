create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  slug text not null,
  description text not null default '',
  item_count integer not null default 0,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  image_url text not null,
  original_name text not null,
  mime_type text not null,
  title text not null,
  summary text not null,
  extracted_text text not null default '',
  source_url text,
  source_confidence text not null default 'none',
  category_id uuid not null references public.categories(id) on delete cascade,
  category_name text not null,
  category_slug text not null,
  topics jsonb not null default '[]'::jsonb,
  importance_score numeric not null default 0.5,
  factuality_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_user_last_updated_idx
  on public.categories (user_id, last_updated_at desc);

create index if not exists snapshots_user_updated_idx
  on public.snapshots (user_id, updated_at desc);

create index if not exists snapshots_user_category_idx
  on public.snapshots (user_id, category_slug, updated_at desc);

alter table public.categories enable row level security;
alter table public.snapshots enable row level security;

-- This MVP uses SUPABASE_SERVICE_ROLE_KEY from Next.js server routes.
-- Add user-authenticated RLS policies before exposing direct client access.
