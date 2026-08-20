'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

function revalidateFaq() {
  revalidatePath('/')
  revalidatePath('/faq')
}

export type FaqFormState = { error: string | null }

export async function saveFaqItem(_prev: FaqFormState, formData: FormData): Promise<FaqFormState> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const topicId = String(formData.get('topic_id') ?? '')
  const question = String(formData.get('question') ?? '').trim()
  const answer = String(formData.get('answer') ?? '').trim()
  const showOnHome = formData.get('show_on_home') === 'on'

  if (!topicId) return { error: '주제를 선택하세요' }
  if (!question) return { error: '질문을 입력하세요' }
  if (!answer) return { error: '답변을 입력하세요' }

  const supabase = await createClient()

  if (id && id !== 'new') {
    const { error } = await supabase
      .from('faq_items')
      .update({ topic_id: topicId, question, answer, show_on_home: showOnHome })
      .eq('id', id)
    if (error) return { error: '저장에 실패했습니다: ' + error.message }
    revalidateFaq()
    return { error: null }
  }

  const { data: maxSort } = await supabase
    .from('faq_items')
    .select('sort')
    .eq('topic_id', topicId)
    .order('sort', { ascending: false })
    .limit(1)
    .maybeSingle()
  const { error } = await supabase.from('faq_items').insert({
    topic_id: topicId, question, answer, show_on_home: showOnHome,
    is_active: true, sort: (maxSort?.sort ?? -1) + 1,
  })
  if (error) return { error: '저장에 실패했습니다: ' + error.message }
  revalidateFaq()
  redirect('/admin/faq')
}

export async function toggleFaqItemActive(id: string, isActive: boolean) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('faq_items').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateFaq()
}

export async function deleteFaqItem(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('faq_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidateFaq()
}
