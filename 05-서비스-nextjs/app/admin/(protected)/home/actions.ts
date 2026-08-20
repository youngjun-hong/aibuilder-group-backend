'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

export type SiteContentFormState = { error: string | null; saved?: string }

/** 한 섹션 전체를 한 번에 저장한다 — formData 의 모든 site_key:* 필드를 읽어 upsert. */
export async function saveSiteContentSection(_prev: SiteContentFormState, formData: FormData): Promise<SiteContentFormState> {
  await requireAdmin()
  const section = String(formData.get('section') ?? '')
  if (!section) return { error: '섹션 정보가 없습니다' }

  const rows: { key: string; value: string }[] = []
  for (const [name, value] of formData.entries()) {
    if (name.startsWith('site_key:')) {
      rows.push({ key: name.slice('site_key:'.length), value: String(value) })
    }
  }
  if (rows.length === 0) return { error: '저장할 필드가 없습니다' }

  const supabase = await createClient()
  for (const row of rows) {
    const { error } = await supabase.from('site_content').update({ value: row.value }).eq('key', row.key)
    if (error) return { error: '저장에 실패했습니다: ' + error.message }
  }

  revalidatePath('/')
  return { error: null, saved: section }
}
