import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { pageMeta, SITE, SITE_URL } from '@/app/_meta'
import { getPublishedInsightBySlug, listPublishedInsights } from '@/lib/data/insights'
import './insight-detail.css'
import InsightDetailView from './view'

/* publishedLabel 은 "{작성자} · YYYY.MM.DD" 형태다(lib/data/insights.ts mapInsightCard —
   날짜가 없으면 작성자만). JSON-LD 는 ISO 날짜가 필요해서 그 안의 YYYY.MM.DD 부분만
   정규식으로 뽑아 역파싱한다 — 별도로 raw published_at 을 뷰 레이어까지 새로 노출시키지
   않기 위한 최소 변경. */
function toIsoDate(label: string | null): string | undefined {
  const match = label?.match(/(\d{4})\.(\d{2})\.(\d{2})/)
  if (!match) return undefined
  const [, y, m, d] = match.map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toISOString()
}

export const revalidate = 3600

export async function generateStaticParams() {
  const insights = await listPublishedInsights()
  return insights.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const insight = await getPublishedInsightBySlug(slug)
  if (!insight) return pageMeta({ title: 'Insight — AI 빌더 그룹', path: `/insight/${slug}` })
  return pageMeta({
    title: `${insight.seoTitle ?? insight.title} — Insight`,
    path: `/insight/${slug}`,
    description: insight.seoDescription ?? insight.excerpt,
    image: insight.thumbUrl ?? undefined,
  })
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const insight = await getPublishedInsightBySlug(slug)
  if (!insight) notFound()
  const related = (await listPublishedInsights()).filter(a => a.slug !== slug).slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: insight.title,
    description: insight.seoDescription ?? insight.excerpt,
    ...(insight.thumbUrl ? { image: insight.thumbUrl } : {}),
    ...(toIsoDate(insight.publishedLabel) ? { datePublished: toIsoDate(insight.publishedLabel) } : {}),
    author: { '@type': 'Organization', name: SITE, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/insight/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <InsightDetailView insight={insight} related={related} />
    </>
  )
}
