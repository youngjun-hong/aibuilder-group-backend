import { createAnonClient as createClient } from '@/lib/supabase/anon'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { listPublishedWorksForBuilder } from '@/lib/data/works'
import type { BuilderCard, BuilderProfile, BuilderRole } from '@/lib/types'

const CARD_COLUMNS = 'id, slug, name, role_label, one_liner, stack_tags, done_count, is_featured, is_new, avatar_url'

type BuilderCardRow = {
  id: string
  slug: string
  name: string
  role_label: string | null
  one_liner: string | null
  stack_tags: string[]
  done_count: number
  is_featured: boolean
  is_new: boolean
  avatar_url: string | null
}

function mapBuilderCard(row: BuilderCardRow): BuilderCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    roleLabel: row.role_label,
    oneLiner: row.one_liner,
    stackTags: row.stack_tags ?? [],
    doneCount: row.done_count,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    avatarUrl: row.avatar_url,
  }
}

/** /work 페이지의 "검증된 빌더" 카드 목록 — 활성 빌더만. */
export async function listBuildersForWorkPage(): Promise<BuilderCard[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('builders').select(CARD_COLUMNS).eq('is_active', true).order('created_at')
  if (error) throw error
  return (data as unknown as BuilderCardRow[]).map(mapBuilderCard)
}

/** /builder?b=slug 프로필 — app/api/builders/[slug]/route.ts 에서 호출. */
export async function getBuilderProfileBySlug(slug: string): Promise<BuilderProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('builders')
    .select(`${CARD_COLUMNS}, bio, focus, principles, extra_link`)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const row = data as unknown as BuilderCardRow & {
    bio: string | null
    focus: string | null
    principles: { title: string; body: string }[]
    extra_link: { label: string; href: string } | null
  }
  const works = await listPublishedWorksForBuilder(row.id)

  return {
    ...mapBuilderCard(row),
    bio: row.bio,
    focus: row.focus,
    principles: row.principles ?? [],
    extraLink: row.extra_link,
    works,
  }
}

export async function listActiveBuildersForPicker(): Promise<{ id: string; slug: string; name: string; roleLabel: string | null }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('builders').select('id, slug, name, role_label').eq('is_active', true).order('name')
  if (error) throw error
  return (data ?? []).map(r => ({ id: r.id, slug: r.slug, name: r.name, roleLabel: r.role_label }))
}

/* ── 관리자 — A-06 빌더 관리 (03-백로그: 계정 발급·회수, 회수 시 콘텐츠는 유지) ── */

export type AdminBuilderRow = {
  id: string
  slug: string
  name: string
  email: string
  role: BuilderRole
  roleLabel: string | null
  isActive: boolean
  isFeatured: boolean
  doneCount: number
  createdAt: string
}

export async function listBuildersForAdmin(): Promise<AdminBuilderRow[]> {
  const supabase = await createSessionClient()
  const { data, error } = await supabase
    .from('builders')
    .select('id, slug, name, email, role, role_label, is_active, is_featured, done_count, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    email: r.email,
    role: r.role,
    roleLabel: r.role_label,
    isActive: r.is_active,
    isFeatured: r.is_featured,
    doneCount: r.done_count,
    createdAt: r.created_at,
  }))
}

export async function getBuilderByIdForAdmin(id: string) {
  const supabase = await createSessionClient()
  const { data, error } = await supabase
    .from('builders')
    .select(`
      id, auth_user_id, slug, name, email, role, role_label, one_liner, avatar_url,
      is_active, bio, focus, stack_tags, principles, extra_link, is_featured, done_count, is_new, created_at
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as {
    id: string
    auth_user_id: string
    slug: string
    name: string
    email: string
    role: BuilderRole
    role_label: string | null
    one_liner: string | null
    avatar_url: string | null
    is_active: boolean
    bio: string | null
    focus: string | null
    stack_tags: string[]
    principles: { title: string; body: string }[]
    extra_link: { label: string; href: string } | null
    is_featured: boolean
    done_count: number
    is_new: boolean
    created_at: string
  } | null
}

/** 슬러그·이메일 유일성 체크 — RLS 로 가려지면 안 되므로 service client(DR-04). */
export async function isBuilderSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = createServiceClient()
  let query = supabase.from('builders').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return !!data
}

export async function isBuilderEmailTaken(email: string, excludeId?: string): Promise<boolean> {
  const supabase = createServiceClient()
  let query = supabase.from('builders').select('id').ilike('email', email)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return !!data
}
