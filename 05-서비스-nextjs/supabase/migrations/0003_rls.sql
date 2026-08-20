-- RLS (DR-04: 전 테이블 활성화). 상태 머신(§7.3)의 최종 강제는 애플리케이션 레이어
-- (lib/content/state-machine.ts)에서 하고, 여기서는 "빌더가 published 직행 불가 /
-- pending 편집 불가"의 백스톱 역할만 한다.

alter table public.builders enable row level security;
alter table public.categories enable row level security;
alter table public.works enable row level security;
alter table public.insights enable row level security;
alter table public.work_builders enable row level security;
alter table public.redirects enable row level security;

create or replace function public.current_builder_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.builders where auth_user_id = auth.uid() and is_active limit 1;
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.builders
    where auth_user_id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- categories: 공개 읽기만. 쓰기는 service role 전용(정책 없음).
create policy categories_read on public.categories for select using (true);

-- builders
create policy builders_public_read on public.builders for select using (is_active);
create policy builders_self_read on public.builders for select using (auth_user_id = auth.uid());
create policy builders_self_update on public.builders for update
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy builders_admin_all on public.builders for all
  using (public.is_admin()) with check (public.is_admin());

-- works
create policy works_public_read on public.works for select using (status = 'published');
create policy works_owner_read on public.works for select using (created_by = public.current_builder_id());
create policy works_admin_read on public.works for select using (public.is_admin());
create policy works_owner_insert on public.works for insert
  with check (created_by = public.current_builder_id());
create policy works_owner_update on public.works for update
  using (created_by = public.current_builder_id() and status in ('draft', 'rejected'))
  with check (created_by = public.current_builder_id() and status in ('draft', 'pending'));
create policy works_admin_update on public.works for update
  using (public.is_admin()) with check (public.is_admin());
create policy works_admin_delete on public.works for delete using (public.is_admin());

-- insights (works와 동일 패턴, created_by → author_id)
create policy insights_public_read on public.insights for select using (status = 'published');
create policy insights_owner_read on public.insights for select using (author_id = public.current_builder_id());
create policy insights_admin_read on public.insights for select using (public.is_admin());
create policy insights_owner_insert on public.insights for insert
  with check (author_id = public.current_builder_id());
create policy insights_owner_update on public.insights for update
  using (author_id = public.current_builder_id() and status in ('draft', 'rejected'))
  with check (author_id = public.current_builder_id() and status in ('draft', 'pending'));
create policy insights_admin_update on public.insights for update
  using (public.is_admin()) with check (public.is_admin());
create policy insights_admin_delete on public.insights for delete using (public.is_admin());

-- work_builders
create policy work_builders_public_read on public.work_builders for select
  using (exists (select 1 from public.works w where w.id = work_id and w.status = 'published'));
create policy work_builders_owner_read on public.work_builders for select
  using (exists (select 1 from public.works w where w.id = work_id and w.created_by = public.current_builder_id()));
create policy work_builders_admin_all on public.work_builders for all
  using (public.is_admin()) with check (public.is_admin());
create policy work_builders_owner_write on public.work_builders for all
  using (exists (
    select 1 from public.works w
    where w.id = work_id and w.created_by = public.current_builder_id() and w.status in ('draft', 'rejected')
  ))
  with check (exists (
    select 1 from public.works w
    where w.id = work_id and w.created_by = public.current_builder_id() and w.status in ('draft', 'pending')
  ));

-- redirects: 클라이언트용 정책 없음 — 조회는 항상 service role 클라이언트로만 한다
-- (미들웨어의 301 판정, DR-02). 관리자 화면에서 보여줄 때만 읽기 허용.
create policy redirects_admin_read on public.redirects for select using (public.is_admin());
