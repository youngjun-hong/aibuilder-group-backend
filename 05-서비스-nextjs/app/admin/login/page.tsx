import { getCurrentBuilder } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function AdminLoginPage() {
  const builder = await getCurrentBuilder()
  if (builder) redirect('/admin/insights')

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <h1>관리자 로그인</h1>
        <p className="sub">AI 빌더 그룹 관리자 · 빌더 전용</p>
        <LoginForm />
      </div>
    </div>
  )
}
