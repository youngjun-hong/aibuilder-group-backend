'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { publishWork, rejectWork } from '../works/actions'
import { publishInsight, rejectInsight } from '../insights/actions'

type ContentType = 'work' | 'insight'

/* A-07 — FR-A07-03/04: 승인=발행+재검증, 반려=사유 필수. Work/Insight 각자의 상태 머신
   서버 액션을 그대로 재사용한다(중복 구현 금지). */
export function ApproveButton({ type, id, title }: { type: ContentType; id: string; title: string }) {
  const router = useRouter()
  return (
    <ConfirmButton
      label="승인"
      title="발행 승인"
      body={`"${title}"을(를) 발행합니다. 공개 페이지에 60초 이내 반영됩니다.`}
      confirmLabel="발행"
      variant="default"
      action={async () => {
        if (type === 'work') await publishWork(id)
        else await publishInsight(id)
        router.refresh()
      }}
    />
  )
}

export function RejectApprovalButton({ type, id }: { type: ContentType; id: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return <button type="button" className="admin-btn admin-btn--danger" onClick={() => setOpen(true)}>반려</button>
  }

  return (
    <div className="admin-modal-backdrop" onClick={() => setOpen(false)}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <h3>반려</h3>
        <p>반려 사유는 필수이며 작성자에게 그대로 표시됩니다.</p>
        <textarea
          className="admin-field"
          style={{ width: '100%', minHeight: 80, marginBottom: 12 }}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="반려 사유를 입력하세요"
        />
        {error && <p className="admin-field error">{error}</p>}
        <div className="row">
          <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setOpen(false)} disabled={pending}>취소</button>
          <button
            className="admin-btn admin-btn--danger"
            type="button"
            disabled={pending}
            onClick={async () => {
              if (!reason.trim()) { setError('반려 사유를 입력하세요'); return }
              setPending(true)
              try {
                if (type === 'work') await rejectWork(id, reason)
                else await rejectInsight(id, reason)
                setOpen(false)
                router.refresh()
              } catch (e) {
                setError(e instanceof Error ? e.message : '반려에 실패했습니다')
              } finally {
                setPending(false)
              }
            }}
          >
            {pending ? '처리 중…' : '반려'}
          </button>
        </div>
      </div>
    </div>
  )
}
