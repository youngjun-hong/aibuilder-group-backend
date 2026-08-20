'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/* FR-A01-03 — 실패 사유를 구분하지 않는 일반 메시지(계정 존재 여부 비노출).
   FR-A01-05 는 미들웨어가 세션 발급 이후에도 잡아준다(비활성 계정 즉시 로그인 차단). */
export async function signIn(_prevState: { error: string | null }, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다' }
  }

  redirect('/admin/insights') // FR-A00-03 — 로그인 후 첫 화면은 A-02
}
