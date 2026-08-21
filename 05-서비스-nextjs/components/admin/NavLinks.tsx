'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLink = { href: string; label: string; external?: boolean }

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const links: NavLink[] = [
    ...(isAdmin ? [{ href: '/admin', label: 'Dashboard' }] : []),
    ...(isAdmin ? [{ href: '/admin/home', label: 'Home' }] : []),
    { href: '/admin/insights', label: 'Insight' },
    { href: '/admin/works', label: 'Work' },
    ...(isAdmin ? [{ href: '/admin/content', label: 'Content' }] : []),
    ...(isAdmin ? [{ href: '/admin/faq', label: 'FAQ' }] : []),
    /* 문의 데이터는 우리 DB 에 없다(README §절대 규칙 — pluug 로만 감) — 그래서 내부 라우트가
       아니라 pluug 대시보드로 바로 나가는 외부 링크다. 로그인 상태면 pluug 가 알아서
       의뢰 목록으로 보내준다. */
    ...(isAdmin ? [{ href: 'https://www.pluuug.com/login', label: '문의', external: true }] : []),
    ...(isAdmin ? [{ href: '/admin/builders', label: 'Builders' }] : []),
    ...(isAdmin ? [{ href: '/admin/approvals', label: '승인 대기' }] : []),
  ]
  return (
    <nav>
      {links.map(l => {
        if (l.external) {
          return (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="nav-ext">
              {l.label} <span className="nav-ext__arr">↗</span>
            </a>
          )
        }
        // '/admin' 은 정확히 일치할 때만 활성화 — startsWith 로 하면 관리자 화면 전체가 걸린다
        const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
        return (
          <Link key={l.href} href={l.href} className={active ? 'on' : ''}>
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
