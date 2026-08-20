'use client'

import { useState, useTransition } from 'react'
import { resetBuilderPassword } from '../actions'

export default function ResetPasswordButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (password) {
    return (
      <div className="admin-reject-banner">
        <b>새 임시 비밀번호 (한 번만 표시됩니다 — 지금 복사하세요)</b><br />
        <code style={{ fontSize: 16 }}>{password}</code>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setOpen(true)}>
        비밀번호 재발급
      </button>
    )
  }

  return (
    <div className="admin-modal-backdrop" onClick={() => setOpen(false)}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <h3>비밀번호 재발급</h3>
        <p>기존 비밀번호는 즉시 무효화되고 새 임시 비밀번호가 발급됩니다.</p>
        {error && <p className="admin-field error">{error}</p>}
        <div className="row">
          <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setOpen(false)} disabled={pending}>
            취소
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  setPassword(await resetBuilderPassword(id))
                } catch (e) {
                  setError(e instanceof Error ? e.message : '재발급에 실패했습니다')
                }
              })
            }
          >
            {pending ? '처리 중…' : '재발급'}
          </button>
        </div>
      </div>
    </div>
  )
}
