-- 확장 + enum 타입
create extension if not exists pgcrypto;

create type public.builder_role as enum ('admin', 'builder');
create type public.content_status as enum ('draft', 'pending', 'published', 'rejected', 'archived');
create type public.category_type as enum ('work', 'insight');
