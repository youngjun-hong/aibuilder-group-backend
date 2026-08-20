import { createClient } from '@/lib/supabase/server'
import { createAnonClient } from '@/lib/supabase/anon'
import { createServiceClient } from '@/lib/supabase/service'
import type { AdminWorkRow, ContentStatus, WorkCard, WorkDetail } from '@/lib/types'

type WorkBuilderRow = { role_label: string | null; sort: number; builder: { slug: string; name: string } | null }
type WorkCardRow = {
  id: string
  slug: string
  title: string
  summary: string
  thumb_url: string | null
  tag_label: string | null
  with_partner: boolean
  published_at: string | null
  category: { slug: string; name: string } | null
  work_builders: WorkBuilderRow[]
}

const CARD_COLUMNS = `
  id, slug, title, summary, thumb_url, tag_label, with_partner, published_at,
  category:categories(slug, name),
  work_builders(role_label, sort, builder:builders(slug, name))
`

function withTeamLabel(withPartner: boolean, builders: { name: string }[]): string | null {
  if (builders.length === 0) return null
  const names = builders.map(b => b.name).join(', ')
  return withPartner ? `with 똑똑한개발자 · ${names}` : names
}

function yearOf(publishedAt: string | null): string {
  return publishedAt ? String(new Date(publishedAt).getFullYear()) : ''
}

function sortedBuilders(row: WorkCardRow) {
  return [...row.work_builders].sort((a, b) => a.sort - b.sort).filter(wb => wb.builder)
}

function mapWorkCard(row: WorkCardRow): WorkCard {
  const builders = sortedBuilders(row).map(wb => wb.builder!)
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    categorySlug: row.category?.slug ?? null,
    tagLabel: row.tag_label,
    year: yearOf(row.published_at),
    thumbUrl: row.thumb_url,
    withTeamLabel: withTeamLabel(row.with_partner, builders),
  }
}

/** 공개 목록 — /work. 명시 컬럼만 select 한다(DR-03). 세션 비의존(build-time 에서도 호출됨). */
export async function listPublishedWorks(): Promise<WorkCard[]> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('works')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data as unknown as WorkCardRow[]).map(mapWorkCard)
}

/** 공개 상세 — /work/[slug]. published 상태만 반환(그 외는 null → notFound 처리). 세션 비의존. */
export async function getPublishedWorkBySlug(slug: string): Promise<WorkDetail | null> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('works')
    .select(`
      ${CARD_COLUMNS},
      hero_url, body_problem, body_solution, body_result, tech_tags,
      period_label, scope_label, result_url, seo_title, seo_description, og_image_url, status
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as unknown as WorkCardRow & {
    hero_url: string | null
    body_problem: string | null
    body_solution: string | null
    body_result: string | null
    tech_tags: string[]
    period_label: string | null
    scope_label: string | null
    result_url: string | null
    seo_title: string | null
    seo_description: string | null
    og_image_url: string | null
    status: ContentStatus
  }
  return {
    ...mapWorkCard(row),
    heroUrl: row.hero_url,
    bodyProblem: row.body_problem,
    bodySolution: row.body_solution,
    bodyResult: row.body_result,
    techTags: row.tech_tags ?? [],
    periodLabel: row.period_label,
    scopeLabel: row.scope_label,
    resultUrl: row.result_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    ogImageUrl: row.og_image_url,
    status: row.status,
    builders: sortedBuilders(row).map(wb => ({ slug: wb.builder!.slug, name: wb.builder!.name, roleLabel: wb.role_label })),
  }
}

/** A-07 미리보기 전용 — 상태 무관, 세션 인증 필요(RLS: admin 전체 / 작성자 본인).
 *  공개 렌더 컴포넌트(app/work/[slug]/view.tsx)에 그대로 먹인다(FR-A07-02: 공개와 동일 렌더). */
export async function getWorkByIdForPreview(id: string): Promise<WorkDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select(`
      ${CARD_COLUMNS},
      hero_url, body_problem, body_solution, body_result, tech_tags,
      period_label, scope_label, result_url, seo_title, seo_description, og_image_url, status
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as unknown as WorkCardRow & {
    hero_url: string | null
    body_problem: string | null
    body_solution: string | null
    body_result: string | null
    tech_tags: string[]
    period_label: string | null
    scope_label: string | null
    result_url: string | null
    seo_title: string | null
    seo_description: string | null
    og_image_url: string | null
    status: ContentStatus
  }
  return {
    ...mapWorkCard(row),
    heroUrl: row.hero_url,
    bodyProblem: row.body_problem,
    bodySolution: row.body_solution,
    bodyResult: row.body_result,
    techTags: row.tech_tags ?? [],
    periodLabel: row.period_label,
    scopeLabel: row.scope_label,
    resultUrl: row.result_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    ogImageUrl: row.og_image_url,
    status: row.status,
    builders: sortedBuilders(row).map(wb => ({ slug: wb.builder!.slug, name: wb.builder!.name, roleLabel: wb.role_label })),
  }
}

/** 빌더 프로필(app/builder)의 "이 빌더의 작업물" 그리드 — 공개 프로젝트만, 해당 빌더 기준. */
export async function listPublishedWorksForBuilder(builderId: string): Promise<WorkCard[]> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('works')
    .select(`
      id, slug, title, summary, thumb_url, tag_label, with_partner, published_at,
      category:categories(slug, name),
      work_builders!inner(role_label, sort, builder_id, builder:builders(slug, name))
    `)
    .eq('status', 'published')
    .eq('work_builders.builder_id', builderId)
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data as unknown as WorkCardRow[]).map(mapWorkCard)
}

/** 슬러그 유일성 체크 (FR-A03-04/FR-A05-03) — 자기 자신은 제외. */
export async function isWorkSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = createServiceClient() // 상태 무관 전체 슬러그 대상 체크 — RLS 로 가려지면 안 됨
  let query = supabase.from('works').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return !!data
}

/* ── 관리자 전용 (서버 액션·관리자 페이지에서만 호출) ── */

export async function listWorksForAdmin(opts: {
  builderId: string
  isAdmin: boolean
  status?: ContentStatus
  q?: string
}): Promise<AdminWorkRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('works')
    .select(`
      id, slug, title, status, updated_at, reject_reason,
      category:categories(name),
      work_builders(builder:builders(name))
    `)
    .order('updated_at', { ascending: false })

  if (!opts.isAdmin) query = query.eq('created_by', opts.builderId)
  if (opts.status) query = query.eq('status', opts.status)
  if (opts.q) query = query.ilike('title', `%${opts.q}%`)

  const { data, error } = await query
  if (error) throw error
  return (data as any[]).map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    categoryName: row.category?.name ?? null,
    builderNames: (row.work_builders ?? []).map((wb: any) => wb.builder?.name).filter(Boolean),
    updatedAt: row.updated_at,
    rejectReason: row.reject_reason,
  }))
}

export async function getWorkByIdForAdmin(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('works')
    .select(`
      id, slug, title, summary, category_id, hero_url, thumb_url, tag_label, with_partner,
      body_problem, body_solution, body_result, tech_tags, period_label, scope_label, result_url,
      status, published_at, created_by, reject_reason, seo_title, seo_description, og_image_url,
      work_builders(builder_id, role_label, sort)
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}
