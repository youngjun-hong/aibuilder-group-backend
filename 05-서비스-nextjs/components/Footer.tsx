'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import BrandLink from './BrandLink'

export default function Footer({ content }: { content: Record<string, string> }) {
  const pathname = usePathname()
  /* Gnb.tsx 와 동일한 이유 — /admin/* 는 별도 셸을 쓰므로 공개 푸터를 물려받지 않는다. */
  if (pathname.startsWith('/admin')) return null

  const t = (key: string) => content[key] ?? ''

  return (
    <footer>
      <div className="wrap">
        <div className="ft6">
          <div className="ft6__brand">
            <BrandLink />
            <p>{t('footer.tagline')}</p>
          </div>
          <div className="col">
            <b>Service</b>
            <Link href="/work">Work</Link>
            <Link href="/insight">Insight</Link>
            <Link href="/content">Content</Link>
          </div>
          <div className="col">
            <b>Company</b>
            <Link href="/#how">일하는 방식</Link>
            <Link href="/faq">FAQ</Link>
            <span className="soon">채용 (준비 중)</span>
          </div>
          <div className="col">
            <b>Contact</b>
            <Link href="/contact">프로젝트 문의</Link>
            <a href={`mailto:${t('footer.email')}`}>{t('footer.email')}</a>
          </div>
          <div className="col">
            <b>Social</b>
            <Link href="/content">YouTube</Link>
            <span className="soon">Instagram (예정)</span>
            <span className="soon">LinkedIn (예정)</span>
          </div>
        </div>
        <div className="ft__bottom">
          <span>{t('footer.copyright')}</span>
          <Link href="/privacy">개인정보처리방침</Link>
        </div>
      </div>
    </footer>
  )
}
