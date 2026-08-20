'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

function revalidateContent() {
  revalidatePath('/content')
}

export type VideoFormState = { error: string | null }

export async function saveVideo(_prev: VideoFormState, formData: FormData): Promise<VideoFormState> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const youtubeId = String(formData.get('youtube_id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null
  const durationLabel = String(formData.get('duration_label') ?? '').trim() || null
  const channelId = String(formData.get('channel_id') ?? '') || null
  const isFeatured = formData.get('is_featured') === 'on'

  if (!youtubeId) return { error: '유튜브 영상 ID를 입력하세요' }
  if (!title) return { error: '제목을 입력하세요' }

  const supabase = await createClient()

  // 피처드는 동시에 1건만 — 새로 지정하면 기존 피처드를 해제한다
  if (isFeatured) {
    await supabase.from('videos').update({ is_featured: false }).eq('is_featured', true)
  }

  if (id && id !== 'new') {
    const { error } = await supabase
      .from('videos')
      .update({ youtube_id: youtubeId, title, subtitle, duration_label: durationLabel, channel_id: channelId, is_featured: isFeatured })
      .eq('id', id)
    if (error) return { error: '저장에 실패했습니다: ' + error.message }
    revalidateContent()
    return { error: null }
  }

  const { data: maxSort } = await supabase.from('videos').select('sort').order('sort', { ascending: false }).limit(1).maybeSingle()
  const { error } = await supabase.from('videos').insert({
    youtube_id: youtubeId, title, subtitle, duration_label: durationLabel, channel_id: channelId,
    is_featured: isFeatured, is_active: true, sort: (maxSort?.sort ?? -1) + 1,
  })
  if (error) return { error: '저장에 실패했습니다: ' + error.message }
  revalidateContent()
  redirect('/admin/content')
}

export async function toggleVideoActive(id: string, isActive: boolean) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('videos').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateContent()
}

export async function setFeaturedVideo(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('videos').update({ is_featured: false }).eq('is_featured', true)
  const { error } = await supabase.from('videos').update({ is_featured: true }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateContent()
}

export async function deleteVideo(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('videos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidateContent()
}

export async function saveChannel(id: string, name: string, href: string) {
  await requireAdmin()
  if (!name.trim() || !href.trim()) throw new Error('채널명과 링크를 모두 입력하세요')
  const supabase = await createClient()
  const { error } = await supabase.from('channels').update({ name, href }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateContent()
}
