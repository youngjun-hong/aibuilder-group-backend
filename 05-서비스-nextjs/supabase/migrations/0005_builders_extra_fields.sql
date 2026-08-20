-- 시드 과정에서 드러난 필드 — 공개 사이트가 실제로 쓰던 값인데 0002에서 빠졌다.
-- done_count: "전체 수행 N건" — work_builders 조인 행 수(공개 가능한 프로젝트만)와는
--   다른, 비공개 프로젝트를 포함한 누적 실적 claim이라 파생 컬럼으로 대체할 수 없다.
-- is_new: "NEW" 뱃지 — 현재 created_at 기준 파생이 불가능(시드가 한 트랜잭션으로 들어가
--   전부 같은 시각을 가짐)하고, 원래도 가입일이 아니라 수동 큐레이션 값이었다.
alter table public.builders
  add column done_count int not null default 0,
  add column is_new boolean not null default false;
