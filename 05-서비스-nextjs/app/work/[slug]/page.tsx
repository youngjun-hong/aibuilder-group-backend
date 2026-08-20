import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { pageMeta } from '@/app/_meta'
import { getPublishedWorkBySlug, listPublishedWorks } from '@/lib/data/works'
import './work-detail.css'
import WorkDetailView from './view'

export const revalidate = 3600

export async function generateStaticParams() {
  const works = await listPublishedWorks()
  return works.map(w => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const work = await getPublishedWorkBySlug(slug)
  if (!work) return pageMeta({ title: 'Work — AI 빌더 그룹', path: `/work/${slug}` })
  return pageMeta({
    title: `${work.seoTitle ?? work.title} — Work`,
    path: `/work/${slug}`,
    description: work.seoDescription ?? work.summary,
    image: work.ogImageUrl ?? work.heroUrl ?? undefined,
  })
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = await getPublishedWorkBySlug(slug)
  if (!work) notFound()
  return <WorkDetailView work={work} />
}
