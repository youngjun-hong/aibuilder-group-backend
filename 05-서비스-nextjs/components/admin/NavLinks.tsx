'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const links = [
    { href: '/admin/insights', label: 'Insight' },
    { href: '/admin/works', label: 'Work' },
    ...(isAdmin ? [{ href: '/admin/content', label: 'Content' }] : []),
    ...(isAdmin ? [{ href: '/admin/approvals', label: '승인 대기' }] : []),
  ]
  return (
    <nav>
      {links.map(l => (
        <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? 'on' : ''}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
