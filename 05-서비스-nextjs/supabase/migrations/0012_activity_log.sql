/* 관리자 대시보드 "최근 활동" — 생성·수정·삭제 이력을 남긴다.
   엔티티 자체(works/insights/videos/faq_items)엔 updated_at 만 있고 "무엇이 왜 바뀌었는지"
   히스토리가 없다 — 특히 삭제는 행 자체가 사라져서 흔적이 아예 안 남는다.
   그래서 별도 로그 테이블에 title 을 그대로 복사해 둔다(엔티티가 삭제된 뒤에도 로그는
   "무엇을 삭제했는지" 보여줘야 하므로 FK 로 join 하지 않고 값을 그대로 저장). */
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('work', 'insight', 'video', 'faq_item', 'builder')),
  entity_id uuid not null,
  title text not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  actor_name text,
  created_at timestamptz not null default now()
);
create index activity_log_created_at_idx on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;

create policy activity_log_admin_read on public.activity_log for select using (public.is_admin());
create policy activity_log_admin_write on public.activity_log for insert with check (public.is_admin());

grant select, insert on public.activity_log to authenticated;
