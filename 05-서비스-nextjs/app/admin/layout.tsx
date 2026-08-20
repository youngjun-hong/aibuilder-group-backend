import type { Metadata } from 'next'
import './admin.css'

/* FR-A00-02 — /admin/* 전체 noindex (robots.ts 의 disallow 와 이중 방어).
   이 레이아웃은 로그인 화면까지 포함해서 감싸므로 인증 체크는 여기서 하지 않는다
   — 보호가 필요한 화면은 app/admin/(protected)/layout.tsx 가 담당한다. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>
}
