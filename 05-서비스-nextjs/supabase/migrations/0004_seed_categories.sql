-- 카테고리 시드 — app/work/view.tsx 의 칩(data-cat)과 app/insight/view.tsx 의 탭 값 그대로.

insert into public.categories (slug, name, type, sort) values
  ('aiax', 'AI · AX', 'work', 1),
  ('commerce', 'Commerce', 'work', 2),
  ('platform', 'Platform · Admin', 'work', 3),
  ('finance', 'Finance', 'work', 4)
on conflict (type, slug) do nothing;

insert into public.categories (slug, name, type, sort) values
  ('ai-ax', 'AI · AX', 'insight', 1),
  ('guide', '발주 가이드', 'insight', 2),
  ('how', '일하는 방식', 'insight', 3),
  ('project', '프로젝트', 'insight', 4)
on conflict (type, slug) do nothing;
