import { NextResponse } from 'next/server'
import { getBuilderProfileBySlug, listBuildersForWorkPage } from '@/lib/data/builders'

/* app/builder/view.tsx 의 기존 ?b=slug 클라이언트 아키텍처를 그대로 두고,
   로컬 BUILDERS/PROJECTS dict 조회를 이 엔드포인트 fetch 하나로만 바꾼다(최소 diff, DR-02).
   응답 모양은 기존 BuilderDef/ProjectDef 필드명을 그대로 따라서 클라이언트 렌더 로직을 안 건드린다. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile = await getBuilderProfileBySlug(slug)
  if (!profile) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const all = await listBuildersForWorkPage()
  const others = all
    .filter(b => b.slug !== slug)
    .map(b => ({ slug: b.slug, name: b.name, role: b.roleLabel, img: b.avatarUrl }))

  return NextResponse.json({
    no: `B—${String(all.findIndex(b => b.slug === slug) + 1).padStart(3, '0')}`,
    name: profile.name,
    fname: profile.name.replace(/^빌더\s*/, ''),
    lv: profile.isFeatured ? '✳ 이달의 빌더' : profile.isNew ? 'NEW' : 'Builder',
    lead: profile.isFeatured,
    fresh: profile.isNew,
    role: profile.roleLabel,
    img: profile.avatarUrl,
    bio: profile.bio,
    focus: profile.focus,
    stack: profile.stackTags,
    done: profile.doneCount,
    principles: profile.principles.map(p => [p.title, p.body]),
    extra: profile.extraLink,
    projects: profile.works.map(w => ({
      slug: w.slug,
      t: w.title,
      d: w.summary,
      img: w.thumbUrl,
      tag: w.tagLabel,
      yr: w.year,
      w: !!w.withTeamLabel?.startsWith('with 똑똑한개발자'),
    })),
    others,
  })
}
