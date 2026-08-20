import Link from 'next/link'
import { requireActiveBuilder } from '@/lib/auth/session'
import LogoutButton from '@/components/admin/LogoutButton'
import NavLinks from '@/components/admin/NavLinks'

/* FR-A00-01 의 2차 방어선(1차는 middleware.ts) + 화면 공통 셸.
   FR-A00-03 은 로그인 후 첫 화면을 A-02(/admin/insights)로 고정한다 — 유지.
   다만 /admin 자체는 더 이상 그 리다이렉트 전용 스텁이 아니다. 관리자가 직접 찾아가거나
   네비의 "대시보드"를 누르면 통계 화면(admin/(protected)/page.tsx)이 뜬다(사용자 요청으로 신설,
   원 PRD엔 없던 화면). 빌더 계정은 그 페이지 안에서 `/admin/insights` 로 조용히 되돌아간다. */
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
