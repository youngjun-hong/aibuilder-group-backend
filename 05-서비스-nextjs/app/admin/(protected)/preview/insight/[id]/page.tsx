import { notFound } from 'next/navigation'
import { requireActiveBuilder } from '@/lib/auth/session'
import { getInsightByIdForPreview } from '@/lib/data/insights'
import '@/app/insight/[slug]/insight-detail.css'
import InsightDetailView from '@/app/insight/[slug]/view'

/* FR-A07-02 — work 미리보기와 동일 원리. */
export default async function InsightPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireActiveBuilder()
  const { id } = await params
  const insight = await getInsightByIdForPreview(id)
  if (!insight) notFound()
  return <InsightDetailView insight={insight} related={[]} />
}
