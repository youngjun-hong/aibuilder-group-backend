'use client'

import { useState, useTransition } from 'react'

/* FR-A00-06 — 삭제·반려·회수 같은 파괴적 동작은 확인 모달을 거친다. */
export default function ConfirmButton({
  label,
  title,
  body,
  confirmLabel = '확인',
  variant = 'danger',
  action,
}: {
  label: string
  title: string
  body: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
  action: () => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <button type="button" className={`admin-btn admin-btn--${variant === 'danger' ? 'danger' : 'ghost'}`} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <div className="admin-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{title}</h3>
            <p>{body}</p>
            <div className="row">
              <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setOpen(false)} disabled={pending}>
                취소
              </button>
              <button
                type="button"
                className={`admin-btn admin-btn--${variant === 'danger' ? 'danger' : 'lime'}`}
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await action()
                    setOpen(false)
                  })
                }
              >
                {pending ? '처리 중…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
