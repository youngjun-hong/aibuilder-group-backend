import { createClient } from '@supabase/supabase-js'

/* service-role 클라이언트 — RLS를 우회한다(DR-04). redirects 조회, 상태 전이·재검증 같은
   관리자 특권 쓰기, 시드 스크립트에서만 쓴다. 'use client' 파일에서 import 하면 안 된다. */
export function createServiceClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createServiceClient()는 서버에서만 호출할 수 있습니다 (DR-02)')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}
