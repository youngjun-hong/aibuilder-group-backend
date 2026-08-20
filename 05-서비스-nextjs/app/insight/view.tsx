'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRibbonFlow, useDock } from '@/components/fx'
import type { Category, InsightCard } from '@/lib/types'

export default function InsightView({ articles, categories }: { articles: InsightCard[]; categories: Category[] }) {
  useRibbonFlow({
    rsI: [
      '발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ ',
      'READ BEFORE YOU BUILD ✳ 외주 전 필독 ✳ ',
      '실패하는 발주에는 패턴이 있다 ✳ INSIGHT WEEKLY ✳ ',
      'AI BUILDER GROUP ✳ 우리의 생각을 공개합니다 ✳ ',
    ],
  }, { rsI: 5500 })
  useDock('sub')

  /* 카테고리 필터 */
  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>('[data-list] .arow')
    const empty = document.querySelector('[data-empty]') as HTMLElement | null
    document.querySelectorAll<HTMLElement>('.cats button').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.cats button').forEach(x => x.classList.remove('on'))
        b.classList.add('on')
        const cat = b.dataset.cat
        let n = 0
        rows.forEach(r => {
          const show = cat === 'all' || r.dataset.c === cat
          r.style.display = show ? '' : 'none'
          if (show) n++
        })
        if (empty) empty.hidden = n > 0
        history.replaceState(null, '', cat === 'all' ? '#' : '#' + cat)
      })
    })
  }, [])

  return (
    <>
      <main id="main">
        <div className="page-head">
          <div className="wrap">
            <h1><span className="w300">우리의</span> 생각</h1>
            <p>파트너 똑똑한개발자의 실제 인사이트를 함께 발행합니다.</p>
          </div>
        </div>

        {/* v19: 이음새 리본 — 페이지 헤드 ↔ 목록 */}
        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice">
            <path id="rsI" d="M -80,100 C 220,185 480,15 780,100 C 1080,185 1340,15 1700,100" fill="none" />
            <use href="#rsI" className="edge" />
            <use href="#rsI" className="lane" />
            <text>
              <textPath href="#rsI" data-wflow data-unit="4" data-speed="0.02">발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ 발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ </textPath>
            </text>
          </svg>
        </div>

        <div className="wrap ins">
          {/* 카테고리: 전환 시 URL 경로 변경 (실서비스: /insight/[category]) */}
          <nav className="cats" aria-label="카테고리">
            <button className="on" data-cat="all">전체 <span className="cnt">{String(articles.length).padStart(2, '0')}</span></button>
            {categories.map(cat => (
              <button data-cat={cat.slug} key={cat.slug}>
                {cat.name} <span className="cnt">{String(articles.filter(a => a.categorySlug === cat.slug).length).padStart(2, '0')}</span>
              </button>
            ))}
          </nav>

          <div data-list>
            {articles.map(a => (
              <Link className="arow" href={`/insight/${a.slug}`} data-c={a.categorySlug ?? ''} key={a.slug}>
                <img className="athumb" src={a.thumbUrl ?? ''} alt="" loading="lazy" />
                <div>
                  <h3>{a.title}</h3>
                  <span className="cat">{a.categoryName}</span>
                  <p>{a.excerpt}</p>
                  <span className="meta">{a.publishedLabel}</span>
                </div>
              </Link>
            ))}

            <div className="empty" data-empty hidden style={{ marginTop: 24 }}>
              <h3>이 주제의 첫 글을 준비 중입니다</h3>
              <p>다른 카테고리의 글을 먼저 읽어보세요.</p>
            </div>

            <div style={{ textAlign: 'center', marginTop: 40 }}><button className="btn btn--ghost">더 보기</button></div>
          </div>
        </div>
      </main>

      {/* 플로팅 CTA 독 */}
      <div className="dock" data-dock>
        <div className="dock__txt"><b>검증된 바이브 코딩</b><span>무료 문의 — 부담 없이 남겨보세요</span></div>
        <Link className="btn btn--lime btn--sm" href="/contact" data-track="cta_click" data-location="floating">프로젝트 문의 <span className="arr">→</span></Link>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>
    </>
  )
}
