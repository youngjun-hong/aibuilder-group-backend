import { createClient } from '@supabase/supabase-js'

/** 세션 비의존 익명 클라이언트 — 공개(published-only/is_active) 콘텐츠 조회 전용.
 *  next/headers 의 cookies() 를 쓰지 않아 generateStaticParams 처럼 요청 컨텍스트가
 *  없는 곳에서도 호출할 수 있다. anon key 만 쓰므로 RLS 의 공개 정책 이상은 볼 수 없다. */
export function createAnonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
