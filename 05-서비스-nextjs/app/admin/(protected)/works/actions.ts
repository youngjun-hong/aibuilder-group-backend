'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireActiveBuilder, requireAdmin } from '@/lib/auth/session'
import { assertTransition } from '@/lib/content/state-machine'
import { validateSlugFormat, recordRedirectOnSlugChange, recordRedirectOnArchive, clearRedirectOnRestore } from '@/lib/content/slug'
import { isWorkSlugTaken, getWorkByIdForAdmin } from '@/lib/data/works'
import { revalidateWork } from '@/lib/revalidate'
import { logActivity } from '@/lib/activityLog'
import type { ContentStatus } from '@/lib/types'

export type WorkFormState = { error: string | null }

async function loadOwned(id: string, builder: { id: string; role: string }) {
  const row = await getWorkByIdForAdmin(id)
  if (!row) throw new Error('not_found')
  if (builder.role !== 'admin' && row.created_by !== builder.id) throw new Error('forbidden')
  return row
}

/** 참여 빌더 목록을 폼에서 받은 값으로 통째로 교체한다. */
async function syncWorkBuilders(workId: string, entries: { builderId: string; roleLabel: string }[]) {
  const service = (await import('@/lib/supabase/service')).createServiceClient()
  await service.from('work_builders').delete().eq('work_id', workId)
  if (entries.length === 0) return
  const { error } = await service.from('work_builders').insert(
    entries.map((e, i) => ({ work_id: workId, builder_id: e.builderId, role_label: e.roleLabel || null, sort: i })),
  )
  if (error) throw new Error(error.message)
}

export async function saveWork(_prev: WorkFormState, formData: FormData): Promise<WorkFormState> {
  const builder = await requireActiveBuilder()
  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim()
  const summary = String(formData.get('summary') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '') || null
  const heroUrl = String(formData.get('hero_url') ?? '').trim() || null
  const thumbUrl = String(formData.get('thumb_url') ?? '').trim() || heroUrl
  const bodyProblem = String(formData.get('body_problem') ?? '').trim() || null
  const bodySolution = String(formData.get('body_solution') ?? '').trim() || null
  const bodyResult = String(formData.get('body_result') ?? '').trim() || null
  const techTags = String(formData.get('tech_tags') ?? '').split(',').map(t => t.trim()).filter(Boolean)
  const periodLabel = String(formData.get('period_label') ?? '').trim() || null
  const scopeLabel = String(formData.get('scope_label') ?? '').trim() || null
  const resultUrl = String(formData.get('result_url') ?? '').trim() || null
  const seoTitle = String(formData.get('seo_title') ?? '').trim() || null
  const seoDescription = String(formData.get('seo_description') ?? '').trim() || null
  const ogImageUrl = String(formData.get('og_image_url') ?? '').trim() || null
  const builderIds = formData.getAll('builder_id').map(String)
  const builderRoles = formData.getAll('builder_role_label').map(String)
  const builderEntries = builderIds.map((bId, i) => ({ builderId: bId, roleLabel: builderRoles[i] ?? '' }))

  if (!title) return { error: '제목을 입력하세요' }
  // FR-A05-03 — 슬러그 규칙: 업종·기술 + 프로젝트명, 고객사명 제외(자동 검증은 불가 — 안내 문구로 대체)
  if (!slug || !validateSlugFormat(slug)) return { error: '슬러그는 영문 소문자·숫자·하이픈만 가능합니다' }
  if (!summary) return { error: '개요를 입력하세요' }

  const supabase = await createClient()

  if (id && id !== 'new') {
    const existing = await loadOwned(id, builder)
    if (existing.status === 'pending') return { error: '승인대기 상태에서는 수정할 수 없습니다' }
    if (await isWorkSlugTaken(slug, id)) return { error: '이미 사용 중인 슬러그입니다' }

    const { error } = await supabase
      .from('works')
      .update({
        title, slug, summary, category_id: categoryId, hero_url: heroUrl, thumb_url: thumbUrl,
        body_problem: bodyProblem, body_solution: bodySolution, body_result: bodyResult,
        tech_tags: techTags, period_label: periodLabel, scope_label: scopeLabel, result_url: resultUrl,
        seo_title: seoTitle, seo_description: seoDescription, og_image_url: ogImageUrl,
      })
      .eq('id', id)
    if (error) return { error: '저장에 실패했습니다: ' + error.message }

    await syncWorkBuilders(id, builderEntries)

    if (existing.slug !== slug && existing.status === 'published') {
      await recordRedirectOnSlugChange('works', existing.slug, slug) // FR-A05-05
    }
    revalidateWork(existing.slug)
    revalidateWork(slug)
    await logActivity('work', id, title, 'updated', builder.name)
    return { error: null }
  }

  if (await isWorkSlugTaken(slug)) return { error: '이미 사용 중인 슬러그입니다' }
  const { data, error } = await supabase
    .from('works')
    .insert({
      title, slug, summary, category_id: categoryId, hero_url: heroUrl, thumb_url: thumbUrl,
      body_problem: bodyProblem, body_solution: bodySolution, body_result: bodyResult,
      tech_tags: techTags, period_label: periodLabel, scope_label: scopeLabel, result_url: resultUrl,
      seo_title: seoTitle, seo_description: seoDescription, og_image_url: ogImageUrl,
      created_by: builder.id, status: 'draft',
    })
    .select('id')
    .single()
  if (error || !data) return { error: '저장에 실패했습니다: ' + (error?.message ?? '') }
  await syncWorkBuilders(data.id, builderEntries)
  await logActivity('work', data.id, title, 'created', builder.name)
  redirect(`/admin/works/${data.id}`)
}

async function transition(id: string, to: ContentStatus, opts?: { rejectReason?: string }) {
  const builder = await requireActiveBuilder()
  const existing = await loadOwned(id, builder)
  assertTransition(existing.status, to, builder.role)

  const supabase = await createClient()
  const patch: Record<string, unknown> = { status: to }
  if (to === 'published') {
    patch.published_at = new Date().toISOString()
    patch.reject_reason = null
  }
  if (to === 'rejected') patch.reject_reason = opts?.rejectReason ?? ''
  if (to === 'draft') patch.reject_reason = null

  const { error } = await supabase.from('works').update(patch).eq('id', id)
  if (error) throw new Error(error.message)

  if (to === 'archived') await recordRedirectOnArchive('works', existing.slug)
  if (to === 'published' && existing.status === 'archived') await clearRedirectOnRestore('works', existing.slug)
  revalidateWork(existing.slug)
}

export async function submitWork(id: string) {
  await transition(id, 'pending')
}
export async function publishWork(id: string) {
  await requireAdmin()
  await transition(id, 'published')
}
export async function rejectWork(id: string, reason: string) {
  await requireAdmin()
  if (!reason.trim()) throw new Error('반려 사유를 입력하세요')
  await transition(id, 'rejected', { rejectReason: reason })
}
export async function archiveWork(id: string) {
  await requireAdmin()
  await transition(id, 'archived')
}
export async function restoreWork(id: string) {
  await requireAdmin()
  await transition(id, 'published')
}

export async function deleteWork(id: string) {
  const builder = await requireAdmin()
  const supabase = await createClient()
  const row = await getWorkByIdForAdmin(id)
  const { error } = await supabase.from('works').delete().eq('id', id)
  if (error) throw new Error(error.message)
  if (row) {
    revalidateWork(row.slug)
    await logActivity('work', id, row.title, 'deleted', builder.name)
  }
}
