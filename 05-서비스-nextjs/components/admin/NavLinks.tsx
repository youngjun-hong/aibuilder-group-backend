'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const links = [
    ...(isAdmin ? [{ href: '/admin', label: 'Dashboard' }] : []),
    ...(isAdmin ? [{ href: '/admin/home', label: 'Home' }] : []),
    { href: '/admin/insights', label: 'Insight' },
    { href: '/admin/works', label: 'Work' },
    ...(isAdmin ? [{ href: '/admin/content', label: 'Content' }] : []),
    ...(isAdmin ? [{ href: '/admin/faq', label: 'FAQ' }] : []),
    ...(isAdmin ? [{ href: '/admin/approvals', label: '승인 대기' }] : []),
  ]
  return (
    <nav>
      {links.map(l => {
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
