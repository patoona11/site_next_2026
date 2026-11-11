create extension if not exists pgcrypto;

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  category text not null,
  status text not null default 'draft',
  image_url text not null default '',
  external_url text not null default '',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint content_posts_title_length check (char_length(title) between 1 and 240),
  constraint content_posts_slug_length check (char_length(slug) between 1 and 160),
  constraint content_posts_excerpt_length check (char_length(excerpt) <= 600),
  constraint content_posts_body_length check (char_length(body) <= 30000),
  constraint content_posts_image_url_length check (char_length(image_url) <= 1000),
  constraint content_posts_external_url_length check (char_length(external_url) <= 1000),
  constraint content_posts_category_valid check (category in ('news', 'announcements', 'jobs', 'scholarships', 'events')),
  constraint content_posts_status_valid check (status in ('draft', 'published'))
);

create index if not exists content_posts_status_published_idx
  on public.content_posts (status, published_at desc);

create index if not exists content_posts_category_status_published_idx
  on public.content_posts (category, status, published_at desc);

create or replace function public.set_content_posts_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_content_posts_updated_at() from public, anon, authenticated;

drop trigger if exists content_posts_set_updated_at on public.content_posts;

create trigger content_posts_set_updated_at
before update on public.content_posts
for each row
execute function public.set_content_posts_updated_at();

alter table public.content_posts enable row level security;

revoke all on table public.content_posts from anon, authenticated;
grant select on table public.content_posts to anon, authenticated;
grant select, insert, update, delete on table public.content_posts to service_role;

drop policy if exists "Public can read published content" on public.content_posts;

create policy "Public can read published content"
on public.content_posts
for select
to anon, authenticated
using (status = 'published');
