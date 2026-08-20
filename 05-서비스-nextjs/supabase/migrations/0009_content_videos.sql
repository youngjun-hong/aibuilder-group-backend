-- Content(유튜브) 관리 — 02-화면설계/P-06-콘텐츠유튜브.md 스펙:
-- "피처드는 관리자가 1건 지정, 미지정 시 최신 영상" / "관리자에서 URL·제목·썸네일 등록(자동연동 금지)".
-- 개별 빌더 포트폴리오가 아니라 브랜드 레벨 큐레이션이라 상태머신 없이 admin 전용 CRUD + is_active 토글만 둔다.

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  href text not null,
  sort int not null default 0
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null,
  channel_id uuid references public.channels(id),
  title text not null,
  subtitle text,
  duration_label text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index videos_active_idx on public.videos (is_active);

create trigger videos_touch before update on public.videos
  for each row execute function public.set_updated_at();

alter table public.channels enable row level security;
alter table public.videos enable row level security;

create policy channels_public_read on public.channels for select using (true);
create policy channels_admin_all on public.channels for all
  using (public.is_admin()) with check (public.is_admin());

create policy videos_public_read on public.videos for select using (is_active);
create policy videos_admin_all on public.videos for all
  using (public.is_admin()) with check (public.is_admin());
