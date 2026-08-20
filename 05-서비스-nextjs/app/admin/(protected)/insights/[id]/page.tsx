import { notFound } from 'next/navigation'
import { requireActiveBuilder } from '@/lib/auth/session'
import { getInsightByIdForAdmin } from '@/lib/data/insights'
import { listCategories } from '@/lib/data/categories'
import InsightEditor from './InsightEditor'

export default async function InsightEditPage({ params }: { params: Promise<{ id: string }> }) {
  const builder = await requireActiveBuilder()
  const { id } = await params
  const categories = await listCategories('insight')

  if (id === 'new') {
    return <InsightEditor insight={null} categories={categories} isAdmin={builder.role === 'admin'} />
  }

  const row = await getInsightByIdForAdmin(id)
  if (!row) notFound()
  if (builder.role !== 'admin' && row.author_id !== builder.id) notFound()

  return <InsightEditor insight={row} categories={categories} isAdmin={builder.role === 'admin'} />
}
