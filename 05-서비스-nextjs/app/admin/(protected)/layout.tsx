import Link from 'next/link'
import { requireActiveBuilder } from '@/lib/auth/session'
import LogoutButton from '@/components/admin/LogoutButton'
import NavLinks from '@/components/admin/NavLinks'

/* FR-A00-01 의 2차 방어선(1차는 middleware.ts) + 화면 공통 셸.
   대시보드는 없다(FR-A00-03) — 이 레이아웃 자체가 목록形 화면들을 감쌀 뿐 별도 홈이 없다. */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const builder = await requireActiveBuilder()

  return (
    <>
      <header className="admin-header">
        <Link className="brand" href="/admin/insights">AI 빌더 그룹 · Admin</Link>
        <NavLinks isAdmin={builder.role === 'admin'} />
        <div className="who">
          <span><b>{builder.name}</b> · {builder.role === 'admin' ? '관리자' : '빌더'}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </>
  )
}
