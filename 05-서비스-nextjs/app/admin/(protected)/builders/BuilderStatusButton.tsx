'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toggleBuilderActive } from './actions'

export default function BuilderStatusButton({ id, isActive, isSelf }: { id: string; isActive: boolean; isSelf: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // 본인 계정은 서버 액션도 막지만, 눌러도 안 되는 버튼을 보여주는 대신 아예 숨긴다
  if (isSelf) return null

  return (
    <button
      type="button"
      className="admin-btn admin-btn--ghost"
      disabled={pending}
      onClick={() => startTransition(async () => { await toggleBuilderActive(id, !isActive); router.refresh() })}
    >
      {isActive ? '회수' : '복구'}
    </button>
  )
}
