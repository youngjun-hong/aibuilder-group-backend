import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { BuilderRole } from '@/lib/types'

export type SessionBuilder = {
  id: string
  slug: string
  name: string
  email: string
  role: BuilderRole
}

/** 로그인 + 활성 상태(is_active) 확인까지 마친 현재 사용자. 없으면 null. */
export async function getCurrentBuilder(): Promise<SessionBuilder | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('builders')
    .select('id, slug, name, email, role, is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!data || !data.is_active) return null

  return { id: data.id, slug: data.slug, name: data.name, email: data.email, role: data.role }
}

/** /admin/* 페이지 상단에서 호출 — 없으면 로그인으로 리다이렉트.
 *  FR-A00-01 의 1차 방어선은 middleware.ts 이고, 이건 서버 컴포넌트 레벨의 2차 방어선. */
export async function requireActiveBuilder(): Promise<SessionBuilder> {
  const builder = await getCurrentBuilder()
  if (!builder) redirect('/admin/login')
  return builder
}

/** 관리자 전용 화면/액션에서 호출 (A-07 승인대기 등). 빌더가 접근하면 예외를 던진다 —
 *  /admin/approvals/** 경로는 middleware.ts 가 이미 403 으로 막으므로 이건 defense-in-depth. */
export async function requireAdmin(): Promise<SessionBuilder> {
  const builder = await requireActiveBuilder()
  if (builder.role !== 'admin') {
    throw new Error('FORBIDDEN: 관리자 전용입니다')
  }
  return builder
}
