import { createServiceClient } from '@/lib/supabase/service'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function validateSlugFormat(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

/** 발행 이력이 있는 콘텐츠의 슬러그가 바뀌면 301 리다이렉트 행을 만든다 (FR-A03-05/FR-A05-03). */
export async function recordRedirectOnSlugChange(table: 'works' | 'insights', oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return
  const basePath = table === 'works' ? '/work' : '/insight'
  const service = createServiceClient()
  const { error } = await service
    .from('redirects')
    .upsert({ from_path: `${basePath}/${oldSlug}`, to_path: `${basePath}/${newSlug}` }, { onConflict: 'from_path' })
  if (error) throw error
}

/** archive 전이 시 구 URL을 목록 페이지로 301 (DR-08 — 404가 아니라 301이어야 한다). */
export async function recordRedirectOnArchive(table: 'works' | 'insights', slug: string) {
  const basePath = table === 'works' ? '/work' : '/insight'
  const service = createServiceClient()
  const { error } = await service
    .from('redirects')
    .upsert({ from_path: `${basePath}/${slug}`, to_path: basePath }, { onConflict: 'from_path' })
  if (error) throw error
}

/** archive → published 로 복원될 때는 자동 생성했던 301을 치운다. */
export async function clearRedirectOnRestore(table: 'works' | 'insights', slug: string) {
  const basePath = table === 'works' ? '/work' : '/insight'
  const service = createServiceClient()
  const { error } = await service.from('redirects').delete().eq('from_path', `${basePath}/${slug}`)
  if (error) throw error
}
