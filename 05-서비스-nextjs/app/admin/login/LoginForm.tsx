'use client'

import { useActionState } from 'react'
import { signIn } from './actions'

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(signIn, { error: null })

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-field">
        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="text" autoComplete="email" required />
      </div>
      <div className="admin-field">
        <label htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p className="admin-field error">{state.error}</p>}
      <button className="admin-btn admin-btn--lime" type="submit" disabled={pending}>
        {pending ? '로그인 중…' : '로그인'}
      </button>
    </form>
  )
}
