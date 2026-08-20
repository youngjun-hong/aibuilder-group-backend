-- 홈 화면의 순수 텍스트 카피(히어로 제목·리본 문구·신뢰 섹션·문제제기·프로세스·매칭·
-- 최종 CTA·플로팅 독 등) 전부를 admin 이 편집할 수 있게 하는 범용 key-value 테이블.
-- 필드가 ~140개라 Insight/Work 처럼 전용 컬럼을 두지 않고 하나의 테이블로 통일한다.
-- 애니메이션 타이밍과 물린 구조(히어로 배경 스크롤 이미지 목록, 브랜드 로고 마퀴 목록,
-- 4단계 플로우의 DOM 순서)는 범위에서 제외 — 그 항목들의 "값"은 이 테이블에 없다.

create table public.site_content (
  key text primary key,
  section text not null,
  label text not null,
  value text not null,
  sort int not null default 0
);
create index site_content_section_idx on public.site_content (section, sort);

alter table public.site_content enable row level security;

create policy site_content_public_read on public.site_content for select using (true);
create policy site_content_admin_all on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());
