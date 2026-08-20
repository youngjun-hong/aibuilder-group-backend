import { createClient } from '@/lib/supabase/server'
import { createAnonClient } from '@/lib/supabase/anon'

export type Channel = { id: string; slug: string; name: string; href: string; sort: number }
export type Video = {
  id: string
  youtubeId: string
  title: string
  subtitle: string | null
  durationLabel: string | null
  isFeatured: boolean
  channelName: string | null
}
export type AdminVideoRow = Video & { isActive: boolean; channelId: string | null; sort: number }

export async function listChannels(): Promise<Channel[]> {
  const supabase = createAnonClient()
  const { data, error } = await supabase.from('channels').select('id, slug, name, href, sort').order('sort')
  if (error) throw error
  return data as Channel[]
}

/** 공개 /content — 피처드 우선, 없으면 최신 등록순 폴백(02-화면설계 P-06 스펙). */
export async function listActiveVideosWithFeatured(): Promise<{ featured: Video | null; grid: Video[] }> {
  const supabase = createAnonClient()
  const { data, error } = await supabase
    .from('videos')
    .select('id, youtube_id, title, subtitle, duration_label, is_featured, sort, created_at, channel:channels(name)')
    .eq('is_active', true)
    .order('sort')
  if (error) throw error

  const rows = (data ?? []).map(r => ({
    id: r.id,
    youtubeId: r.youtube_id,
    title: r.title,
    subtitle: r.subtitle,
    durationLabel: r.duration_label,
    isFeatured: r.is_featured,
    channelName: (r.channel as any)?.name ?? null,
  }))

  const featured = rows.find(r => r.isFeatured) ?? rows[0] ?? null
  const grid = rows.filter(r => r.id !== featured?.id)
  return { featured, grid }
}

/* ── 관리자 ── */

export async function listVideosForAdmin(): Promise<AdminVideoRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('videos')
    .select('id, youtube_id, title, subtitle, duration_label, is_featured, is_active, channel_id, sort, channel:channels(name)')
    .order('sort')
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    youtubeId: r.youtube_id,
    title: r.title,
    subtitle: r.subtitle,
    durationLabel: r.duration_label,
    isFeatured: r.is_featured,
    isActive: r.is_active,
    channelId: r.channel_id,
    sort: r.sort,
    channelName: (r.channel as any)?.name ?? null,
  }))
}

export async function getVideoByIdForAdmin(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('videos')
    .select('id, youtube_id, title, subtitle, duration_label, is_featured, is_active, channel_id, sort')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function listChannelsForAdmin(): Promise<Channel[]> {
  return listChannels()
}
