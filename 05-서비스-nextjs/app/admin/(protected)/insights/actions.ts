'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireActiveBuilder, requireAdmin } from '@/lib/auth/session'
import { assertTransition } from '@/lib/content/state-machine'
import { sanitizeInsightBody } from '@/lib/content/sanitize'
import { validateSlugFormat, recordRedirectOnSlugChange, recordRedirectOnArchive, clearRedirectOnRestore } from '@/lib/content/slug'
import { isInsightSlugTaken, getInsightByIdForAdmin } from '@/lib/data/insights'
import { revalidateInsight } from '@/lib/revalidate'
import type { ContentStatus } from '@/lib/types'

export type InsightFormState = { error: string | null }

async function loadOwned(id: string, builder: { id: string; role: string }) {
  const row = await getInsightByIdForAdmin(id)
  if (!row) throw new Error('not_found')
  if (builder.role !== 'admin' && row.author_id !== builder.id) throw new Error('forbidden')
  return row
}

/** 저장 — 없으면 생성(초안), 있으면 갱신. pending 상태는 잠겨서 저장 불가(DR-07). */
export async function saveInsight(_prev: InsightFormState, formData: FormData): Promise<InsightFormState> {
  const builder = await requireActiveBuilder()
  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim()
  const excerpt = String(formData.get('excerpt') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '') || null
  const thumbUrl = String(formData.get('thumb_url') ?? '').trim() || null
  const seoTitle = String(formData.get('seo_title') ?? '').trim() || null
  const seoDescription = String(formData.get('seo_description') ?? '').trim() || null
  const bodyHtml = sanitizeInsightBody(String(formData.get('body_html') ?? '')) // FR-A03-02·03

  if (!title) return { error: '제목을 입력하세요' }
  if (!slug || !validateSlugFormat(slug)) return { error: '슬러그는 영문 소문자·숫자·하이픈만 가능합니다 (예: my-post)' }
  if (!excerpt) return { error: '요약을 입력하세요' }

  const supabase = await createClient()

  if (id && id !== 'new') {
    const existing = await loadOwned(id, builder)
    if (existing.status === 'pending') return { error: '승인대기 상태에서는 수정할 수 없습니다' }
    if (await isInsightSlugTaken(slug, id)) return { error: '이미 사용 중인 슬러그입니다' }

    const { error } = await supabase
      .from('insights')
      .update({
        title, slug, excerpt, body_html: bodyHtml, category_id: categoryId,
        thumb_url: thumbUrl, seo_title: seoTitle, seo_description: seoDescription,
      })
      .eq('id', id)
    if (error) return { error: '저장에 실패했습니다: ' + error.message }

    if (existing.slug !== slug && existing.status === 'published') {
      await recordRedirectOnSlugChange('insights', existing.slug, slug) // FR-A03-05
    }
    revalidateInsight(existing.slug)
    revalidateInsight(slug)
    return { error: null }
  }

  if (await isInsightSlugTaken(slug)) return { error: '이미 사용 중인 슬러그입니다' }
  const { data, error } = await supabase
    .from('insights')
    .insert({
      title, slug, excerpt, body_html: bodyHtml, category_id: categoryId,
      thumb_url: thumbUrl, seo_title: seoTitle, seo_description: seoDescription,
      author_id: builder.id, status: 'draft',
    })
    .select('id')
    .single()
  if (error || !data) return { error: '저장에 실패했습니다: ' + (error?.message ?? '') }
  redirect(`/admin/insights/${data.id}`)
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

  const { error } = await supabase.from('insights').update(patch).eq('id', id)
  if (error) throw new Error(error.message)

  if (to === 'archived') await recordRedirectOnArchive('insights', existing.slug) // DR-08
  if (to === 'published' && existing.status === 'archived') await clearRedirectOnRestore('insights', existing.slug)
  revalidateInsight(existing.slug)
}

/** FR-A03-07 — 제출(승인대기로). */
export async function submitInsight(id: string) {
  await transition(id, 'pending')
}

/** 관리자만 — 승인대기 → 발행. A-07 에서도 이 함수를 그대로 쓴다. */
export async function publishInsight(id: string) {
  await requireAdmin()
  await transition(id, 'published')
}

/** 관리자만 — 반려 사유 필수(FR-A07-04). */
export async function rejectInsight(id: string, reason: string) {
  await requireAdmin()
  if (!reason.trim()) throw new Error('반려 사유를 입력하세요')
  await transition(id, 'rejected', { rejectReason: reason })
}

export async function archiveInsight(id: string) {
  await requireAdmin()
  await transition(id, 'archived')
}

export async function restoreInsight(id: string) {
  await requireAdmin()
  await transition(id, 'published')
}

/** FR-A02-02 — 삭제는 관리자만, 확인 모달 경유(호출측 ConfirmButton). */
export async function deleteInsight(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const row = await getInsightByIdForAdmin(id)
  const { error } = await supabase.from('insights').delete().eq('id', id)
  if (error) throw new Error(error.message)
  if (row) revalidateInsight(row.slug)
}
