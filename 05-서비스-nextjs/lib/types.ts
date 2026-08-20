/* 관리자·공개 페이지가 공유하는 콘텐츠 타입.
   app/work/view.tsx · app/insight/view.tsx · app/builder/view.tsx 의 로컬 type 선언을 대체한다. */

export type ContentStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived'
export type BuilderRole = 'admin' | 'builder'
export type CategoryType = 'work' | 'insight'

export type Category = {
  id: string
  slug: string
  name: string
  type: CategoryType
  sort: number
}

export type WorkCard = {
  id: string
  slug: string
  title: string
  summary: string
  categorySlug: string | null
  tagLabel: string | null
  year: string
  thumbUrl: string | null
  withTeamLabel: string | null
}

export type WorkBuilderLink = { slug: string; name: string; roleLabel: string | null }

export type WorkDetail = WorkCard & {
  heroUrl: string | null
  bodyProblem: string | null
  bodySolution: string | null
  bodyResult: string | null
  techTags: string[]
  periodLabel: string | null
  scopeLabel: string | null
  resultUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  ogImageUrl: string | null
  status: ContentStatus
  builders: WorkBuilderLink[]
}

export type InsightCard = {
  id: string
  slug: string
  title: string
  excerpt: string
  categorySlug: string | null
  categoryName: string | null
  thumbUrl: string | null
  publishedLabel: string | null
}

export type InsightDetail = InsightCard & {
  bodyHtml: string
  seoTitle: string | null
  seoDescription: string | null
  status: ContentStatus
}

export type BuilderCard = {
  id: string
  slug: string
  name: string
  roleLabel: string | null
  oneLiner: string | null
  stackTags: string[]
  doneCount: number
  isFeatured: boolean
  isNew: boolean
  avatarUrl: string | null
}

export type BuilderPrinciple = { title: string; body: string }
export type BuilderExtraLink = { label: string; href: string }

export type BuilderProfile = BuilderCard & {
  bio: string | null
  focus: string | null
  principles: BuilderPrinciple[]
  extraLink: BuilderExtraLink | null
  works: WorkCard[]
}

/* 관리자 목록/편집 화면용 — 공개 필드 + 상태·작성자·수정일 등 운영 메타 포함 */
export type AdminWorkRow = {
  id: string
  slug: string
  title: string
  status: ContentStatus
  categoryName: string | null
  builderNames: string[]
  updatedAt: string
  rejectReason: string | null
}

export type AdminInsightRow = {
  id: string
  slug: string
  title: string
  status: ContentStatus
  categoryName: string | null
  authorName: string | null
  updatedAt: string
  rejectReason: string | null
}
