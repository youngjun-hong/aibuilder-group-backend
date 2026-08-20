-- 핵심 테이블 (PRD §7.2 초안 + /builder 프로필을 DB 기반으로 유지하기 위한 확장 필드)

create table public.builders (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  slug text unique not null,
  name text not null,
  email text not null,
  role public.builder_role not null default 'builder',
  one_liner text,
  role_label text,
  avatar_url text,
  is_active boolean not null default true,
  -- §7.2 초안을 넘어선 확장 — /builder 프로필 페이지 전체를 DB로 옮기기 위해 필요.
  -- A-06(빌더 관리 화면) 전까지는 이 필드들은 SQL로만 편집한다.
  bio text,
  focus text,
  stack_tags text[] not null default '{}',
  principles jsonb not null default '[]',
  extra_link jsonb,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  type public.category_type not null,
  sort int not null default 0,
  unique (type, slug)
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  category_id uuid references public.categories(id),
  hero_url text,
  thumb_url text,
  body_problem text,
  body_solution text,
  body_result text,
  tech_tags text[] not null default '{}',
  tag_label text,
  period_label text,
  scope_label text,
  result_url text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.builders(id),
  reject_reason text,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index works_status_idx on public.works (status);
create index works_category_idx on public.works (category_id);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  body_html text not null default '',
  thumb_url text,
  category_id uuid references public.categories(id),
  author_id uuid references public.builders(id),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  reject_reason text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index insights_status_idx on public.insights (status);
create index insights_category_idx on public.insights (category_id);

create table public.work_builders (
  work_id uuid not null references public.works(id) on delete cascade,
  builder_id uuid not null references public.builders(id) on delete cascade,
  role_label text,
  sort int not null default 0,
  primary key (work_id, builder_id)
);

create table public.redirects (
  from_path text primary key,
  to_path text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger works_touch before update on public.works
  for each row execute function public.set_updated_at();
create trigger insights_touch before update on public.insights
  for each row execute function public.set_updated_at();
