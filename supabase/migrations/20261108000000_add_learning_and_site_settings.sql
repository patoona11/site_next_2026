alter table public.content_posts
  drop constraint if exists content_posts_category_valid;

alter table public.content_posts
  add constraint content_posts_category_valid
  check (category in ('news', 'announcements', 'learning', 'jobs', 'scholarships', 'events'));

create table if not exists public.site_settings (
  id text primary key default 'main',
  faculty_name_th text not null,
  faculty_name_en text not null,
  university_name_th text not null,
  tagline text not null default '',
  description text not null default '',
  phone text not null default '',
  public_relations_phone text not null default '',
  email text not null default '',
  address text not null default '',
  facebook_url text not null default '',
  facebook_rss_url text not null default '',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 'main'),
  constraint site_settings_text_lengths check (
    char_length(faculty_name_th) between 1 and 160 and
    char_length(faculty_name_en) between 1 and 200 and
    char_length(university_name_th) between 1 and 160 and
    char_length(tagline) <= 500 and
    char_length(description) <= 600 and
    char_length(phone) <= 80 and
    char_length(public_relations_phone) <= 80 and
    char_length(email) <= 240 and
    char_length(address) <= 600 and
    char_length(facebook_url) <= 1000 and
    char_length(facebook_rss_url) <= 1000
  )
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_content_posts_updated_at();

alter table public.site_settings enable row level security;

revoke all on table public.site_settings from anon, authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;

drop policy if exists "Public can read site settings" on public.site_settings;

insert into public.site_settings (
  id,
  faculty_name_th,
  faculty_name_en,
  university_name_th,
  tagline,
  description,
  phone,
  public_relations_phone,
  email,
  address,
  facebook_url,
  facebook_rss_url
)
values (
  'main',
  'คณะเทคโนโลยีอุตสาหกรรม',
  'FACULTY OF INDUSTRIAL TECHNOLOGY · NPU',
  'มหาวิทยาลัยนครพนม',
  'สร้างนักปฏิบัติมืออาชีพ พัฒนาเทคโนโลยีและนวัตกรรม เพื่ออุตสาหกรรมและชุมชนอย่างยั่งยืน',
  'เว็บไซต์คณะเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยนครพนม',
  '042-503-777',
  '095-189-9303',
  'itech@npu.ac.th',
  '214 หมู่ 12 ต.หนองญาติ อ.เมือง จ.นครพนม 48000',
  'https://www.facebook.com/people/%E0%B8%84%E0%B8%93%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%84%E0%B9%82%E0%B8%99%E0%B9%82%E0%B8%A5%E0%B8%A2%E0%B8%B5%E0%B8%AD%E0%B8%B8%E0%B8%95%E0%B8%AA%E0%B8%B2%E0%B8%AB%E0%B8%81%E0%B8%A3%E0%B8%A3%E0%B8%A1-%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B8%9E%E0%B8%99%E0%B8%A1/100057388091241/',
  ''
)
on conflict (id) do nothing;
