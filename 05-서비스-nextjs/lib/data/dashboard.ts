import { createClient } from '@/lib/supabase/server'
import type { ContentStatus } from '@/lib/types'

/* 관리자 대시보드(/admin) 내부 통계 — 전부 admin 세션 클라이언트로 조회한다.
   RLS 의 admin-all 정책이 전체 행을 보여주므로 works/insights 는 필터 없이 그대로 select 한다.
   데이터 규모가 작아(수십~수백 행) SQL 뷰/RPC 없이 컬럼만 가볍게 뽑아 JS 에서 집계한다. */

const STATUSES: ContentStatus[] = ['draft', 'pending', 'published', 'rejected', 'archived']

export type StatusCount = { status: ContentStatus; count: number }
export type WeeklyPublishPoint = { weekLabel: string; works: number; insights: number }
export type AgingBucket = { label: string; count: number }
export type NameCount = { name: string; count: number }
export type ActivityEntry = {
  id: string
  entityType: 'work' | 'insight' | 'video' | 'faq_item' | 'builder'
  title: string
  action: 'created' | 'updated' | 'deleted'
  actorName: string | null
  createdAt: string
}

export type InternalDashboardStats = {
  totals: { works: number; insights: number; pending: number; buildersActive: number; buildersTotal: number }
  funnel: { works: StatusCount[]; insights: StatusCount[] }
  publishTrend: WeeklyPublishPoint[]
  pendingAging: AgingBucket[]
  builderActivity: NameCount[]
  categoryDistribution: { works: NameCount[]; insights: NameCount[] }
  content: {
    videos: { active: number; inactive: number; featured: number }
    faq: { active: number; inactive: number; byTopic: NameCount[] }
  }
}

function mondayOf(d: Date): Date {
  const day = (d.getDay() + 6) % 7 // 월=0
  const m = new Date(d)
  m.setDate(d.getDate() - day)
  m.setHours(0, 0, 0, 0)
  return m
}

function countByStatus(rows: { status: ContentStatus }[]): StatusCount[] {
  return STATUSES.map(status => ({ status, count: rows.filter(r => r.status === status).length }))
}

function countByName(rows: (string | null)[]): NameCount[] {
  const map = new Map<string, number>()
  for (const name of rows) {
    if (!name) continue
    map.set(name, (map.get(name) ?? 0) + 1)
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

/** 대시보드 "최근 활동" 피드 — activity_log 최신순 N건. */
export async function getRecentActivity(limit = 12): Promise<ActivityEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activity_log')
    .select('id, entity_type, title, action, actor_name, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    entityType: r.entity_type,
    title: r.title,
    action: r.action,
    actorName: r.actor_name,
    createdAt: r.created_at,
  }))
}

export async function getInternalDashboardStats(): Promise<InternalDashboardStats> {
  const supabase = await createClient()

  const [worksRes, insightsRes, videosRes, faqRes, buildersRes] = await Promise.all([
    supabase
      .from('works')
      .select('status, published_at, updated_at, category:categories(name), author:builders!works_created_by_fkey(name)'),
    supabase
      .from('insights')
      .select('status, published_at, updated_at, category:categories(name), author:builders!insights_author_id_fkey(name)'),
    supabase.from('videos').select('is_active, is_featured'),
    supabase.from('faq_items').select('is_active, topic:faq_topics(label)'),
    supabase.from('builders').select('is_active'),
  ])
  if (worksRes.error) throw worksRes.error
  if (insightsRes.error) throw insightsRes.error
  if (videosRes.error) throw videosRes.error
  if (faqRes.error) throw faqRes.error
  if (buildersRes.error) throw buildersRes.error

  const works = worksRes.data as unknown as {
    status: ContentStatus
    published_at: string | null
    updated_at: string
    category: { name: string } | null
    author: { name: string } | null
  }[]
  const insights = insightsRes.data as unknown as {
    status: ContentStatus
    published_at: string | null
    updated_at: string
    category: { name: string } | null
    author: { name: string } | null
  }[]
  const videos = videosRes.data as unknown as { is_active: boolean; is_featured: boolean }[]
  const faqItems = faqRes.data as unknown as { is_active: boolean; topic: { label: string } | null }[]
  const builders = buildersRes.data as unknown as { is_active: boolean }[]

  /* 발행 추이 — 최근 12주, 월요일 기준 버킷 */
  const now = new Date()
  const weekStarts: Date[] = []
  const weeks: WeeklyPublishPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const monday = mondayOf(d)
    weekStarts.push(monday)
    weeks.push({ weekLabel: `${monday.getMonth() + 1}/${monday.getDate()}`, works: 0, insights: 0 })
  }
  function bucketIndex(iso: string): number {
    const monday = mondayOf(new Date(iso))
    return weekStarts.findIndex(w => w.getTime() === monday.getTime())
  }
  for (const w of works) {
    if (w.status !== 'published' || !w.published_at) continue
    const idx = bucketIndex(w.published_at)
    if (idx >= 0) weeks[idx].works++
  }
  for (const a of insights) {
    if (a.status !== 'published' || !a.published_at) continue
    const idx = bucketIndex(a.published_at)
    if (idx >= 0) weeks[idx].insights++
  }

  /* 승인대기 에이징 — pending 상태의 updated_at(제출 시각) 기준 경과일 */
  const AGING_BUCKETS = [
    { label: '0-1일', max: 1 },
    { label: '1-3일', max: 3 },
    { label: '3-7일', max: 7 },
    { label: '7일+', max: Infinity },
  ]
  const pendingDays = [...works, ...insights]
    .filter(r => r.status === 'pending')
    .map(r => (now.getTime() - new Date(r.updated_at).getTime()) / 86_400_000)
  const pendingAging: AgingBucket[] = AGING_BUCKETS.map((b, i) => {
    const min = i === 0 ? 0 : AGING_BUCKETS[i - 1].max
    return { label: b.label, count: pendingDays.filter(d => d >= min && d < b.max).length }
  })

  return {
    totals: {
      works: works.length,
      insights: insights.length,
      pending: works.filter(w => w.status === 'pending').length + insights.filter(a => a.status === 'pending').length,
      buildersActive: builders.filter(b => b.is_active).length,
      buildersTotal: builders.length,
    },
    funnel: { works: countByStatus(works), insights: countByStatus(insights) },
    publishTrend: weeks,
    pendingAging,
    builderActivity: countByName([...works, ...insights].map(r => r.author?.name ?? null)).slice(0, 8),
    categoryDistribution: {
      works: countByName(works.map(w => w.category?.name ?? null)),
      insights: countByName(insights.map(a => a.category?.name ?? null)),
    },
    content: {
      videos: {
        active: videos.filter(v => v.is_active).length,
        inactive: videos.filter(v => !v.is_active).length,
        featured: videos.filter(v => v.is_featured).length,
      },
      faq: {
        active: faqItems.filter(f => f.is_active).length,
        inactive: faqItems.filter(f => !f.is_active).length,
        byTopic: countByName(faqItems.map(f => f.topic?.label ?? null)),
      },
    },
  }
}
