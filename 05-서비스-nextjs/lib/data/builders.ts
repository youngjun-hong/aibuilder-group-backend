import { createAnonClient as createClient } from '@/lib/supabase/anon'
import { listPublishedWorksForBuilder } from '@/lib/data/works'
import type { BuilderCard, BuilderProfile } from '@/lib/types'

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
