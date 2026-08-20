import { createClient } from '@/lib/supabase/server'
import { createAnonClient } from '@/lib/supabase/anon'
import type { FaqTopic } from '@/app/_faq'

/* FaqList(components/FaqList.tsx) 가 기대하는 모양(key/label/items[{id,q,a}])을 그대로
   맞춰서 반환한다 — 홈/​FAQ 페이지의 렌더 컴포넌트는 안 건드리고 데이터만 DB 로 옮긴다. */
async function fetchTopics(onlyHome: boolean): Promise<FaqTopic[]> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('faq_topics')
    .select('key, label, sort, items:faq_items(id, question, answer, sort, show_on_home, is_active)')
    .order('sort')
  if (error) throw error

  return (data ?? [])
    .map(t => ({
      key: t.key,
      label: t.label,
      items: (t.items ?? [])
        .filter((i: any) => i.is_active && (!onlyHome || i.show_on_home))
        .sort((a: any, b: any) => a.sort - b.sort)
        .map((i: any) => ({ id: i.id, q: i.question, a: i.answer })),
    }))
    .filter(t => t.items.length > 0)
}

/** 공개 /faq — 활성 문항 전체. */
export async function listFaqTopics(): Promise<FaqTopic[]> {
  return fetchTopics(false)
}

/** 홈 프리뷰 — show_on_home 문항만(기존 app/_faq.ts 의 FAQ_HOME과 동일 규칙). */
export async function listFaqHomeTopics(): Promise<FaqTopic[]> {
  return fetchTopics(true)
}

/* ── 관리자 ── */

export type AdminFaqItem = {
  id: string
  topicId: string
  topicLabel: string
  question: string
  answer: string
  showOnHome: boolean
  isActive: boolean
  sort: number
}

export async function listFaqTopicsForAdmin(): Promise<{ id: string; key: string; label: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('faq_topics').select('id, key, label').order('sort')
  if (error) throw error
  return data ?? []
}

export async function listFaqItemsForAdmin(): Promise<AdminFaqItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, topic_id, question, answer, show_on_home, is_active, sort, topic:faq_topics(label)')
    .order('sort')
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    topicId: r.topic_id,
    topicLabel: r.topic?.label ?? '',
    question: r.question,
    answer: r.answer,
    showOnHome: r.show_on_home,
    isActive: r.is_active,
    sort: r.sort,
  }))
}

export async function getFaqItemByIdForAdmin(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, topic_id, question, answer, show_on_home, is_active')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}
