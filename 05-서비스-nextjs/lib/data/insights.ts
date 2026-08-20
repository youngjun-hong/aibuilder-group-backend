import { createClient } from '@/lib/supabase/server'
import { createAnonClient } from '@/lib/supabase/anon'
import { createServiceClient } from '@/lib/supabase/service'
import type { AdminInsightRow, ContentStatus, InsightCard, InsightDetail } from '@/lib/types'

type InsightCardRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  thumb_url: string | null
  published_at: string | null
  category: { slug: string; name: string } | null
  author: { name: string } | null
}

const CARD_COLUMNS = `
  id, slug, title, excerpt, thumb_url, published_at,
  category:categories(slug, name),
  author:builders(name)
`

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function mapInsightCard(row: InsightCardRow): InsightCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    categorySlug: row.category?.slug ?? null,
    categoryName: row.category?.name ?? null,
    thumbUrl: row.thumb_url,
    // 미발행(승인대기 미리보기 등)이면 published_at 이 없다 — 날짜 없이 작성자만 표기.
    publishedLabel: row.published_at
      ? `${row.author?.name ?? '똑똑한개발자'} · ${formatDate(row.published_at)}`
      : (row.author?.name ?? '똑똑한개발자'),
  }
}

/** 공개 목록 — /insight. 세션 비의존(build-time 에서도 호출됨). */
export async function listPublishedInsights(): Promise<InsightCard[]> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('insights')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data as unknown as InsightCardRow[]).map(mapInsightCard)
}

/** 공개 상세 — /insight/[slug]. 세션 비의존. */
export async function getPublishedInsightBySlug(slug: string): Promise<InsightDetail | null> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('insights')
    .select(`${CARD_COLUMNS}, body_html, seo_title, seo_description, status`)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as unknown as InsightCardRow & {
    body_html: string
    seo_title: string | null
    seo_description: string | null
    status: ContentStatus
  }
  return {
    ...mapInsightCard(row),
    bodyHtml: row.body_html,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    status: row.status,
  }
}

/** A-07 미리보기 전용 — 상태 무관, 세션 인증 필요. 공개 렌더 컴포넌트에 그대로 먹인다. */
export async function getInsightByIdForPreview(id: string): Promise<InsightDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('insights')
    .select(`${CARD_COLUMNS}, body_html, seo_title, seo_description, status`)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as unknown as InsightCardRow & {
    body_html: string
    seo_title: string | null
    seo_description: string | null
    status: ContentStatus
  }
  return {
    ...mapInsightCard(row),
    bodyHtml: row.body_html,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    status: row.status,
  }
}

export async function isInsightSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = createServiceClient() // 상태 무관 전체 슬러그 대상 체크 — RLS 로 가려지면 안 됨
  let query = supabase.from('insights').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return !!data
}

/* ── 관리자 전용 ── */

export async function listInsightsForAdmin(opts: {
  builderId: string
  isAdmin: boolean
  status?: ContentStatus
  q?: string
}): Promise<AdminInsightRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('insights')
    .select(`
      id, slug, title, status, updated_at, reject_reason,
      category:categories(name, sort),
      author:builders(name)
    `)

  if (!opts.isAdmin) query = query.eq('author_id', opts.builderId)
  if (opts.status) query = query.eq('status', opts.status)
  if (opts.q) query = query.ilike('title', `%${opts.q}%`)

  const { data, error } = await query
  if (error) throw error
  // 공개 /insight 페이지의 카테고리 탭 순서(categories.sort)를 그대로 따르고,
  // 같은 카테고리 안에서는 최근 수정순 — 목록이 실제 홈/공개 페이지 구성과 같은 순서로 보이게.
  return (data as any[])
    .sort((a, b) => {
      const sortDiff = (a.category?.sort ?? 999) - (b.category?.sort ?? 999)
      if (sortDiff !== 0) return sortDiff
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
    .map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      categoryName: row.category?.name ?? null,
      authorName: row.author?.name ?? null,
      updatedAt: row.updated_at,
      rejectReason: row.reject_reason,
    }))
}

export async function getInsightByIdForAdmin(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('insights')
    .select(`
      id, slug, title, excerpt, body_html, category_id, thumb_url, author_id,
      status, published_at, reject_reason, seo_title, seo_description
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}
