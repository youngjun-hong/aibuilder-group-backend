'use client'

import { useRouter } from 'next/navigation'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { deleteWork } from './actions'

export default function DeleteWorkButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  return (
    <ConfirmButton
      label="삭제"
      title="Work 삭제"
      body={`"${title}"을(를) 삭제합니다. 되돌릴 수 없습니다.`}
      confirmLabel="삭제"
      action={async () => {
        await deleteWork(id)
        router.refresh()
      }}
    />
  )
}
