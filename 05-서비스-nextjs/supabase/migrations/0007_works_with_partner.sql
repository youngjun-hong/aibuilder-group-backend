-- 원본 app/builder/view.tsx PROJECTS 의 `w`(파트너 똑똑한개발자와 함께 진행) 플래그.
-- work_builders 참여자 목록만으로는 "with 똑똑한개발자 · " 접두 표기 여부를 복원할 수 없어
-- 별도 컬럼으로 보존한다.
alter table public.works add column with_partner boolean not null default false;
