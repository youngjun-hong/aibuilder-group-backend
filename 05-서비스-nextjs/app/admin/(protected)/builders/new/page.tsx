import { requireAdmin } from '@/lib/auth/session'
import NewBuilderForm from './NewBuilderForm'

export default async function NewBuilderPage() {
  await requireAdmin()
  return <NewBuilderForm />
}
