-- FAQ 관리 — Content(videos/channels)와 동일한 성격: 개별 빌더 콘텐츠가 아니라
-- 브랜드 레벨 정적 정보라 상태머신 없이 admin 전용 CRUD + is_active 토글만 둔다.
-- show_on_home: 홈 프리뷰(app/_faq.ts 의 기존 home:true) 노출 여부.

create table public.faq_topics (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  sort int not null default 0
);

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.faq_topics(id) on delete cascade,
  question text not null,
  answer text not null,
  show_on_home boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index faq_items_active_idx on public.faq_items (is_active);
create index faq_items_topic_idx on public.faq_items (topic_id);

create trigger faq_items_touch before update on public.faq_items
  for each row execute function public.set_updated_at();

alter table public.faq_topics enable row level security;
alter table public.faq_items enable row level security;

create policy faq_topics_public_read on public.faq_topics for select using (true);
create policy faq_topics_admin_all on public.faq_topics for all
  using (public.is_admin()) with check (public.is_admin());

create policy faq_items_public_read on public.faq_items for select using (is_active);
create policy faq_items_admin_all on public.faq_items for all
  using (public.is_admin()) with check (public.is_admin());
