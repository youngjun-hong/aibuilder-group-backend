import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { pageMeta } from '@/app/_meta'
import { getPublishedInsightBySlug, listPublishedInsights } from '@/lib/data/insights'
import './insight-detail.css'
import InsightDetailView from './view'

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
  return <InsightDetailView insight={insight} related={related} />
}
