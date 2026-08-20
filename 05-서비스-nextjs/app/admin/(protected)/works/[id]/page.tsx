import { notFound } from 'next/navigation'
import { requireActiveBuilder } from '@/lib/auth/session'
import { getWorkByIdForAdmin } from '@/lib/data/works'
import { listCategories } from '@/lib/data/categories'
import { listActiveBuildersForPicker } from '@/lib/data/builders'
import WorkEditor from './WorkEditor'

export default async function WorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const builder = await requireActiveBuilder()
  const { id } = await params
  const [categories, builderOptions] = await Promise.all([
    listCategories('work'),
    listActiveBuildersForPicker(),
  ])

  if (id === 'new') {
    return <WorkEditor work={null} categories={categories} builderOptions={builderOptions} isAdmin={builder.role === 'admin'} />
  }

  const row = await getWorkByIdForAdmin(id)
  if (!row) notFound()
  if (builder.role !== 'admin' && row.created_by !== builder.id) notFound()

  return <WorkEditor work={row} categories={categories} builderOptions={builderOptions} isAdmin={builder.role === 'admin'} />
}
