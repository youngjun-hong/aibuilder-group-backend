-- Supabase 프로젝트 생성 시 기본으로 걸려있어야 할 스키마 권한이 새로 만든 테이블에는
-- 자동 상속되지 않았다(service_role도 RLS는 우회하지만 GRANT 자체는 있어야 함).
-- 표준 Supabase 베이스라인과 동일하게 맞춘다. RLS 정책(0003)이 그 위에서 실제 접근을 제한한다.

grant usage on schema public to service_role, authenticated, anon;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
