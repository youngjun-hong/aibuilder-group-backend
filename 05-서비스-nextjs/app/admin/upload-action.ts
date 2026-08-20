'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveBuilder } from '@/lib/auth/session'

/* FR-A03-06/FR-A05-01 — 썸네일·히어로·본문 이미지 업로드. DR-02 를 지키려고 브라우저가
   Supabase Storage 를 직접 호출하지 않고 이 서버 액션을 경유한다. */
export async function uploadContentImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  await requireActiveBuilder()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: '파일을 선택하세요' }
  if (!file.type.startsWith('image/')) return { error: '이미지 파일만 업로드할 수 있습니다' }
  if (file.size > 8 * 1024 * 1024) return { error: '8MB 이하 파일만 업로드할 수 있습니다' }

  const supabase = await createClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('content-media').upload(path, file, { contentType: file.type })
  if (error) return { error: '업로드에 실패했습니다: ' + error.message }

  const { data } = supabase.storage.from('content-media').getPublicUrl(path)
  return { url: data.publicUrl }
}
