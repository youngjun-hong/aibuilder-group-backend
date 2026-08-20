'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { createBuilder } from '../actions'
import type { CreateBuilderState } from '../actions'

export default function NewBuilderForm() {
  const [state, formAction, pending] = useActionState<CreateBuilderState, FormData>(createBuilder, { error: null })

  if (state.tempPassword) {
    return (
      <>
        <h1>계정 발급 완료</h1>
        <div className="admin-reject-banner">
          <b>임시 비밀번호 (한 번만 표시됩니다 — 지금 복사하세요)</b><br />
          <code style={{ fontSize: 16 }}>{state.tempPassword}</code>
          <p className="hint" style={{ marginTop: 8, marginBottom: 0 }}>
            빌더에게 이메일과 이 비밀번호를 전달하세요. 잊어버렸으면 목록에서 "비밀번호 재발급"으로 새로 만들 수 있습니다.
          </p>
        </div>
        <Link className="admin-btn admin-btn--lime" href="/admin/builders">목록으로</Link>
      </>
    )
  }

  return (
    <>
      <h1>계정 발급</h1>
      <p className="sub">새 빌더 계정을 만듭니다. 임시 비밀번호가 자동 생성되어 한 번만 화면에 표시됩니다.</p>

      <form action={formAction} className="admin-form">
        <div className="admin-field">
          <label htmlFor="name">이름</label>
          <input id="name" name="name" type="text" required />
        </div>

        <div className="admin-field">
          <label htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div className="admin-field">
          <label htmlFor="slug">슬러그</label>
          <input id="slug" name="slug" type="text" required placeholder="hong-gildong" />
          <span className="hint">공개 프로필(/builder?b=슬러그) 주소에 쓰입니다. 영문 소문자·숫자·하이픈만.</span>
        </div>

        <div className="admin-field">
          <label htmlFor="role">권한</label>
          <select id="role" name="role" defaultValue="builder">
            <option value="builder">빌더</option>
            <option value="admin">관리자</option>
          </select>
        </div>

        <div className="admin-field">
          <label htmlFor="role_label">역할 라벨 <span className="hint">(프로필에 표시, 선택)</span></label>
          <input id="role_label" name="role_label" type="text" placeholder="Full-stack Developer" />
        </div>

        {state.error && <p className="admin-field error">{state.error}</p>}

        <div className="admin-actions">
          <button className="admin-btn admin-btn--lime" type="submit" disabled={pending}>
            {pending ? '생성 중…' : '계정 생성'}
          </button>
        </div>
      </form>
    </>
  )
}
