'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { InsightCard, InsightDetail } from '@/lib/types'

/* IA §2.2 가 정의한 정식 상세 라우트 — 예전 /insight-detail 폐기 이유는 work/[slug]/view.tsx 상단 주석 참고.
   body_html 은 A-03 편집기(Tiptap)에서 서버 sanitize 를 거쳐 저장된 값이라 그대로 렌더한다. */
export default function InsightDetailView({ insight, related }: { insight: InsightDetail; related: InsightCard[] }) {
  useEffect(() => {
    window.track?.('insight_detail_view', {
      slug: insight.slug,
      category: insight.categorySlug ?? '',
      author_type: 'team',
    })
  }, [insight.slug, insight.categorySlug])

  return (
    <main id="main">
      <div className="wrap art-head">
        <Link className="backlink" href="/insight">인사이트 목록으로</Link>
        <h1>{insight.title}</h1>
        <p className="meta">{insight.categoryName} · {insight.publishedLabel}</p>
      </div>

      <div className="wrap art-body">
        <article className="art">
          {insight.thumbUrl ? (
            <div className="ph ph--tall" style={{ backgroundImage: `url(${insight.thumbUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          ) : (
            <div className="ph ph--tall" data-label="Cover Image"><span className="fx">COVER</span></div>
          )}
          <div dangerouslySetInnerHTML={{ __html: insight.bodyHtml }} />
        </article>
      </div>

      {related.length > 0 && (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 776 }}>
            <h3 className="rel-h">함께 읽기</h3>
            {related.map(a => (
              <Link className="relrow" href={`/insight/${a.slug}`} key={a.slug}>
                <span className="c">{a.categoryName}</span><span className="t">{a.title}</span>
              </Link>
            ))}
            <div className="cta-banner" style={{ marginTop: 52 }}>
              <div>
                <h3>글이 도움되셨나요?</h3>
                <p>프로젝트 이야기를 들려주세요.</p>
              </div>
              <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="insight_detail">문의하기 <span className="arr">→</span></Link>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
