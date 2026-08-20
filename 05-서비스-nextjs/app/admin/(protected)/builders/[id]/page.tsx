import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { getBuilderByIdForAdmin } from '@/lib/data/builders'
import BuilderEditor from './BuilderEditor'

export default async function BuilderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin()
  const { id } = await params
  const row = await getBuilderByIdForAdmin(id)
  if (!row) notFound()

  return <BuilderEditor builder={row} isSelf={row.id === me.id} />
}
