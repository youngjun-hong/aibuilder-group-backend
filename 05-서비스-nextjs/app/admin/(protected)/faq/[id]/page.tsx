import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { getFaqItemByIdForAdmin, listFaqTopicsForAdmin } from '@/lib/data/faq'
import FaqEditor from '../FaqEditor'

export default async function FaqEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const topics = await listFaqTopicsForAdmin()

  if (id === 'new') {
    return <FaqEditor item={null} topics={topics} />
  }

  const row = await getFaqItemByIdForAdmin(id)
  if (!row) notFound()

  return <FaqEditor item={row} topics={topics} />
}
