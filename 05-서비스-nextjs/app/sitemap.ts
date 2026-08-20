import type { MetadataRoute } from 'next'
import { SITE_URL } from './_meta'
import { listPublishedWorks } from '@/lib/data/works'
import { listPublishedInsights } from '@/lib/data/insights'

/* 사이트맵이 없으면 색인은 링크를 타고 들어오는 만큼만 된다. 정적 라우트는 손으로 적는 편이
   안전하다 — 파일 시스템을 훑으면 목업용 라우트까지 딸려 들어간다. Work/Insight 상세는
   /work/[slug]·/insight/[slug] 로 발행 슬러그만큼 동적으로 채운다(관리자 발행 시 자동 반영).

   제외:
   · /admin        — 관리자 전용, noindex (FR-A00-02)
   · /image-guide  — 내부 제작 문서. 페이지 자체도 noindex 다.
   · /submit       — 문의 접수 완료 화면. 검색으로 들어올 수 있는 주소가 아니다.

   priority 는 구글이 무시한 지 오래지만 다른 크롤러가 참고하므로 남겨 둔다. */
const ROUTES: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1.0, freq: 'weekly' },
  { path: '/work', priority: 0.9, freq: 'weekly' },
  { path: '/builder', priority: 0.7, freq: 'monthly' },
  { path: '/insight', priority: 0.8, freq: 'weekly' },
  { path: '/content', priority: 0.8, freq: 'weekly' },
  { path: '/faq', priority: 0.7, freq: 'monthly' },
  { path: '/contact', priority: 0.9, freq: 'monthly' },
  { path: '/privacy', priority: 0.3, freq: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* lastModified 를 빌드 시각으로 두면 내용이 그대로여도 배포마다 바뀐다.
     크롤러가 "또 안 바뀌었네"를 반복해서 배우면 신호가 무뎌지므로 아예 넣지 않는다. */
  const staticEntries = ROUTES.map(r => ({
    url: new URL(r.path, SITE_URL).toString(),
    changeFrequency: r.freq,
    priority: r.priority,
  }))

  const [works, insights] = await Promise.all([listPublishedWorks(), listPublishedInsights()])
  const workEntries = works.map(w => ({
    url: new URL(`/work/${w.slug}`, SITE_URL).toString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  const insightEntries = insights.map(a => ({
    url: new URL(`/insight/${a.slug}`, SITE_URL).toString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...workEntries, ...insightEntries]
}
