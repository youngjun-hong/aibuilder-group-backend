import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/* 세션 인식 클라이언트 — 서버 컴포넌트·서버 액션 전용(DR-02: 브라우저에서 직접 호출 금지).
   RLS가 현재 로그인한 사용자 기준으로 적용된다. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            /* Server Component에서 호출되면 실패한다 — middleware가 세션 쿠키를 갱신하므로 무시해도 된다. */
          }
        },
      },
    },
  )
}
