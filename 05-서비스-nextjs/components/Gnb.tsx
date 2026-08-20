'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import BrandLink from './BrandLink'

const NAV = [
  { href: '/', label: 'Home', match: (p: string) => p === '/' },
  { href: '/work', label: 'Work', match: (p: string) => p.startsWith('/work') || p.startsWith('/builder') },
  { href: '/insight', label: 'Insight', match: (p: string) => p.startsWith('/insight') },
  { href: '/content', label: 'Content', match: (p: string) => p.startsWith('/content') },
  { href: '/faq', label: 'FAQ', match: (p: string) => p.startsWith('/faq') },
]

export default function Gnb() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* 페이지 이동 시 모바일 메뉴 닫기 */
  useEffect(() => { setOpen(false) }, [pathname])

  /* v22: 오버레이 열림 시 body 스크롤 잠금 (PRD FR-C-04) */
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  /* /admin/* 는 layout.tsx 가 중첩이라 루트의 Gnb/Footer 를 자동으로 물려받는다 — 관리자 화면은
     별도 셸(app/admin/(protected)/layout.tsx)을 쓰므로 여기서 걸러낸다(FR-A00-02 의 취지: 공개
     내비게이션이 관리자 화면에 섞이면 안 된다). */
  if (pathname.startsWith('/admin')) return null

  return (
    <header className={`gnb${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="gnb__in">
        <BrandLink onNavigate={() => setOpen(false)} />
        <button className="gnb__burger" aria-label="메뉴" onClick={() => setOpen(v => !v)}>
          {open ? '✕' : '☰'}
        </button>
        <nav>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={item.match(pathname) ? 'active' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        {/* 문의(진입)·접수 완료 페이지에서는 GNB CTA 미노출 (원본 스펙) */}
        {pathname !== '/contact' && pathname !== '/submit' && (
          <Link className="btn btn--lime btn--sm btn--pulse" href="/contact" data-track="cta_click" data-location="gnb">
            문의하기
          </Link>
        )}
      </div>
    </header>
  )
}
